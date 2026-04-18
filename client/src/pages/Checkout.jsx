import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createBooking, validateCoupon, createPaymentOrder, verifyPayment, payWithWallet } from '../api/bookingAPI';
import { applyCoupon, setPricing, setCurrentBooking, resetBooking } from '../redux/slices/bookingSlice';
import { refreshTokenThunk } from '../redux/slices/authSlice';
import { formatCurrency } from '../utils/format';

const passengerSchema = z.object({
  seatNumber: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1).max(120),
  gender: z.enum(['M', 'F', 'Other']),
  idProofType: z.string().optional(),
  idProofNo: z.string().optional(),
});

const schema = z.object({ passengers: z.array(passengerSchema).min(1) });

const STEPS = ['Travelers', 'Payment'];

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTrip, selectedSeats } = useSelector((s) => s.booking);
  const { user } = useSelector((s) => s.auth);
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discountPreview, setDiscountPreview] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [useWallet, setUseWallet] = useState(false);

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

  if (!selectedTrip || !selectedSeats.length) {
    return (
      <div className="min-h-screen bg-surface-alt pt-20 flex items-center justify-center">
        <div className="card p-12 text-center max-w-sm mx-auto">
          <h2 className="text-xl font-black uppercase tracking-tighter">Session Expired</h2>
          <button onClick={() => navigate('/')} className="btn-primary mt-6 w-full">Home</button>
        </div>
      </div>
    );
  }

  const baseTotal = selectedTrip.baseFare * selectedSeats.length;
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
        toast.success('Discount Applied');
      } else {
        toast.error(data.message || 'Invalid Coupon');
      }
    } catch (e) {
      toast.error('Check failed');
    }
  };

  const openRazorpay = (order, bookingId) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key || !window.Razorpay) { toast.error('Payment Error'); return; }
    const rz = new window.Razorpay({
      key,
      amount: order.amount,
      currency: 'INR',
      order_id: order.orderId,
      name: 'BusGo',
      prefill: { name: user?.fullName, email: user?.email },
      theme: { color: '#2563EB' },
      handler: async (response) => {
        try {
          await verifyPayment({ ...response, bookingId });
          dispatch(setCurrentBooking({ bookingId, pnr: null }));
          dispatch(resetBooking());
          toast.success('Payment Verified');
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
        tripId: selectedTrip.tripId,
        passengers: values.passengers,
        couponCode: couponApplied ? couponCode : undefined,
      });

      if (useWallet && user.walletBalance >= afterDiscount) {
        // Full Wallet Bypass
        await payWithWallet(booking.bookingId);
        dispatch(setCurrentBooking({ bookingId: booking.bookingId, pnr: null }));
        dispatch(resetBooking());
        dispatch(refreshTokenThunk()); // Sync new balance
        toast.success('Paid via BusGo Wallet!');
        navigate(`/booking-confirm/${booking.bookingId}`);
      } else {
        // Standard Razorpay Link
        const { data: order } = await createPaymentOrder(booking.bookingId, booking.breakdown?.total);
        openRazorpay(order, booking.bookingId);
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Transaction Error'); }
    finally { setPaying(false); }
  };

  return (
    <div className="min-h-screen bg-surface-alt pt-20">
      <div className="bg-primary pt-8 pb-10 border-b border-primary-dark">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Complete Booking</h1>
          <div className="mt-6 flex items-center gap-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${step === i + 1 ? 'bg-white text-primary' : 'bg-primary-dark text-primary-light'}`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${step === i + 1 ? 'text-white' : 'text-primary-light'}`}>{s}</span>
                {i === 0 && <div className="h-px w-10 bg-primary-dark ml-2"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            {step === 1 ? (
              <form onSubmit={handleSubmit(() => setStep(2))} className="space-y-6">
                {selectedSeats.map((seat, idx) => (
                  <div key={seat} className="card">
                    <div className="flex items-center gap-2 mb-6 border-b border-surface-border pb-4">
                      <div className="badge bg-primary text-white">Seat {seat}</div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Passenger Details</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Full Name</label>
                        <input {...register(`passengers.${idx}.name`)} className="input-field" placeholder="Eg. John Doe" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Age</label>
                        <input type="number" {...register(`passengers.${idx}.age`)} className="input-field" placeholder="25" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Gender</label>
                        <select {...register(`passengers.${idx}.gender`)} className="input-field">
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="submit" className="btn-primary w-full py-4 text-header uppercase tracking-widest">Review Booking →</button>
              </form>
            ) : (
              <div className="card space-y-6">
                <div className="flex items-center justify-between border-b border-surface-border pb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Final Review</h3>
                  <button onClick={() => setStep(1)} className="text-[10px] font-bold text-primary uppercase">Edit Details</button>
                </div>

                <div className="bg-surface-alt rounded-xl p-4 border border-surface-border">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-black text-text-main uppercase tracking-tighter text-lg">{selectedTrip.from} → {selectedTrip.to}</p>
                    <p className="font-bold text-primary text-sm">{selectedTrip.departureTime}</p>
                  </div>
                  <p className="text-xs text-text-muted font-medium">{selectedTrip.busName} • {selectedSeats.length} Seats</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Tickets ({selectedSeats.length})</span>
                    <span className="font-bold text-text-main">₹{baseTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">GST (5%)</span>
                    <span className="font-bold text-text-main">₹{gst}</span>
                  </div>
                  {discountPreview > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span className="font-bold">Discount</span>
                      <span className="font-bold">-₹{discountPreview}</span>
                    </div>
                  )}
                </div>

                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="COUPON" className="input-field !py-2" />
                    <button onClick={onValidateCoupon} className="btn-secondary !py-2 !px-4 text-xs">Apply</button>
                  </div>
                ) : (
                  <div className="badge bg-green-50 text-success border border-green-200 py-2 w-full justify-center">Coupon Applied</div>
                )}

                <hr className="my-6 border-surface-border" />
                <div className="flex justify-between items-center mb-6">
                  <span className="font-black text-on-surface uppercase tracking-tight">Total Payable</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(afterDiscount)}</span>
                </div>

                {/* WALLET TOGGLE UI */}
                {user?.walletBalance > 0 && (
                  <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-primary">BusGo Wallet Balance</p>
                      <p className="text-sm font-bold text-text-main mt-1">Available: {formatCurrency(user.walletBalance)}</p>
                      {user.walletBalance < afterDiscount && (
                        <p className="text-[10px] text-error font-bold mt-1">Target insufficient for full payment.</p>
                      )}
                    </div>
                    <label className={`relative inline-flex items-center cursor-pointer ${user.walletBalance < afterDiscount ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-surface-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                )}

                <button
                  onClick={handleSubmit(onPay)}
                  disabled={paying}
                  className="w-full h-[52px] bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/30 uppercase tracking-widest disabled:opacity-50"
                >
                  {paying ? 'Processing...' : useWallet && user.walletBalance >= afterDiscount ? `Pay with Wallet (${formatCurrency(afterDiscount)})` : `Pay via Razorpay (${formatCurrency(afterDiscount)})`}
                </button>
                <p className="text-[10px] text-center text-text-muted mt-4 font-bold uppercase tracking-widest">
                  Secure 256-Bit SSL Encryption
                </p>
              </div>
            )}
          </div>
          <aside className="hidden lg:block space-y-6">
            <div className="card space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Route Info</label>
                <p className="font-black text-text-main text-lg uppercase leading-tight">{selectedTrip.from}</p>
                <div className="h-6 w-px bg-surface-border mx-2"></div>
                <p className="font-black text-text-main text-lg uppercase leading-tight">{selectedTrip.to}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Bus</label>
                <p className="text-sm font-bold text-text-main">{selectedTrip.busName}</p>
                <p className="text-xs text-text-muted">{selectedTrip.busType}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Seats</label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedSeats.map(sn => <span key={sn} className="badge bg-surface-alt border border-surface-border text-text-main font-black">#{sn}</span>)}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
