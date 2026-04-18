import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { myBookings, cancelBooking } from '../api/bookingAPI';
import { formatCurrency } from '../utils/format';
import { useDispatch } from 'react-redux';
import { refreshTokenThunk } from '../redux/slices/authSlice';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function BookingCard({ b, tab, onCancel }) {
  const trip = b.tripId;
  const sched = trip?.scheduleId;
  const route = sched?.routeId;

  return (
    <article className="card !p-0 overflow-hidden hover:shadow-soft transition-all">
      <div className="flex items-center justify-between px-6 py-3 border-b border-surface-border bg-surface-alt">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-primary uppercase tracking-widest">{b.pnr}</span>
          <span className={`badge ${
            b.bookingStatus === 'confirmed' ? 'bg-green-50 text-success border border-green-200' :
            b.bookingStatus === 'cancelled' ? 'bg-red-50 text-error border border-red-200' :
            'bg-warning/10 text-warning border border-warning/30'
          }`}>
            {b.bookingStatus}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase text-text-muted">{b.paymentStatus}</span>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-black text-text-main uppercase tracking-tighter">
              {route ? `${route.originCity} → ${route.destinationCity}` : 'Service Request'}
            </h3>
            <p className="text-xs font-bold text-text-muted mt-2 uppercase tracking-wider">
               {b.passengers?.length} Travelers • Seat {b.passengers?.map(p => p.seatNumber).join(', ')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
               {b.passengers?.map(p => (
                 <span key={p.seatNumber} className="text-[10px] font-bold text-text-muted bg-surface-alt border border-surface-border px-2 py-0.5 rounded uppercase">
                    {p.name}
                 </span>
               ))}
            </div>
          </div>

          <div className="text-right flex flex-col items-end justify-between self-stretch">
            <p className="text-2xl font-black text-primary">{formatCurrency(b.totalAmount)}</p>
            <div className="flex gap-2">
               <Link to={`/booking-confirm/${b._id}`} className="btn-secondary !py-1.5 !px-4 text-[10px] uppercase tracking-widest">
                  Ticket
               </Link>
               {tab === 'upcoming' && b.paymentStatus === 'paid' && (
                 <button onClick={() => onCancel(b._id)} className="btn-ghost !py-1.5 !px-4 text-[10px] uppercase tracking-widest text-error hover:bg-red-50">
                    Cancel
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MyBookings() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('upcoming');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await myBookings({ status: tab, limit: 20 });
      setItems(data.items || []);
    } catch { toast.error('History load failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const executeCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelBooking(cancelTarget._id, 'User cancel');
      toast.success('Cancelled & refunded to wallet');
      load();
      dispatch(refreshTokenThunk());
      setCancelTarget(null);
    } catch { toast.error('Server error'); }
  };

  return (
    <div className="min-h-screen bg-surface-alt pt-20 pb-20 relative">
      <div className="bg-primary pt-8 pb-10 border-b border-primary-dark">
        <div className="mx-auto max-w-4xl px-6">
           <h1 className="text-3xl font-black text-white uppercase tracking-tighter">My Bookings</h1>
           <p className="mt-1 text-sm font-medium text-primary-light uppercase tracking-widest">Journey History</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex gap-2 border-b border-surface-border mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button
               key={t.key}
               onClick={() => setTab(t.key)}
               className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main hover:border-surface-border'}`}
            >
               {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
           {loading ? (
             <div className="py-20 text-center text-text-muted uppercase font-black tracking-widest text-xs">Syncing Transactions...</div>
           ) : items.length === 0 ? (
             <div className="card text-center py-20 bg-white">
                <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-6">No {tab} records found</p>
                {tab === 'upcoming' && <Link to="/" className="btn-primary">Search Now</Link>}
             </div>
           ) : (
             items.map(b => <BookingCard key={b._id} b={b} tab={tab} onCancel={() => setCancelTarget(b)} />)
           )}
        </div>
      </div>

      {/* CANCELLATION MODAL */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-[2rem] editorial-shadow overflow-hidden border border-outline-variant/10 animate-slide-up">
             <div className="bg-error/10 p-6 flex flex-col items-center border-b border-error/20">
               <div className="w-16 h-16 bg-error flex items-center justify-center rounded-full text-white text-3xl mb-4 shadow-lg shadow-error/30">
                 !
               </div>
               <h2 className="text-2xl font-black uppercase tracking-tight text-error text-center">Cancel Ticket?</h2>
               <p className="text-sm font-bold text-error/80 mt-1 uppercase tracking-widest text-center">PNR: {cancelTarget.pnr}</p>
             </div>
             
             <div className="p-8 text-center space-y-4">
               <p className="text-on-surface-variant font-medium">
                 Are you absolutely sure you want to terminate this journey?
               </p>
               <div className="bg-surface-container-low p-4 rounded-xl border border-surface-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Instant Settlement</p>
                  <p className="text-sm text-text-main">
                    The eligible refund amount will be credited directly to your <strong>BusGo Wallet Balance</strong> immediately.
                  </p>
               </div>
             </div>

             <div className="flex gap-4 p-6 pt-0">
               <button 
                 onClick={() => setCancelTarget(null)}
                 className="flex-1 py-4 bg-surface-container-low hover:bg-surface-container border border-surface-border text-on-surface text-xs font-black uppercase tracking-widest rounded-xl transition-all"
               >
                 Keep Ticket
               </button>
               <button 
                 onClick={executeCancel}
                 className="flex-1 py-4 bg-error hover:bg-error/90 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-error/20 hover:scale-[1.02] active:scale-95 transition-all"
               >
                 Yes, Destroy it
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
