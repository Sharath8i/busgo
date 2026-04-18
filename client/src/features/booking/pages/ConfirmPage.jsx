import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { getBooking } from '../bookingAPI';
import api from '../../../api/axiosInstance';
import { formatCurrency, formatDate } from '../../../utils/format';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Loading from '../../../components/common/Loading';
import toast from 'react-hot-toast';

export default function BookingConfirm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [err, setErr] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getBooking(bookingId);
        if (!cancelled) setBooking(data);
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || 'Failed to load booking');
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId]);

  useEffect(() => {
    if (booking?.pnr) {
      confetti({ 
        particleCount: 200, 
        spread: 80, 
        origin: { y: 0.6 }, 
        colors: ['#000000', '#2563EB', '#E2E8F0'] 
      });
    }
  }, [booking?.pnr]);

  if (err) {
    return (
      <div className="min-h-screen bg-surface pt-24 flex items-center justify-center p-8">
        <Card className="max-w-md w-full p-12 text-center animate-slide-up">
          <span className="text-6xl mb-8 block">⚠️</span>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-on-surface">Ticket Unresolved</h2>
          <p className="text-on-surface-variant font-medium text-sm mt-4">We were unable to synchronize this booking ID with the national registry.</p>
          <Button className="mt-10" fullWidth onClick={() => navigate('/my-bookings')}>View Your Bookings</Button>
        </Card>
      </div>
    );
  }

  if (!booking) return <Loading message="Provisioning Digital Ticket..." />;

  const trip = booking.tripId;
  const sched = trip?.scheduleId;
  const route = sched?.routeId;
  const bus = sched?.busId;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/bookings/${bookingId}/ticket`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BusGo-Ticket-${booking.pnr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('PDF generation protocol failed'); }
    finally { setDownloading(false); }
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-24 animate-fade-in">
      <div className="mx-auto max-w-3xl px-8">
        <div className="text-center mb-16 animate-slide-up">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary text-white shadow-2xl scale-110">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <Badge variant="success" className="mb-6">Transaction Verified</Badge>
          <h1 className="text-6xl font-black text-on-surface uppercase tracking-tighter leading-none">Journey <br />Authorized.</h1>
          <p className="mt-6 text-on-surface-variant font-medium text-sm">Your digital boarding pass has been initialized and synchronized.</p>
        </div>

        <Card className="!p-0 overflow-hidden relative shadow-2xl border-none">
          {/* Main Ticket */}
          <div className="bg-on-surface px-12 py-12 text-center border-b-[4px] border-dashed border-white/10">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-3">Global Tracking ID (PNR)</p>
             <h2 className="text-6xl font-black text-white tracking-[0.2em] uppercase leading-none">{booking.pnr}</h2>
          </div>

          <div className="p-12 space-y-12 bg-white">
            <div className="flex flex-col md:flex-row gap-12 items-center">
               <div className="p-6 border-2 border-outline-variant/10 rounded-[2rem] bg-surface-container-low/20 shadow-sm relative group overflow-hidden">
                  <QRCodeSVG value={booking.pnr || 'BUSGO'} size={180} level="H" fgColor="#000000" />
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[9px] font-black text-center mt-6 text-on-surface/40 uppercase tracking-[0.2em]">Boarding Protocol Active</p>
               </div>

               <div className="flex-1 space-y-8 w-full">
                  <div>
                     <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 opacity-40">Voyage Corridor</p>
                     <p className="text-3xl font-black text-on-surface uppercase tracking-tighter leading-none">
                        {route?.originCity || booking.origin} <span className="text-primary mx-1">➔</span> {route?.destinationCity || booking.destination}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                     <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Fleet Unit</p>
                        <p className="text-sm font-black text-on-surface uppercase">{bus?.busName || booking.busName}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Service Hub</p>
                        <Badge variant="primary" className="!px-3 !py-1">Verfied BusGoHub</Badge>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Allocation Value</p>
                        <p className="text-lg font-black text-primary">{formatCurrency(booking.totalAmount)}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Active Nodes</p>
                        <p className="text-sm font-black text-on-surface uppercase">{booking.passengers?.map(p => p.seatNumber).join(', ')}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-10 border-t border-outline-variant/10">
               <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-6 opacity-40">Identified Travelers</p>
               <div className="grid gap-4">
                  {booking.passengers?.map(p => (
                    <div key={p.seatNumber} className="flex items-center justify-between p-5 bg-surface-container-low/30 rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-all">
                       <div>
                          <p className="font-black text-on-surface uppercase tracking-tight text-sm mb-0.5">{p.name}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{p.gender} • {p.age} Years</p>
                       </div>
                       <Badge variant="neutral" className="!bg-on-surface !text-white font-black">NODE {p.seatNumber}</Badge>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </Card>

        <div className="mt-12 flex flex-col sm:flex-row gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
           <Button variant="ghost" fullWidth onClick={handleDownload} loading={downloading} className="bg-white border-outline-variant/20 hover:bg-surface-container">
              Transmit PDF Ticket
           </Button>
           <Button fullWidth onClick={() => navigate('/my-bookings')}>
              Go to Command Hub ➔
           </Button>
        </div>
      </div>
    </div>
  );
}
