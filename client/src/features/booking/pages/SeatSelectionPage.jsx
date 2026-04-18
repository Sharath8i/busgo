import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchSeats, fetchTripDetails, holdSeats, releaseSeats } from '../../search/searchAPI';
import { toggleSeat, setSelectedSeats } from '../bookingSlice';
import { formatCurrency, formatDate } from '../../../utils/format';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Loading from '../../../components/common/Loading';

const HOLD_MS = 10 * 60 * 1000;

export default function SeatSelection() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedSeats } = useSelector((s) => s.booking);
  const { accessToken } = useSelector((s) => s.auth);
  
  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [{ data: seatData }, { data: tripData }] = await Promise.all([
        fetchSeats(tripId),
        fetchTripDetails(tripId)
      ]);
      setSeats(seatData.seats || []);
      setTrip(tripData.trip || tripData);
    } catch (e) {
      toast.error('Tactical data sync failed');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 30000);
    return () => clearInterval(id);
  }, [loadData]);

  useEffect(() => {
    if (!deadline) { setRemaining(null); return; }
    const tick = () => {
      const r = Math.max(0, deadline - Date.now());
      setRemaining(r);
      if (r <= 0) {
        toast.error('Hold session expired');
        releaseSeats(tripId, selectedSeats).catch(() => {});
        dispatch(setSelectedSeats([]));
        navigate('/');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, tripId, selectedSeats, dispatch, navigate]);

  const onSeatClick = async (seat) => {
    if (!accessToken) { 
      toast.error('Authentication required'); 
      navigate('/login', { state: { from: { pathname: `/booking/${tripId}` } } }); 
      return; 
    }
    if (seat.status === 'booked' || (seat.status === 'held' && !selectedSeats.includes(seat.seatNumber))) return;

    const isSel = selectedSeats.includes(seat.seatNumber);
    const nextList = isSel ? selectedSeats.filter(s => s !== seat.seatNumber) : [...selectedSeats, seat.seatNumber];

    try {
      if (isSel) {
        await releaseSeats(tripId, [seat.seatNumber]);
        dispatch(toggleSeat(seat.seatNumber));
        if (nextList.length === 0) setDeadline(null);
      } else {
        await holdSeats(tripId, nextList);
        dispatch(toggleSeat(seat.seatNumber));
        if (selectedSeats.length === 0) setDeadline(Date.now() + HOLD_MS);
      }
      // Re-fetch seats immediately
      const { data } = await fetchSeats(tripId);
      setSeats(data.seats || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Signal lost');
    }
  };

  const baseFare = trip?.baseFare ?? 0;
  const subtotal = baseFare * selectedSeats.length;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  const mins = Math.floor((remaining ?? 0) / 60000);
  const secs = String(Math.floor(((remaining ?? 0) % 60000) / 1000)).padStart(2, '0');

  if (loading && !trip) return <Loading message="Initializing Deck Layout..." />;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 animate-fade-in">
      <div className="mx-auto max-w-7xl px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <Badge variant="primary" className="mb-4">Live Seat Matrix</Badge>
            <h1 className="text-5xl font-black text-on-surface tracking-tighter uppercase leading-none">Select Your <br />Position.</h1>
            <p className="mt-6 text-on-surface-variant font-medium flex items-center gap-4">
              <span className="uppercase text-[10px] font-black tracking-widest bg-surface-container px-2 py-1 rounded">{trip?.busDetails?.busName || 'Fleet Node'}</span>
              <span>{trip?.originCity} → {trip?.destinationCity}</span>
              <span className="opacity-30">|</span>
              <span>{formatDate(trip?.departureDate)} @ {trip?.departureTime}</span>
            </p>
          </div>
          
          {remaining != null && (
            <Card className="!bg-on-surface !text-white px-8 py-4 !rounded-2xl flex items-center gap-6 shadow-2xl">
               <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Session Lock</p>
                  <p className="text-2xl font-black tabular-nums">{mins}:{secs}</p>
               </div>
               <div className="h-10 w-px bg-white/10" />
               <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            </Card>
          )}
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Deck Layout */}
          <section>
            <Card className="p-0 overflow-hidden bg-white">
              <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
                <h2 className="text-sm font-black uppercase tracking-widest">Deck Layout V1.0</h2>
                <div className="flex items-center gap-6">
                  {['available', 'booked', 'selected'].map(s => (
                    <div key={s} className="flex items-center gap-2">
                       <div className={`h-3 w-3 rounded-full border ${
                         s === 'available' ? 'bg-surface-container border-outline-variant' :
                         s === 'booked' ? 'bg-outline-variant opacity-20' : 'bg-primary border-primary'
                       }`} />
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-12 flex justify-center bg-surface-container-low/10">
                 <div className="relative border-2 border-outline-variant/20 rounded-[3rem] p-12 max-w-sm w-full bg-white shadow-2xl overflow-hidden">
                    {/* Bus Features */}
                    <div className="absolute top-8 left-8 text-2xl opacity-10">🛡️</div>
                    <div className="absolute bottom-8 right-8 text-2xl opacity-10 font-black italic">BusGo</div>

                    {/* Dashboard/Driver Area */}
                    <div className="flex justify-between items-center mb-16 px-4">
                       <div className="h-12 w-1.5 bg-outline-variant rounded-full opacity-20" />
                       <div className="h-10 w-10 rounded-full border-4 border-outline-variant/10 flex items-center justify-center text-xl grayscale opacity-20">🔘</div>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                       {seats.map(s => {
                         const isBooked = s.status === 'booked';
                         const isHeld = s.status === 'held' && !selectedSeats.includes(s.seatNumber);
                         const isSel = selectedSeats.includes(s.seatNumber);
                         
                         return (
                           <button
                             key={s.seatNumber}
                             onClick={() => onSeatClick(s)}
                             disabled={isBooked || (isHeld && !isSel)}
                             className={`h-12 rounded-xl text-[10px] font-black transition-all duration-300 transform active:scale-90 ${
                               isSel ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10' :
                               isBooked ? 'bg-outline-variant/20 text-on-surface/20 cursor-not-allowed border-none' :
                               isHeld ? 'bg-amber-100 text-amber-900 border-amber-200 cursor-not-allowed scale-95 opacity-50' :
                               'bg-white border-2 border-outline-variant/20 text-on-surface hover:border-primary/50'
                             }`}
                           >
                             {s.seatNumber}
                           </button>
                         );
                       })}
                    </div>
                 </div>
              </div>
            </Card>
          </section>

          {/* Ledger / Checkout Panel */}
          <aside>
            <Card className="p-10 sticky top-24">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-10 text-on-surface-variant">Booking Manifest</h2>
              
              {selectedSeats.length === 0 ? (
                <div className="py-12 text-center opacity-40">
                   <p className="text-4xl mb-6">🎫</p>
                   <p className="text-[10px] font-black uppercase tracking-widest">Select seats to initialize <br />transaction layer</p>
                </div>
              ) : (
                <div className="space-y-10 animate-slide-up">
                  <div className="flex flex-wrap gap-3">
                    {selectedSeats.map(sn => (
                      <Badge key={sn} variant="primary" className="!px-4 !py-2">NODE {sn}</Badge>
                    ))}
                  </div>

                  <div className="space-y-6 pt-10 border-t border-outline-variant/10">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Base Allocation</span>
                       <span className="text-sm font-black text-on-surface">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Service Tax (5%)</span>
                       <span className="text-sm font-black text-on-surface">{formatCurrency(gst)}</span>
                    </div>
                    <div className="h-px bg-outline-variant/10 pt-4" />
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total Payable</p>
                          <p className="text-4xl font-black tracking-tighter text-on-surface leading-none">{formatCurrency(total)}</p>
                       </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/checkout/${tripId}`)}
                    fullWidth
                    size="lg"
                    className="mt-6"
                  >
                    Confirm Selection ➔
                  </Button>
                </div>
              )}
            </Card>
            
            <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
               Secure Payment via Stripe Encryption
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
