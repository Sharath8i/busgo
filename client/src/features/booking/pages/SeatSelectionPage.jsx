import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const SteeringWheelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 text-outline-variant/60">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v8M22 12h-8M12 22v-8M2 12h8" />
  </svg>
);

const SeatIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V14H6V5Z" fill="currentColor" opacity="0.85"/>
    <path d="M4 14C4 13.4477 4.44772 13 5 13H19C19.5523 13 20 13.4477 20 14V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V14Z" fill="currentColor"/>
    <path d="M2 13.5C2 12.6716 2.67157 12 3.5 12C4.32843 12 5 12.6716 5 13.5V18C5 18.8284 4.32843 19.5 3.5 19.5C2.67157 19.5 2 18.8284 2 18V13.5Z" fill="currentColor"/>
    <path d="M19 13.5C19 12.6716 19.6716 12 20.5 12C21.3284 12 22 12.6716 22 13.5V18C22 18.8284 21.3284 19.5 20.5 19.5C19.6716 19.5 19 18.8284 19 18V13.5Z" fill="currentColor"/>
  </svg>
);

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
      toast.error('Failed to sync live seat data');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 30000); // 30s refresh
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
      toast.error('Please log in to select seats'); 
      navigate('/login', { state: { from: { pathname: `/booking/${tripId}` } } }); 
      return; 
    }
    if (seat.status === 'booked' || (seat.status === 'held' && !selectedSeats.includes(seat.seatNumber))) return;

    const isSel = selectedSeats.includes(seat.seatNumber);
    const nextList = isSel ? selectedSeats.filter(s => s !== seat.seatNumber) : [...selectedSeats, seat.seatNumber];

    if (nextList.length > 6) {
      toast.error('You can select a maximum of 6 seats');
      return;
    }

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
      
      const { data } = await fetchSeats(tripId);
      setSeats(data.seats || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed, please retry');
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
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 animate-fade-in font-body">
      <div className="mx-auto max-w-[1440px] px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 bg-white p-8 rounded-[2rem] editorial-shadow-sm border border-outline-variant/10">
          <div>
            <Badge variant="primary" className="mb-4 bg-primary/10 text-primary border-primary/20">Live Seat Matrix</Badge>
            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight uppercase leading-none mb-4">
              Select Your <br />Seat.
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-on-surface-variant">
              <span className="uppercase tracking-widest bg-surface-alt px-3 py-1.5 rounded-lg border border-outline-variant/20 shadow-sm">
                {trip?.busDetails?.busName || 'Premium Fleet'}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-on-surface">{trip?.originCity}</span>
                <span className="opacity-40">➔</span>
                <span className="text-on-surface">{trip?.destinationCity}</span>
              </span>
              <span className="opacity-30">|</span>
              <span className="text-primary">{formatDate(trip?.departureDate)} @ {trip?.departureTime}</span>
            </div>
          </div>
          
          {remaining != null && (
            <div className="bg-on-surface text-white px-8 py-5 rounded-3xl flex items-center gap-6 shadow-2xl shrink-0">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Session Lock Expires</p>
                  <p className="text-3xl font-black tabular-nums">{mins}:{secs}</p>
               </div>
               <div className="h-12 w-px bg-white/20" />
               <div className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
               </div>
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_450px]">
          {/* Main Layout Area */}
          <section className="flex justify-center">
            <Card className="p-0 overflow-hidden bg-white w-full max-w-2xl shadow-xl rounded-[2.5rem] border border-outline-variant/10">
              {/* Layout Legend */}
              <div className="px-10 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-alt">
                <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">Deck V1.0</h2>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                     <SeatIcon className="w-5 h-5 text-surface-container-high" />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <SeatIcon className="w-5 h-5 text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <SeatIcon className="w-5 h-5 text-outline-variant/30" />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Booked</span>
                  </div>
                </div>
              </div>

              {/* Interactive Bus Visualizer */}
              <div className="p-8 md:p-14 flex justify-center bg-[#F1F5F9] relative overflow-hidden">
                 
                 {/* The Bus Body */}
                 <div className="relative border-[3px] border-outline-variant/30 rounded-[4rem] p-8 md:p-12 w-full max-w-sm bg-white shadow-2xl editorial-shadow">
                    
                    {/* Windshield */}
                    <div className="absolute top-0 left-10 right-10 h-8 bg-blue-50/50 rounded-b-3xl border-x-2 border-b-2 border-outline-variant/20 shadow-inner" />
                    
                    {/* Driver Cabin */}
                    <div className="flex justify-between items-center mb-16 pt-8 px-2 relative border-b-2 border-dashed border-outline-variant/20 pb-8">
                       <div className="flex flex-col items-center gap-2">
                         <SteeringWheelIcon />
                         <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Driver</span>
                       </div>
                       <div className="h-16 w-2 bg-outline-variant/20 rounded-full" />
                    </div>

                    {/* Passenger Seats */}
                    <div className="grid grid-cols-5 gap-x-3 gap-y-6">
                       {seats.map((s, idx) => {
                         const isBooked = s.status === 'booked';
                         const isHeld = s.status === 'held' && !selectedSeats.includes(s.seatNumber);
                         const isSel = selectedSeats.includes(s.seatNumber);
                         const isAisle = idx % 4 === 2;
                         
                         const seatElement = (
                           <div className="col-span-1 flex justify-center w-full" key={s.seatNumber}>
                             <button
                               onClick={() => onSeatClick(s)}
                               disabled={isBooked || (isHeld && !isSel)}
                               className={`group relative w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 transform active:scale-95 ${
                                 isSel ? 'bg-primary/10 scale-110 z-10 shadow-lg shadow-primary/20' :
                                 isBooked ? 'bg-transparent cursor-not-allowed' :
                                 isHeld ? 'bg-amber-50 cursor-not-allowed opacity-60' :
                                 'bg-transparent hover:bg-surface-container hover:-translate-y-1'
                               }`}
                               aria-label={`Seat ${s.seatNumber}`}
                             >
                               <SeatIcon className={`w-10 h-10 transition-colors duration-300 ${
                                 isSel ? 'text-primary drop-shadow-md' :
                                 isBooked ? 'text-outline-variant/20' :
                                 isHeld ? 'text-amber-200' :
                                 'text-surface-container-highest group-hover:text-primary/70'
                               }`} />
                               <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1 text-[10px] font-black ${
                                 isSel ? 'text-primary' : 
                                 isBooked ? 'text-outline-variant/40' : 
                                 isHeld ? 'text-amber-600' :
                                 'text-on-surface'
                               }`}>
                                 {s.seatNumber}
                               </span>
                             </button>
                           </div>
                         );

                         return (
                           <React.Fragment key={`frag-${s.seatNumber}`}>
                             {isAisle && <div className="col-span-1 w-full flex items-center justify-center"><div className="h-full w-px bg-outline-variant/10" /></div>}
                             {seatElement}
                           </React.Fragment>
                         );
                       })}
                    </div>
                 </div>
              </div>
            </Card>
          </section>

          {/* Checkout Panel */}
          <aside>
            <Card className="p-8 lg:p-10 sticky top-28 bg-white border border-outline-variant/10 shadow-xl rounded-[2.5rem]">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-on-surface-variant flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Booking Manifest
              </h2>
              
              {selectedSeats.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-outline-variant/30 rounded-3xl bg-surface-alt/50">
                   <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
                     <SeatIcon className="w-8 h-8 text-outline-variant opacity-50" />
                   </div>
                   <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Select seats to initialize <br />transaction layer</p>
                </div>
              ) : (
                <div className="space-y-10 animate-fade-in">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Allocated Nodes</p>
                    <div className="flex flex-wrap gap-3">
                      {selectedSeats.map(sn => (
                        <div key={sn} className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm">
                          <SeatIcon className="w-4 h-4" />
                          <span>{sn}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5 pt-8 border-t border-outline-variant/10">
                    <div className="flex justify-between items-center text-on-surface-variant">
                       <span className="text-xs font-bold uppercase tracking-widest">Base Allocation</span>
                       <span className="text-sm font-black">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant">
                       <span className="text-xs font-bold uppercase tracking-widest">Service Tax (5%)</span>
                       <span className="text-sm font-black">{formatCurrency(gst)}</span>
                    </div>
                    
                    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 flex justify-between items-end mt-4 shadow-inner">
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
                    className="mt-4 !py-4 shadow-lg shadow-primary/20 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Secure Checkout
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </Button>
                </div>
              )}
            </Card>
            
            <div className="mt-8 flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
               256-bit AES Encryption
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
