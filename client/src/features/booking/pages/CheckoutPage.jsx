import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTripDetails } from '../../search/searchAPI';
import { createBooking, validateCoupon, createPaymentOrder, verifyPayment, payWithWallet } from '../bookingAPI';
import { selectTrip, applyCoupon, setPricing, setCurrentBooking, resetBooking } from '../bookingSlice';
import { refreshTokenThunk } from '../../auth/authSlice';
import { formatCurrency, formatDate } from '../../../utils/format';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Loading from '../../../components/common/Loading';

const passengerSchema = z.object({
  seatNumber: z.string(),
  name: z.string().min(2, 'Identity name too short'),
  age: z.coerce.number().min(1).max(120),
  gender: z.enum(['M', 'F', 'Other']),
  idProofType: z.string().optional(),
  idProofNo: z.string().optional(),
});

const schema = z.object({ passengers: z.array(passengerSchema).min(1) });

const STEPS = ['Travelers', 'Ledger Sync'];

export default function Checkout() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTrip, selectedSeats } = useSelector((s) => s.booking);
  const { user } = useSelector((s) => s.auth);
  
  const [loading, setLoading] = useState(!selectedTrip);
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discountPreview, setDiscountPreview] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [useWallet, setUseWallet] = useState(false);

  useEffect(() => {
    async function restore() {
      if (selectedTrip) return;
      try {
        setLoading(true);
        const { data } = await fetchTripDetails(tripId);
        dispatch(selectTrip(data.trip || data));
      } catch (e) {
        toast.error('Mission data restoration failed');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, [tripId, selectedTrip, dispatch, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      passengers: selectedSeats.map((seatNumber) => ({
        seatNumber,
        name: user?.fullName || '',
        age: 25,
        gender: 'M',
        idProofType: 'Aadhaar',
        idProofNo: '',
      })),
    },
  });

  if (loading) return <Loading message="Synchronizing Ledger..." />;

  if (!selectedSeats.length) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <Card className="max-w-md w-full p-12 text-center animate-slide-up">
           <span className="text-6xl mb-8 block">🎫</span>
           <h2 className="text-3xl font-black uppercase tracking-tighter text-on-surface">No Node Selected</h2>
           <p className="text-on-surface-variant font-medium text-sm mt-4">You must allocate a fleet position before initializing the ledger.</p>
           <Button className="mt-10" fullWidth onClick={() => navigate(`/seats/${tripId}`)}>Allocate Seats</Button>
        </Card>
      </div>
    );
  }

  const baseTotal = (selectedTrip?.baseFare || 0) * selectedSeats.length;
  const gst = Math.round(baseTotal * 0.05);
  const subtotal = baseTotal + gst;
  const afterDiscount = Math.max(0, subtotal - discountPreview);

  const onValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await validateCoupon(couponCode, subtotal);
      if (data.valid) {
        setDiscountPreview(data.discount || 0);
        setCouponApplied(true);
        dispatch(applyCoupon(couponCode));
        toast.success('Promotional Corridor Authorized');
      } else {
        toast.error(data.message || 'Invalid Token');
      }
    } catch (e) { toast.error('Check failed'); }
  };

  const openRazorpay = (order, bookingId) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key || !window.Razorpay) { toast.error('Gateway Logic Missing'); return; }
    const rz = new window.Razorpay({
      key,
      amount: order.amount,
      currency: 'INR',
      order_id: order.orderId,
      name: 'BusGo Network',
      prefill: { name: user?.fullName, email: user?.email },
      theme: { color: '#000000' },
      handler: async (response) => {
        try {
          await verifyPayment({ ...response, bookingId });
          dispatch(setCurrentBooking({ bookingId, pnr: null }));
          dispatch(resetBooking());
          toast.success('Transaction Confirmed');
          navigate(`/booking-confirm/${bookingId}`);
        } catch (e) { toast.error('Verification failed'); }
      },
    });
    rz.open();
  };

  const onPay = async (values) => {
    setPaying(true);
    try {
      const { data: booking } = await createBooking({
        tripId: selectedTrip._id || selectedTrip.tripId,
        passengers: values.passengers,
        couponCode: couponApplied ? couponCode : undefined,
      });

      if (useWallet && user.walletBalance >= afterDiscount) {
        await payWithWallet(booking.bookingId);
        dispatch(setCurrentBooking({ bookingId: booking.bookingId, pnr: null }));
        dispatch(resetBooking());
        dispatch(refreshTokenThunk());
        toast.success('Wallet Authorized: Paid');
        navigate(`/booking-confirm/${booking.bookingId}`);
      } else {
        const { data: order } = await createPaymentOrder(booking.bookingId, booking.breakdown?.total);
        openRazorpay(order, booking.bookingId);
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Signal Lost'); }
    finally { setPaying(false); }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 animate-fade-in">
      <div className="mx-auto max-w-6xl px-8">
        <header className="mb-12">
           <Badge variant="primary" className="mb-4">Secure Checkout</Badge>
           <h1 className="text-5xl font-black text-on-surface tracking-tighter uppercase leading-none">Process Manifest.</h1>
           
           <div className="mt-10 flex items-center gap-6">
             {STEPS.map((s, i) => (
               <div key={s} className="flex items-center gap-4">
                 <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs ${step === i + 1 ? 'bg-primary text-white shadow-lg' : 'bg-surface-container text-on-surface/20'}`}>
                   0{i + 1}
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${step === i + 1 ? 'text-on-surface' : 'text-on-surface/20'}`}>{s}</span>
                 {i === 0 && <div className="h-px w-10 bg-outline-variant/20 ml-2" />}
               </div>
             ))}
           </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
          <section className="space-y-8 animate-slide-up">
            {step === 1 ? (
              <form onSubmit={handleSubmit(() => setStep(2))} className="space-y-8">
                {selectedSeats.map((seat, idx) => (
                  <Card key={seat} className="p-10 hover:border-primary/20 transition-all border-outline-variant/10">
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-outline-variant/10">
                      <div className="flex items-center gap-4">
                        <Badge variant="primary">HUB NODE {seat}</Badge>
                        <h3 className="text-xs font-black uppercase tracking-widest text-on-surface">Traveler Credentials</h3>
                      </div>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Input label="Operational Name" {...register(`passengers.${idx}.name`)} error={errors.passengers?.[idx]?.name?.message} placeholder="Eg. John Doe" />
                      </div>
                      <Input label="Age Unit" type="number" {...register(`passengers.${idx}.age`)} error={errors.passengers?.[idx]?.age?.message} />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Biological Identity</label>
                        <select {...register(`passengers.${idx}.gender`)} className="w-full h-12 px-6 bg-surface-container rounded-xl font-bold border-2 border-transparent focus:border-primary/20 transition-all outline-none appearance-none">
                           <option value="M">Male Identity</option>
                           <option value="F">Female Identity</option>
                           <option value="Other">Non-Binary</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button type="submit" fullWidth size="lg">Review Transaction Layout ➔</Button>
              </form>
            ) : (
              <div className="space-y-8">
                 <Card className="p-10 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xs font-black uppercase tracking-widest text-primary">Pre-payment Summary</h3>
                       <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit Identities</Button>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm mb-10">
                       <div className="flex justify-between items-center mb-4">
                          <p className="font-black text-on-surface uppercase tracking-tighter text-2xl">{selectedTrip?.originCity} ➜ {selectedTrip?.destinationCity}</p>
                       </div>
                       <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">{selectedTrip?.busDetails?.busName} • {selectedSeats.length} Active Nodes Allocated</p>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-primary/10">
                       <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant font-medium">Core Allocation ({selectedSeats.length} units)</span>
                          <span className="font-black text-on-surface">{formatCurrency(baseTotal)}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant font-medium">Service Protocol (5%)</span>
                          <span className="font-black text-on-surface">{formatCurrency(gst)}</span>
                       </div>
                       {discountPreview > 0 && (
                          <div className="flex justify-between text-sm">
                             <span className="font-black text-success uppercase tracking-widest text-[10px]">Promotional Deduction</span>
                             <span className="font-black text-success">- {formatCurrency(discountPreview)}</span>
                          </div>
                       )}
                    </div>
                 </Card>

                 <Card className="p-10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-8">Financial Allocation</h4>
                    
                    {!couponApplied ? (
                      <div className="flex gap-4 mb-10">
                         <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="PROMO CODE" className="flex-1 px-6 py-4 bg-surface-container rounded-xl font-bold border-2 border-transparent focus:border-primary/20 transition-all outline-none" />
                         <Button variant="ghost" onClick={onValidateCoupon}>Authorize</Button>
                      </div>
                    ) : (
                      <Badge variant="success" className="w-full text-center py-4 mb-10">DISCOUNT PROTOCOL ACTIVE</Badge>
                    )}

                    <div className="flex justify-between items-end mb-12">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Final GTV</p>
                          <p className="text-5xl font-black tracking-tighter text-on-surface leading-none">{formatCurrency(afterDiscount)}</p>
                       </div>
                    </div>

                    {user?.walletBalance > 0 && (
                      <div className="mb-10 p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl bg-primary/10 text-primary`}>💳</div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-primary leading-none mb-1">BusGo Credits</p>
                              <p className="text-sm font-black text-on-surface">Hub Balance: {formatCurrency(user.walletBalance)}</p>
                           </div>
                        </div>
                        <input
                          type="checkbox"
                          disabled={user.walletBalance < afterDiscount}
                          checked={useWallet}
                          onChange={(e) => setUseWallet(e.target.checked)}
                          className="h-6 w-6 rounded-lg border-2 border-primary/40 text-primary focus:ring-primary accent-primary cursor-pointer disabled:opacity-30"
                        />
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit(onPay)}
                      loading={paying}
                      fullWidth
                      size="lg"
                    >
                      {paying ? 'Verifying...' : useWallet && user.walletBalance >= afterDiscount ? `Debit Wallet (${formatCurrency(afterDiscount)})` : `Initialize Checkout (${formatCurrency(afterDiscount)})`}
                    </Button>
                 </Card>
              </div>
            )}
          </section>

          <aside className="hidden lg:block">
            <Card className="p-10 sticky top-24 border-outline-variant/10">
               <div className="space-y-12">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 block">Voyage Corridor</label>
                    <div className="flex items-center gap-6">
                       <div className="h-3 w-3 rounded-full bg-primary" />
                       <p className="text-xl font-black text-on-surface uppercase tracking-tight">{selectedTrip?.originCity}</p>
                    </div>
                    <div className="h-10 w-[2px] bg-outline-variant/10 ml-[5px] my-1" />
                    <div className="flex items-center gap-6">
                       <div className="h-3 w-3 rounded-full bg-tertiary" />
                       <p className="text-xl font-black text-on-surface uppercase tracking-tight">{selectedTrip?.destinationCity}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Fleet Unit</label>
                    <p className="text-sm font-black text-on-surface uppercase">{selectedTrip?.busDetails?.busName || 'Fleet Node'}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mt-1">SLA Level: Executive High-Deck</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 block">Node Allocation</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(sn => <Badge key={sn} variant="neutral" className="!bg-surface-container !border-none !text-on-surface-variant font-black">NODE {sn}</Badge>)}
                    </div>
                  </div>
               </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
