import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { myBookings, cancelBooking } from '../bookingAPI';
import { formatCurrency, formatDate } from '../../../utils/format';
import { useDispatch } from 'react-redux';
import { refreshTokenThunk } from '../../auth/authSlice';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';

const TABS = [
  { key: 'upcoming', label: 'Authorized' },
  { key: 'completed', label: 'Archived' },
  { key: 'cancelled', label: 'Terminated' },
];

function BookingCard({ b, tab, onCancel }) {
  const trip = b.tripId;
  const sched = trip?.scheduleId;
  const route = sched?.routeId;

  const statusVariant = 
    b.bookingStatus === 'confirmed' ? 'success' :
    b.bookingStatus === 'cancelled' ? 'error' : 'warning';

  return (
    <Card className="!p-0 overflow-hidden hover:border-primary/20 transition-all group">
      <div className="flex items-center justify-between px-8 py-4 border-b border-outline-variant/10 bg-surface-container-low/30">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{b.pnr}</span>
          <Badge variant={statusVariant}>{b.bookingStatus}</Badge>
        </div>
        <span className="text-[10px] font-black uppercase text-on-surface-variant opacity-40">{b.paymentStatus} via Protocol</span>
      </div>

      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <h3 className="text-3xl font-black text-on-surface uppercase tracking-tighter leading-none mb-4">
              {route ? `${route.originCity} ➔ ${route.destinationCity}` : 'Service Identity'}
            </h3>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
               <span>{b.passengers?.length} Operators Allocated</span>
               <span className="h-1 w-1 rounded-full bg-outline-variant" />
               <span>Allocation Node {b.passengers?.map(p => p.seatNumber).join(', ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">GTV</p>
              <p className="text-2xl font-black text-on-surface leading-none">{formatCurrency(b.totalAmount)}</p>
            </div>
            
            <div className="flex gap-2">
               <Link to={`/booking-confirm/${b._id}`}>
                  <Button variant="ghost" size="sm">Ticket</Button>
               </Link>
               {tab === 'upcoming' && b.paymentStatus === 'paid' && (
                 <Button variant="ghost" size="sm" onClick={() => onCancel(b)} className="text-error border-error/10 hover:bg-error/5 hover:border-error/20">
                    Abort
                 </Button>
               )}
            </div>
          </div>
        </div>
      </div>
    </Card>
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
    } catch { toast.error('Signal transmission failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const executeCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelBooking(cancelTarget._id, 'User termination protocol');
      toast.success('Funds rerouted to wallet hub');
      load();
      dispatch(refreshTokenThunk());
      setCancelTarget(null);
    } catch { toast.error('Termination sequence error'); }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-24 animate-fade-in">
      <div className="mx-auto max-w-5xl px-8">
        <header className="mb-12">
            <Badge variant="primary" className="mb-4">Voyage Ledger</Badge>
            <h1 className="text-5xl font-black text-on-surface tracking-tighter uppercase leading-none">Command Center.</h1>
            <p className="mt-6 text-on-surface-variant font-medium text-sm">Monitor and manage all active and archived transit sequences.</p>
        </header>

        <div className="flex gap-10 border-b border-outline-variant/10 mb-12">
          {TABS.map(t => (
            <button
               key={t.key}
               onClick={() => setTab(t.key)}
               className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                 tab === t.key ? 'text-primary' : 'text-on-surface/40 hover:text-on-surface'
               }`}
            >
               {t.label}
               {tab === t.key && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        <div className="space-y-6">
           {loading ? (
             <div className="py-24"><Loading message="Syncing Distributed Ledger..." /></div>
           ) : items.length === 0 ? (
             <Card className="py-24 flex flex-col items-center text-center">
                <span className="text-5xl mb-8 block opacity-20">📂</span>
                <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs mb-10">No {tab} sequences found in registry</p>
                {tab === 'upcoming' && <Link to="/"><Button>Initialize New Search ➔</Button></Link>}
             </Card>
           ) : (
             <div className="grid gap-6 animate-slide-up">
                {items.map(b => <BookingCard key={b._id} b={b} tab={tab} onCancel={setCancelTarget} />)}
             </div>
           )}
        </div>
      </div>

      {/* TERMINATION MODAL */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/90 backdrop-blur-2xl p-8 animate-fade-in">
          <Card className="max-w-md w-full p-0 overflow-hidden border-none text-center animate-slide-up bg-white">
             <div className="bg-error/5 p-12 flex flex-col items-center">
               <div className="w-24 h-24 bg-error text-white flex items-center justify-center rounded-[2.5rem] text-4xl mb-8 shadow-2xl shadow-error/30 scale-110 font-black">!</div>
               <h2 className="text-4xl font-black uppercase tracking-tighter text-error leading-none">Terminate Ticket?</h2>
               <p className="text-[10px] font-black text-error opacity-40 mt-4 uppercase tracking-[0.3em]">PNR CLASSIFICATION: {cancelTarget.pnr}</p>
             </div>
             
             <div className="p-12 space-y-8">
                <p className="text-on-surface-variant font-medium text-sm">Confirm immediate termination of this journey sequence. This action is irreversible.</p>
                
                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 text-left">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary mb-2">Refund Protocol Active</p>
                   <p className="text-xs font-bold text-on-surface leading-relaxed">The identified capital will be credited to your <strong>Node Wallet</strong> instantly upon authorization.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="ghost" fullWidth onClick={() => setCancelTarget(null)}>Maintain Node</Button>
                  <Button fullWidth className="!bg-error hover:!bg-error/90" onClick={executeCancel}>Authorize Abort</Button>
                </div>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
}
