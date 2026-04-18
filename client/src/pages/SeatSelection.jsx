import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchSeats, holdSeats, releaseSeats } from '../api/searchAPI';
import { toggleSeat, setSelectedSeats } from '../redux/slices/bookingSlice';
import { formatCurrency } from '../utils/format';

const HOLD_MS = 10 * 60 * 1000;

export default function SeatSelection() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTrip, selectedSeats } = useSelector((s) => s.booking);
  const { accessToken } = useSelector((s) => s.auth);
  const [seats, setSeats] = useState([]);
  const [busName, setBusName] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await fetchSeats(tripId);
      setSeats(data.seats || []);
      setBusName(data.busName || '');
    } catch (e) {
      toast.error('Could not load seat layout');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!deadline) { setRemaining(null); return; }
    const seatsSnapshot = [...selectedSeats];
    const tick = () => {
      const r = Math.max(0, deadline - Date.now());
      setRemaining(r);
      if (r <= 0) {
        toast.error('Session expired');
        releaseSeats(tripId, seatsSnapshot).catch(() => { });
        dispatch(setSelectedSeats([]));
        navigate('/search');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, tripId, selectedSeats, dispatch, navigate]);

  const baseFare = selectedTrip?.baseFare ?? 0;

  const onSeatClick = async (seat) => {
    if (!accessToken) { toast.error('Please log in'); navigate('/login'); return; }
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
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
      load();
    }
  };

  const total = baseFare * selectedSeats.length;
  const mins = Math.floor((remaining ?? 0) / 60000);
  const secs = String(Math.floor(((remaining ?? 0) % 60000) / 1000)).padStart(2, '0');

  const getSeatClass = (s) => {
    if (s.status === 'booked') return 'seat-booked';
    if (s.status === 'held' && !selectedSeats.includes(s.seatNumber)) return 'seat-held';
    if (selectedSeats.includes(s.seatNumber)) return 'seat-selected';
    return 'seat-available';
  };

  return (
    <div className="min-h-screen bg-surface-alt pt-20">
      <div className="bg-primary pt-8 pb-10 border-b border-primary-dark">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Choose Your Seat</h1>
          <p className="mt-1 text-sm font-medium text-primary-light">
            {busName} • {selectedTrip?.departureTime} • ₹{baseFare} per seat
          </p>
        </div>
      </div>

      {remaining != null && remaining > 0 && (
        <div className="bg-warning text-white px-6 py-2 text-center text-xs font-black uppercase tracking-widest shadow-sm">
          Seats are held for {mins}:{secs}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Layout */}
          <div className="card">
            <div className="flex items-center justify-between mb-8 border-b border-surface-border pb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-text-main">Bus Layout</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><div className="h-4 w-4 rounded-md border border-green-200 bg-green-50"></div><span className="text-[10px] font-bold text-text-muted uppercase">Available</span></div>
                <div className="flex items-center gap-1.5"><div className="h-4 w-4 rounded-md border border-red-200 bg-red-50"></div><span className="text-[10px] font-bold text-text-muted uppercase">Booked</span></div>
                <div className="flex items-center gap-1.5"><div className="h-4 w-4 rounded-md border border-primary-dark bg-primary"></div><span className="text-[10px] font-bold text-text-muted uppercase">Selected</span></div>
              </div>
            </div>

            <div className="flex justify-center py-10">
              <div className="relative border-4 border-surface-border rounded-xl3 p-10 max-w-md w-full bg-white">
                <div className="absolute top-4 left-4 h-12 w-12 border-2 border-surface-border rounded-xl flex items-center justify-center text-xl grayscale opacity-20">🚌</div>

                <div className="grid grid-cols-4 gap-4">
                  {loading ? <div className="col-span-4 py-20 text-center text-text-muted">Loading Layout...</div> :
                    seats.map(s => (
                      <button
                        key={s.seatNumber}
                        onClick={() => onSeatClick(s)}
                        className={`${getSeatClass(s)} flex items-center justify-center font-bold text-xs`}
                      >
                        {s.seatNumber}
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xs font-black uppercase tracking-widest text-text-main mb-6">Booking Details</h2>
              {selectedSeats.length === 0 ? (
                <p className="text-center text-xs text-text-muted py-8">Select seats to proceed.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(sn => (
                      <div key={sn} className="badge bg-primary text-white">Seat {sn}</div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-surface-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Base Fare</span>
                      <span className="font-bold text-text-main">₹{total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Tax (GST)</span>
                      <span className="font-bold text-text-main">₹{Math.round(total * 0.05)}</span>
                    </div>
                    <div className="flex justify-between text-lg pt-2 border-t border-surface-border">
                      <span className="font-black text-text-main uppercase tracking-tighter">Total</span>
                      <span className="font-black text-primary">₹{Math.round(total * 1.05)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="btn-primary w-full mt-4"
                  >
                    Proceed to Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
