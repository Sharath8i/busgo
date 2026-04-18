import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils/format';
import SidebarLayout from '../../layouts/SidebarLayout';

const MENU_ITEMS = [
  { label: 'Dashboard', path: '/operator', icon: '📊', end: true },
  { label: 'Buses', path: '/operator/buses', icon: '🚌' },
  { label: 'Routes', path: '/operator/routes', icon: '🗺️' },
  { label: 'Schedules', path: '/operator/schedules', icon: '🕐' },
  { label: 'Bookings', path: '/operator/bookings', icon: '🎫' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ────────────────────────────────────────
   BUS REGISTRATION FORM (buses/new)
   ──────────────────────────────────────── */
function RegisterBusForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { busName: '', registrationNo: '', busType: 'volvo', totalSeats: 40, amenities: '' }
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        totalSeats: Number(data.totalSeats),
        amenities: data.amenities ? data.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      };
      await api.post('/operator/buses', payload);
      toast.success('Vehicle registered!');
      navigate('/operator/buses');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="animate-slide-up max-w-3xl">
      <Link to="/operator/buses" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline mb-4 block">← Back to Fleet</Link>
      <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Register New Vehicle</h1>
      <p className="text-on-surface-variant text-sm mb-10">Add a new coach to your active fleet inventory.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 p-12 space-y-8">
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Vehicle Name</label>
          <input {...register('busName', { required: 'Required' })} placeholder="e.g. BusGo Airavat Express" className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
          {errors.busName && <p className="text-error text-xs font-bold">{errors.busName.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Registration Number</label>
          <input {...register('registrationNo', { required: 'Required' })} placeholder="KA-01-AB-1234" className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
          {errors.registrationNo && <p className="text-error text-xs font-bold">{errors.registrationNo.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Bus Type</label>
            <select {...register('busType')} className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="volvo">Volvo AC</option>
              <option value="sleeper">Sleeper</option>
              <option value="semi_sleeper">Semi Sleeper</option>
              <option value="seater">Seater</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Total Seats</label>
            <input type="number" {...register('totalSeats', { required: true, min: 10, max: 80 })} className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Amenities</label>
          <input {...register('amenities')} placeholder="WiFi, AC, Charging (comma separated)" className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={submitting} className="px-10 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
            {submitting ? 'Registering...' : 'Register Vehicle ✓'}
          </button>
          <Link to="/operator/buses" className="px-10 py-4 bg-surface-container text-on-surface font-black uppercase text-xs tracking-widest rounded-xl hover:bg-outline-variant/20 transition-all">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

/* ────────────────────────────────────────
   CREATE ROUTE FORM (routes/new)
   ──────────────────────────────────────── */
function CreateRouteForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { originCity: '', destinationCity: '', distanceKm: '', estimatedMinutes: '' }
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await api.post('/operator/routes', {
        originCity: data.originCity.trim(),
        destinationCity: data.destinationCity.trim(),
        distanceKm: Number(data.distanceKm) || undefined,
        estimatedMinutes: Number(data.estimatedMinutes) || undefined,
      });
      toast.success('Route created!');
      navigate('/operator/routes');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create route'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="animate-slide-up max-w-3xl">
      <Link to="/operator/routes" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline mb-4 block">← Back to Routes</Link>
      <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Create New Route</h1>
      <p className="text-on-surface-variant text-sm mb-10">Define the origin and destination for your bus service.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 p-12 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Origin City</label>
            <input {...register('originCity', { required: 'Required' })} placeholder="e.g. Bangalore" className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
            {errors.originCity && <p className="text-error text-xs font-bold">{errors.originCity.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Destination City</label>
            <input {...register('destinationCity', { required: 'Required' })} placeholder="e.g. Mysore" className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
            {errors.destinationCity && <p className="text-error text-xs font-bold">{errors.destinationCity.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Distance (KM)</label>
            <input type="number" {...register('distanceKm')} placeholder="e.g. 145" className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Estimated Duration (mins)</label>
            <input type="number" {...register('estimatedMinutes')} placeholder="e.g. 180" className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={submitting} className="px-10 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Route ✓'}
          </button>
          <Link to="/operator/routes" className="px-10 py-4 bg-surface-container text-on-surface font-black uppercase text-xs tracking-widest rounded-xl hover:bg-outline-variant/20 transition-all">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

/* ────────────────────────────────────────
   CREATE SCHEDULE FORM (schedules/new)
   ──────────────────────────────────────── */
function CreateScheduleForm({ buses, routes }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { busId: '', routeId: '', departureTime: '21:00', arrivalTime: '06:00', baseFare: 500 }
  });

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const onSubmit = async (data) => {
    if (!selectedDays.length) { toast.error('Select at least one operating day'); return; }
    try {
      setSubmitting(true);
      await api.post('/operator/schedules', {
        busId: data.busId,
        routeId: data.routeId,
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        baseFare: Number(data.baseFare),
        operatingDays: selectedDays,
      });
      toast.success('Schedule activated!');
      navigate('/operator/schedules');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create schedule'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="animate-slide-up max-w-3xl">
      <Link to="/operator/schedules" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline mb-4 block">← Back to Schedules</Link>
      <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Create Schedule</h1>
      <p className="text-on-surface-variant text-sm mb-10">Assign a bus to a route with departure times and fare.</p>

      {(!buses.length || !routes.length) && (
        <div className="bg-tertiary/10 border border-tertiary/20 rounded-2xl p-8 mb-8 text-center">
          <p className="text-sm font-bold text-tertiary">⚠️ You need at least one <Link to="/operator/buses/new" className="text-primary underline">Bus</Link> and one <Link to="/operator/routes/new" className="text-primary underline">Route</Link> before creating a schedule.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 p-12 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Select Bus</label>
            <select {...register('busId', { required: 'Select a bus' })} className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">— Choose Bus —</option>
              {buses.map(b => <option key={b._id} value={b._id}>{b.busName} ({b.registrationNo})</option>)}
            </select>
            {errors.busId && <p className="text-error text-xs font-bold">{errors.busId.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Select Route</label>
            <select {...register('routeId', { required: 'Select a route' })} className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">— Choose Route —</option>
              {routes.map(r => <option key={r._id} value={r._id}>{r.originCity} → {r.destinationCity}</option>)}
            </select>
            {errors.routeId && <p className="text-error text-xs font-bold">{errors.routeId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Departure Time</label>
            <input type="time" {...register('departureTime', { required: true })} className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Arrival Time</label>
            <input type="time" {...register('arrivalTime', { required: true })} className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Base Fare (₹)</label>
            <input type="number" {...register('baseFare', { required: true, min: 50 })} className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
        </div>

        {/* Operating Days */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Operating Days</label>
          <div className="flex flex-wrap gap-3">
            {DAYS.map(day => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedDays.includes(day) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-low'}`}
              >{day}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={submitting || !buses.length || !routes.length} className="px-10 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
            {submitting ? 'Activating...' : 'Activate Schedule ✓'}
          </button>
          <Link to="/operator/schedules" className="px-10 py-4 bg-surface-container text-on-surface font-black uppercase text-xs tracking-widest rounded-xl hover:bg-outline-variant/20 transition-all">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

/* ────────────────────────────────────────
   MAIN OPERATOR DASHBOARD
   ──────────────────────────────────────── */
export default function OperatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const location = useLocation();

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const [s, b, bk] = await Promise.all([
        api.get('/operator/stats'),
        api.get('/operator/buses'),
        api.get('/operator/bookings?limit=5')
      ]);
      setStats(s.data);
      setBuses(b.data.buses);
      setBookings(bk.data.bookings);
    } catch { toast.error('Portal sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchBuses = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/operator/buses'); setBuses(data.buses); }
    catch { toast.error('Fleet sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchRoutes = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/operator/routes'); setRoutes(data.routes); }
    catch { toast.error('Routes sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const [sched, b, r] = await Promise.all([
        api.get('/operator/schedules'),
        api.get('/operator/buses'),
        api.get('/operator/routes'),
      ]);
      setSchedules(sched.data.schedules);
      setBuses(b.data.buses);
      setRoutes(r.data.routes);
    } catch { toast.error('Schedule sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchBookings = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/operator/bookings'); setBookings(data.bookings); }
    catch { toast.error('Bookings sync failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const p = location.pathname;
    if (p === '/operator') fetchOverview();
    else if (p === '/operator/buses') fetchBuses();
    else if (p === '/operator/routes') fetchRoutes();
    else if (p.startsWith('/operator/schedules')) fetchSchedules();
    else if (p === '/operator/bookings') fetchBookings();
  }, [location.pathname, fetchOverview, fetchBuses, fetchRoutes, fetchSchedules, fetchBookings]);

  if (loading && !stats && !buses.length) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
      <div className="text-center font-black uppercase text-xs tracking-[0.3em] text-primary animate-pulse">Booting Fleet Console...</div>
    </div>
  );

  return (
    <SidebarLayout title="Fleet Console" menuItems={MENU_ITEMS}>
      <Routes>
        {/* ── OVERVIEW ── */}
        <Route index element={
          <div className="animate-slide-up">
            <header className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-4xl font-black text-on-surface tracking-tighter">Fleet Dashboard</h1>
                <p className="text-on-surface-variant text-sm font-medium mt-1">Active operations and fleet performance.</p>
              </div>
              <Link to="/operator/buses/new" className="px-8 py-3 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">+ Register Bus</Link>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {[
                { label: 'Gross Revenue', val: formatCurrency(stats?.totalRevenue || 0), color: 'text-primary' },
                { label: 'Active Buses', val: stats?.fleetSize || buses.length, color: 'text-on-surface' },
                { label: 'Today Tickets', val: stats?.bookingsToday || 0, color: 'text-success' },
                { label: 'Total Sales', val: stats?.totalBookings || 0, color: 'text-on-surface' }
              ].map(k => (
                <div key={k.label} className="bg-white p-8 rounded-[2rem] editorial-shadow border border-outline-variant/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{k.label}</p>
                  <p className={`text-3xl font-black tracking-tight ${k.color}`}>{k.val}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 sm:grid-cols-3 mb-12">
              {[
                { label: 'Add Route', desc: 'Define a new service corridor', path: '/operator/routes/new', icon: '🗺️' },
                { label: 'Create Schedule', desc: 'Assign bus to a route', path: '/operator/schedules/new', icon: '🕐' },
                { label: 'Register Bus', desc: 'Add vehicle to your fleet', path: '/operator/buses/new', icon: '🚌' },
              ].map(a => (
                <Link key={a.label} to={a.path} className="bg-white p-8 rounded-[2rem] editorial-shadow border border-outline-variant/10 hover:translate-y-[-4px] transition-all group">
                  <span className="text-3xl block mb-4">{a.icon}</span>
                  <p className="text-sm font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">{a.label}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">{a.desc}</p>
                </Link>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden">
                <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
                  <h3 className="text-xl font-black text-on-surface">Fleet Overview</h3>
                  <Link to="/operator/buses" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All →</Link>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {buses.slice(0, 5).map(b => (
                    <div key={b._id} className="px-10 py-6 flex items-center justify-between hover:bg-surface-container-low transition-all">
                      <div>
                        <p className="text-sm font-black text-on-surface uppercase tracking-tight">{b.busName}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{b.registrationNo}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${b.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {b.isActive ? 'Active' : 'Standby'}
                      </span>
                    </div>
                  ))}
                  {buses.length === 0 && <div className="px-10 py-12 text-center text-on-surface-variant text-sm italic">No vehicles registered yet.</div>}
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden">
                <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
                  <h3 className="text-xl font-black text-on-surface">Recent Bookings</h3>
                  <Link to="/operator/bookings" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Audit →</Link>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {bookings.map(b => (
                    <div key={b._id} className="px-10 py-6 flex items-center justify-between hover:bg-surface-container-low transition-all">
                      <div>
                        <p className="text-sm font-black text-on-surface uppercase tracking-tighter">{b.pnr}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase">{formatDate(b.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">{formatCurrency(b.totalAmount)}</p>
                        <p className="text-[10px] text-success font-black uppercase">Confirmed</p>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && <div className="px-10 py-12 text-center text-on-surface-variant text-sm italic">No bookings yet.</div>}
                </div>
              </section>
            </div>
          </div>
        } />

        {/* ── BUS REGISTRATION ── */}
        <Route path="buses/new" element={<RegisterBusForm />} />

        {/* ── FLEET INVENTORY ── */}
        <Route path="buses" element={
          <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden animate-slide-up">
            <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Fleet Inventory</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Vehicle Health and Status</p>
              </div>
              <div className="flex gap-4">
                <button onClick={fetchBuses} className="px-6 py-3 bg-surface-container rounded-xl text-[10px] font-black uppercase tracking-widest">Sync</button>
                <Link to="/operator/buses/new" className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">+ Add Vehicle</Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Bus Details</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Type</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Seats</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {buses.map(b => (
                    <tr key={b._id} className="hover:bg-surface-container-low/50 transition-all">
                      <td className="px-10 py-6"><p className="text-sm font-black uppercase">{b.busName}</p><p className="text-[10px] text-on-surface-variant font-bold uppercase">{b.registrationNo}</p></td>
                      <td className="px-10 py-6"><span className="text-[10px] font-black uppercase text-primary bg-primary/5 px-3 py-1 rounded-md">{b.busType?.replace('_', ' ')}</span></td>
                      <td className="px-10 py-6 font-bold text-[10px] text-on-surface-variant uppercase">{b.totalSeats} SEATS</td>
                      <td className="px-10 py-6 text-right"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${b.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{b.isActive ? 'Active' : 'Standby'}</span></td>
                    </tr>
                  ))}
                  {buses.length === 0 && <tr><td colSpan="4" className="px-10 py-16 text-center text-on-surface-variant italic">No vehicles. <Link to="/operator/buses/new" className="text-primary font-black underline">Register first bus →</Link></td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        } />

        {/* ── CREATE ROUTE ── */}
        <Route path="routes/new" element={<CreateRouteForm />} />

        {/* ── ROUTES LIST ── */}
        <Route path="routes" element={
          <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden animate-slide-up">
            <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Service Routes</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Your defined transit corridors</p>
              </div>
              <div className="flex gap-4">
                <button onClick={fetchRoutes} className="px-6 py-3 bg-surface-container rounded-xl text-[10px] font-black uppercase tracking-widest">Sync</button>
                <Link to="/operator/routes/new" className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">+ Add Route</Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Origin</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Destination</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Distance</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {routes.map(r => (
                    <tr key={r._id} className="hover:bg-surface-container-low/50 transition-all">
                      <td className="px-10 py-6 text-sm font-black uppercase">{r.originCity}</td>
                      <td className="px-10 py-6 text-sm font-black uppercase">{r.destinationCity}</td>
                      <td className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase">{r.distanceKm ? `${r.distanceKm} KM` : '—'}</td>
                      <td className="px-10 py-6 text-right text-[10px] font-bold text-on-surface-variant uppercase">{r.estimatedMinutes ? `${Math.floor(r.estimatedMinutes / 60)}h ${r.estimatedMinutes % 60}m` : '—'}</td>
                    </tr>
                  ))}
                  {routes.length === 0 && <tr><td colSpan="4" className="px-10 py-16 text-center text-on-surface-variant italic">No routes defined. <Link to="/operator/routes/new" className="text-primary font-black underline">Create first route →</Link></td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        } />

        {/* ── CREATE SCHEDULE ── */}
        <Route path="schedules/new" element={<CreateScheduleForm buses={buses} routes={routes} />} />

        {/* ── SCHEDULES LIST ── */}
        <Route path="schedules" element={
          <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden animate-slide-up">
            <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Active Schedules</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Bus-route assignments with timings</p>
              </div>
              <div className="flex gap-4">
                <button onClick={fetchSchedules} className="px-6 py-3 bg-surface-container rounded-xl text-[10px] font-black uppercase tracking-widest">Sync</button>
                <Link to="/operator/schedules/new" className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">+ New Schedule</Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Bus</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Route</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Timings</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Fare</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {schedules.map(s => (
                    <tr key={s._id} className="hover:bg-surface-container-low/50 transition-all">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black uppercase">{s.busId?.busName || 'Unknown'}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase">{s.busId?.busType?.replace('_', ' ')}</p>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-black uppercase">{s.routeId?.originCity || '?'} → {s.routeId?.destinationCity || '?'}</p>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-on-surface">{s.departureTime} → {s.arrivalTime}</p>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-primary">₹{s.baseFare}</p>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {s.operatingDays?.map(d => (
                            <span key={d} className="bg-primary/5 text-primary px-2 py-0.5 rounded text-[8px] font-black">{d}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {schedules.length === 0 && <tr><td colSpan="5" className="px-10 py-16 text-center text-on-surface-variant italic">No schedules. <Link to="/operator/schedules/new" className="text-primary font-black underline">Create first schedule →</Link></td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        } />

        {/* ── BOOKINGS LEDGER ── */}
        <Route path="bookings" element={
          <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden animate-slide-up">
            <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Transaction Ledger</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Confirmed Ticket Audit</p>
              </div>
              <button onClick={fetchBookings} className="px-6 py-3 bg-surface-container rounded-xl text-[10px] font-black uppercase tracking-widest">Sync Ledger</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">PNR</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Amount</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-surface-container-low/50 transition-all">
                      <td className="px-10 py-6"><p className="text-sm font-black uppercase">{b.pnr}</p><p className="text-[10px] text-on-surface-variant font-bold uppercase">ID: {b._id.slice(-6)}</p></td>
                      <td className="px-10 py-6"><p className="text-sm font-black text-primary">{formatCurrency(b.totalAmount)}</p><p className="text-[10px] text-success font-black uppercase">Paid</p></td>
                      <td className="px-10 py-6 text-right font-bold text-[10px] text-on-surface-variant uppercase">{formatDate(b.createdAt)}</td>
                    </tr>
                  ))}
                  {bookings.length === 0 && <tr><td colSpan="3" className="px-10 py-16 text-center text-on-surface-variant italic">No transactions recorded.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        } />
      </Routes>
    </SidebarLayout>
  );
}
