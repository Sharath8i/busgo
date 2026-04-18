import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { getBooking } from '../api/bookingAPI';
import api from '../api/axiosInstance';
import { formatCurrency } from '../utils/format';

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
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 }, 
        colors: ['#2563EB', '#1E40AF', '#DBEAFE', '#FFFFFF'] 
      });
    }
  }, [booking?.pnr]);

  if (err) {
    return (
      <div className="min-h-screen bg-surface-alt pt-20 flex items-center justify-center">
        <div className="card p-12 text-center max-w-sm mx-auto">
          <h2 className="text-xl font-black uppercase tracking-tighter text-error">Ticket Not Found</h2>
          <button onClick={() => navigate('/my-bookings')} className="btn-primary mt-6 w-full">My Bookings</button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-surface-alt pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Generating Your Ticket...</p>
        </div>
      </div>
    );
  }

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
      a.download = `Ticket-${booking.pnr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('PDF generation failed'); }
    finally { setDownloading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-alt pt-20 pb-20">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-text-main uppercase tracking-tighter">Booking Confirmed</h1>
          <p className="mt-2 text-text-muted font-medium">Your digital ticket is ready for your journey.</p>
        </div>

        <div className="card !p-0 overflow-hidden relative">
          {/* Main Ticket */}
          <div className="bg-primary px-8 py-8 text-center border-b-[3px] border-dashed border-primary-dark">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-light mb-2">Electronic Ticket (PNR)</p>
             <h2 className="text-5xl font-black text-white tracking-widest uppercase">{booking.pnr}</h2>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-10 items-center">
               <div className="p-4 border border-surface-border rounded-2xl bg-white shadow-sm">
                  <QRCodeSVG value={booking.pnr} size={160} level="M" fgColor="#1E40AF" />
                  <p className="text-[10px] font-black text-center mt-4 text-text-muted uppercase tracking-widest">Boarding Pass</p>
               </div>

               <div className="flex-1 space-y-6 w-full">
                  <div>
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Route Hubs</p>
                     <p className="text-2xl font-black text-text-main uppercase tracking-tighter">
                        {route?.originCity} <span className="text-primary mx-1">→</span> {route?.destinationCity}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                     <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Service</p>
                        <p className="text-sm font-bold text-text-main">{bus?.busName}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Status</p>
                        <span className="badge bg-green-50 text-success border border-green-200">Confirmed</span>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Payment</p>
                        <p className="text-sm font-black text-primary">{formatCurrency(booking.totalAmount)}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Seats</p>
                        <p className="text-sm font-bold text-text-main">{booking.passengers?.map(p => p.seatNumber).join(', ')}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-surface-border">
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Passenger Manifest</p>
               <div className="grid gap-2">
                  {booking.passengers?.map(p => (
                    <div key={p.seatNumber} className="flex items-center justify-between p-3 bg-surface-alt rounded-xl border border-surface-border text-sm">
                       <span className="font-bold text-text-main uppercase">{p.name}</span>
                       <div className="flex items-center gap-4 text-xs font-bold text-text-muted">
                          <span>{p.gender} • {p.age}Y</span>
                          <span className="text-primary uppercase tracking-widest">Seat {p.seatNumber}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
           <button onClick={handleDownload} disabled={downloading} className="btn-secondary !bg-white flex-1 flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                 <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {downloading ? 'Preparing...' : 'Download Ticket'}
           </button>
           <button onClick={() => navigate('/my-bookings')} className="btn-primary flex-1">My Dashboard</button>
        </div>
      </div>
    </div>
  );
}
