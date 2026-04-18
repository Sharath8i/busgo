import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../../utils/format';
import SidebarLayout from '../../../layouts/SidebarLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import OperatorStats from '../components/OperatorStats';
import OperatorTable from '../components/OperatorTable';

const MENU_ITEMS = [
  { label: 'Overview', path: '/operator', icon: '📊', end: true },
  { label: 'Fleet', path: '/operator/buses', icon: '🚌' },
  { label: 'Corridors', path: '/operator/routes', icon: '🗺️' },
  { label: 'Scheduling', path: '/operator/schedules', icon: '🕐' },
  { label: 'Pilots', path: '/operator/drivers', icon: '👨‍✈️' },
  { label: 'Ledger', path: '/operator/bookings', icon: '🎫' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ────────────────────────────────────────
   BUS REGISTRATION FORM
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
      toast.success('Vehicle registered successfully!');
      navigate('/operator/buses');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="animate-slide-up max-w-3xl">
      <Link to="/operator/buses" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline mb-4 block">← Return to Fleet</Link>
      <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Fleet Addition</h1>
      <p className="text-on-surface-variant text-sm mb-10">Commission a new vehicle into active service.</p>

      <Card className="p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Input 
            label="Vehicle Identification Name" 
            {...register('busName', { required: 'Name is required' })} 
            error={errors.busName?.message}
            placeholder="e.g. Skyline Cruiser AC" 
          />
          <Input 
            label="State Registration Number" 
            {...register('registrationNo', { required: 'Reg No is required' })} 
            error={errors.registrationNo?.message}
            placeholder="KA-01-XX-0000" 
            className="uppercase"
          />
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-on-surface-variant">Vehicle Architecture</label>
              <select {...register('busType')} className="input-field">
                <option value="volvo">Volvo AC</option>
                <option value="sleeper">Luxury Sleeper</option>
                <option value="semi_sleeper">Semi Sleeper</option>
                <option value="seater">Standard Seater</option>
              </select>
            </div>
            <Input 
              label="Standard Capacity" 
              type="number" 
              {...register('totalSeats', { required: true, min: 10, max: 80 })} 
              error={errors.totalSeats && 'Invalid seat count'}
            />
          </div>
          <Input 
            label="Amenities List" 
            {...register('amenities')} 
            placeholder="WiFi, Charging, Toilet (comma separated)" 
            helper="Enhance traveler experience with premium features"
          />
          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={submitting}>Register Vehicle ✓</Button>
            <Button variant="ghost" onClick={() => navigate('/operator/buses')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ────────────────────────────────────────
   CREATE ROUTE FORM
   ──────────────────────────────────────── */
function CreateRouteForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [stops, setStops] = useState([{ cityName: '', arrivalOffset: 0 }]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await api.post('/operator/routes', {
        ...data,
        distanceKm: Number(data.distanceKm),
        estimatedMinutes: Number(data.estimatedMinutes),
        stops: stops.filter(s => s.cityName.trim())
      });
      toast.success('Route corridor defined!');
      navigate('/operator/routes');
    } catch (err) { toast.error('Failed to establish route'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="animate-slide-up max-w-4xl">
      <Link to="/operator/routes" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline mb-4 block">← Corridor Network</Link>
      <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Define Corridor</h1>
      <Card className="p-12 mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <Input label="Departure Hub" {...register('originCity', { required: true })} />
            <Input label="Arrival Destination" {...register('destinationCity', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input label="Total Distance (KM)" type="number" {...register('distanceKm')} />
            <Input label="Est. Duration (Mins)" type="number" {...register('estimatedMinutes')} />
          </div>
          
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Operational Waypoints (Intermediate Stops)</p>
            {stops.map((s, i) => (
              <div key={i} className="flex gap-4 items-end animate-slide-up">
                <Input placeholder="City Name" value={s.cityName} className="flex-1" onChange={e => {
                  const n = [...stops]; n[i].cityName = e.target.value; setStops(n);
                }} />
                <Input placeholder="+Mins" type="number" className="w-32" value={s.arrivalOffset} onChange={e => {
                  const n = [...stops]; n[i].arrivalOffset = Number(e.target.value); setStops(n);
                }} />
                <Button type="button" variant="danger" className="!h-[52px]" onClick={() => setStops(stops.filter((_, idx) => idx !== i))}>×</Button>
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => setStops([...stops, { cityName: '', arrivalOffset: 0 }])}>+ Add Waypoint</Button>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={submitting}>Establish Corridor ✓</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ────────────────────────────────────────
   SCHEDULES LIST & TRIP MANAGEMENT
   ──────────────────────────────────────── */
function ScheduleList({ schedules, onRefresh, loading }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
     return schedules.filter(s => 
       s.busId?.busName?.toLowerCase().includes(q.toLowerCase()) || 
       s.routeId?.originCity?.toLowerCase().includes(q.toLowerCase()) ||
       s.routeId?.destinationCity?.toLowerCase().includes(q.toLowerCase())
     );
  }, [schedules, q]);

  return (
    <OperatorTable 
      title="Fleet Scheduling"
      subtitle="Assignments of vehicles to active corridors"
      loading={loading}
      onSearch={setQ}
      headers={[
        { label: 'Asset / Corridor' },
        { label: 'Schedule Windows' },
        { label: 'Pricing' },
        { label: 'Actions', align: 'right' }
      ]}
      data={filtered}
      actions={
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={onRefresh}>Sync</Button>
          <Link to="/operator/schedules/new"><Button size="sm">New Assignment</Button></Link>
        </div>
      }
      renderRow={(s) => (
        <tr key={s._id} className="hover:bg-surface-container-low transition-all">
          <td className="px-10 py-6">
            <p className="text-sm font-black uppercase tracking-tight">{s.busId?.busName || 'Legacy Asset'}</p>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">{s.routeId?.originCity} ➔ {s.routeId?.destinationCity}</p>
          </td>
          <td className="px-10 py-6">
            <Badge variant="tertiary" className="mb-1">{s.departureTime} — {s.arrivalTime}</Badge>
            <p className="text-[10px] text-on-surface-variant font-black uppercase italic">Daily Service</p>
          </td>
          <td className="px-10 py-6">
            <p className="text-xl font-black text-primary">{formatCurrency(s.baseFare)}</p>
          </td>
          <td className="px-10 py-6 text-right">
             <Link to={`/operator/manifest/${s._id}`}>
                <Button size="sm" variant="ghost">Passenger List</Button>
             </Link>
          </td>
        </tr>
      )}
    />
  );
}

/* ────────────────────────────────────────
   MAIN OPERATOR DASHBOARD CONSOLe
   ──────────────────────────────────────── */
export default function OperatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const [s, b, bk, dr] = await Promise.all([
        api.get('/operator/stats'),
        api.get('/operator/buses'),
        api.get('/operator/bookings?limit=5'),
        api.get('/operator/drivers')
      ]);
      setStats(s.data);
      setBuses(b.data.buses);
      setBookings(bk.data.bookings);
      setDrivers(dr.data.drivers);
    } catch { toast.error('Portal synchronization failure'); }
    finally { setLoading(false); }
  }, []);

  const fetchBuses = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/operator/buses'); setBuses(data.buses); }
    catch { toast.error('Fleet state retrieval failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchRoutes = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/operator/routes'); setRoutes(data.routes); }
    catch { toast.error('Corridor data sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const [sched, b, r, dr] = await Promise.all([
        api.get('/operator/schedules'),
        api.get('/operator/buses'),
        api.get('/operator/routes'),
        api.get('/operator/drivers')
      ]);
      setSchedules(sched.data.schedules);
      setBuses(b.data.buses);
      setRoutes(r.data.routes);
      setDrivers(dr.data.drivers);
    } catch { toast.error('Scheduling grid sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchBookings = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/operator/bookings'); setBookings(data.bookings); }
    catch { toast.error('Ledger reconciliation failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/operator/drivers'); setDrivers(data.drivers); }
    catch { toast.error('Pilot pool sync failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const p = location.pathname;
    if (p === '/operator') fetchOverview();
    else if (p === '/operator/buses') fetchBuses();
    else if (p === '/operator/routes') fetchRoutes();
    else if (p.startsWith('/operator/schedules')) fetchSchedules();
    else if (p === '/operator/bookings') fetchBookings();
    else if (p === '/operator/drivers') fetchDrivers();
  }, [location.pathname, fetchOverview, fetchBuses, fetchRoutes, fetchSchedules, fetchBookings, fetchDrivers]);

  if (loading && !stats && !buses.length && !schedules.length) return <Loading message="Initializing Fleet Console..." />;

  return (
    <SidebarLayout title="Fleet Ops" menuItems={MENU_ITEMS}>
      <Routes>
        {/* ── OVERVIEW ── */}
        <Route index element={
          <div className="animate-slide-up">
            <header className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-4xl font-black text-on-surface tracking-tighter">Operational Overview</h1>
                <p className="text-on-surface-variant text-sm font-medium mt-1">Real-time fleet performance indicators.</p>
              </div>
              <Link to="/operator/buses/new">
                <Button icon={<span>+</span>}>Register Vehicle</Button>
              </Link>
            </header>

            <OperatorStats stats={stats} />

            <div className="grid gap-6 sm:grid-cols-3 mb-12">
              {[
                { label: 'Add Corridor', desc: 'Define new transit routes', path: '/operator/routes/new', icon: '🗺️' },
                { label: 'Schedule Fleet', desc: 'Assign assets to departures', path: '/operator/schedules/new', icon: '🕐' },
                { label: 'Pilot Onboarding', desc: 'Register new driver profiles', path: '/operator/drivers/new', icon: '👨‍✈️' },
              ].map(a => (
                <Link key={a.label} to={a.path}>
                   <Card className="hover:scale-[1.02] active:scale-95 group cursor-pointer text-center md:text-left">
                      <span className="text-4xl block mb-6">{a.icon}</span>
                      <p className="text-sm font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">{a.label}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-2">{a.desc}</p>
                   </Card>
                </Link>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <section>
                <Card className="p-0 overflow-hidden">
                   <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
                      <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">Fleet Status</h3>
                      <Link to="/operator/buses" className="text-[10px] font-black text-primary hover:underline uppercase">View All</Link>
                   </div>
                   <div className="divide-y divide-outline-variant/10">
                      {buses.slice(0, 5).map(b => (
                        <div key={b._id} className="px-8 py-5 flex items-center justify-between hover:bg-surface-container-low/50 transition-all">
                           <div>
                              <p className="text-xs font-black uppercase tracking-tight">{b.busName}</p>
                              <Badge variant="neutral" className="mt-1">{b.registrationNo}</Badge>
                           </div>
                           <Badge variant={b.isActive ? 'success' : 'error'}>{b.isActive ? 'Live' : 'Maintenance'}</Badge>
                        </div>
                      ))}
                   </div>
                </Card>
              </section>

              <section>
                <Card className="p-0 overflow-hidden">
                   <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
                      <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">Recent Activity</h3>
                      <Link to="/operator/bookings" className="text-[10px] font-black text-primary hover:underline uppercase">Audit Ledger</Link>
                   </div>
                   <div className="divide-y divide-outline-variant/10">
                      {bookings.slice(0, 5).map(b => (
                        <div key={b._id} className="px-8 py-5 flex items-center justify-between hover:bg-surface-container-low/50 transition-all">
                           <div>
                              <p className="text-xs font-black uppercase tracking-tighter">{b.pnr}</p>
                              <p className="text-[10px] text-on-surface-variant font-bold uppercase">{formatDate(b.createdAt)}</p>
                           </div>
                           <p className="text-sm font-black text-primary">{formatCurrency(b.totalAmount)}</p>
                        </div>
                      ))}
                      {bookings.length === 0 && <EmptyState icon="📒" title="No Ledger Daily" message="Active sales will mirror here." />}
                   </div>
                </Card>
              </section>
            </div>
          </div>
        } />

        <Route path="buses/new" element={<RegisterBusForm />} />
        <Route path="buses" element={<FleetPage buses={buses} onRefresh={fetchBuses} loading={loading} />} />
        
        <Route path="routes/new" element={<CreateRouteForm />} />
        <Route path="routes" element={<CorridorsPage routes={routes} onRefresh={fetchRoutes} loading={loading} />} />
        
        <Route path="schedules/new" element={<CreateScheduleForm buses={buses} routes={routes} drivers={drivers} />} />
        <Route path="schedules" element={<ScheduleList schedules={schedules} onRefresh={fetchSchedules} loading={loading} />} />

        <Route path="drivers" element={<PilotsPage drivers={drivers} onRefresh={fetchDrivers} loading={loading} />} />
        <Route path="drivers/new" element={<CreateDriverForm />} />

        <Route path="manifest/:tripId" element={<TripManifestWrapper />} />
        <Route path="bookings" element={<LedgerPage bookings={bookings} onRefresh={fetchBookings} loading={loading} />} />
      </Routes>
    </SidebarLayout>
  );
}

/* ────────────────────────────────────────
   SUB-PAGES (FLEET, CORRIDORS, PILOTS)
   ──────────────────────────────────────── */

function FleetPage({ buses, onRefresh, loading }) {
  const [q, setQ] = useState('');
  const filtered = buses.filter(b => b.busName.toLowerCase().includes(q.toLowerCase()) || b.registrationNo.toLowerCase().includes(q.toLowerCase()));
  
  return (
    <OperatorTable 
      title="Fleet Inventory"
      subtitle="Comprehensive vehicle status and telemetry"
      loading={loading}
      onSearch={setQ}
      headers={[{ label: 'Vehicle' }, { label: 'Class' }, { label: 'Capacity' }, { label: 'Operational Status', align: 'right' }]}
      data={filtered}
      actions={<Button size="sm" icon={<span>+</span>} onClick={() => window.location.href='/operator/buses/new'}>Add Asset</Button>}
      renderRow={b => (
        <tr key={b._id} className="hover:bg-surface-container-low transition-all">
          <td className="px-10 py-6"><p className="text-sm font-black uppercase">{b.busName}</p><p className="text-[10px] text-on-surface-variant font-bold uppercase">{b.registrationNo}</p></td>
          <td className="px-10 py-6"><Badge variant="primary">{b.busType?.replace('_', ' ')}</Badge></td>
          <td className="px-10 py-6 font-bold text-[10px] text-on-surface-variant uppercase">{b.totalSeats} UNITS</td>
          <td className="px-10 py-6 text-right"><Badge variant={b.isActive ? 'success' : 'error'}>{b.isActive ? 'Active' : 'Standby'}</Badge></td>
        </tr>
      )}
    />
  );
}

function CorridorsPage({ routes, onRefresh, loading }) {
  const [q, setQ] = useState('');
  const filtered = routes.filter(r => r.originCity.toLowerCase().includes(q.toLowerCase()) || r.destinationCity.toLowerCase().includes(q.toLowerCase()));
  
  return (
    <OperatorTable 
      title="Service Corridors"
      subtitle="Strategic transit paths and waypoints"
      loading={loading}
      onSearch={setQ}
      headers={[{ label: 'Departure' }, { label: 'Arrival' }, { label: 'Distance' }, { label: 'Estimated Transit', align: 'right' }]}
      data={filtered}
      actions={<Button size="sm" onClick={() => window.location.href='/operator/routes/new'}>New Corridor</Button>}
      renderRow={r => (
        <tr key={r._id} className="hover:bg-surface-container-low transition-all">
          <td className="px-10 py-6 text-sm font-black uppercase">{r.originCity}</td>
          <td className="px-10 py-6 text-sm font-black uppercase text-primary tracking-tighter">➔ {r.destinationCity}</td>
          <td className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase">{r.distanceKm ? `${r.distanceKm} KM` : '—'}</td>
          <td className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-on-surface">
            {r.estimatedMinutes ? `${Math.floor(r.estimatedMinutes / 60)}h ${r.estimatedMinutes % 60}m` : '—'}
          </td>
        </tr>
      )}
    />
  );
}

function PilotsPage({ drivers, onRefresh, loading }) {
  const [q, setQ] = useState('');
  const filtered = drivers.filter(d => d.name.toLowerCase().includes(q.toLowerCase()) || d.phone.includes(q));
  
  return (
    <OperatorTable 
      title="Flight Deck (Pilots)"
      subtitle="Certified drivers and active duty status"
      loading={loading}
      onSearch={setQ}
      headers={[{ label: 'Pilot' }, { label: 'Auth / Contact' }, { label: 'Seniority' }, { label: 'Duty State', align: 'right' }]}
      data={filtered}
      actions={<Button size="sm" onClick={() => window.location.href='/operator/drivers/new'}>Recruit Pilot</Button>}
      renderRow={d => (
        <tr key={d._id} className="hover:bg-surface-container-low transition-all">
          <td className="px-10 py-6"><p className="text-sm font-black uppercase tracking-tight">{d.name}</p></td>
          <td className="px-10 py-6">
            <p className="text-[10px] text-text-muted font-black uppercase mb-1">LIC: {d.licenseNumber}</p>
            <p className="text-xs font-bold text-primary">{d.phone}</p>
          </td>
          <td className="px-10 py-6"><p className="text-xs font-black text-on-surface">{d.experienceYears}Y</p></td>
          <td className="px-10 py-6 text-right"><Badge variant={d.isActive ? 'success' : 'neutral'}>{d.isActive ? 'On Duty' : 'Off Clock'}</Badge></td>
        </tr>
      )}
    />
  );
}

function LedgerPage({ bookings, onRefresh, loading }) {
  const [q, setQ] = useState('');
  const filtered = bookings.filter(b => b.pnr.toLowerCase().includes(q.toLowerCase()));
  
  return (
    <OperatorTable 
      title="Transaction Ledger"
      subtitle="Comprehensive audit trail of confirmed bookings"
      loading={loading}
      onSearch={setQ}
      headers={[{ label: 'Entity PNR' }, { label: 'Reconciliation' }, { label: 'Status' }, { label: 'Timestamp', align: 'right' }]}
      data={filtered}
      renderRow={b => (
        <tr key={b._id} className="hover:bg-surface-container-low transition-all">
          <td className="px-10 py-6 text-sm font-black uppercase tracking-tighter text-primary">{b.pnr}</td>
          <td className="px-10 py-6 text-xl font-black text-on-surface">{formatCurrency(b.totalAmount)}</td>
          <td className="px-10 py-6"><Badge variant="success">Confirmed (Paid)</Badge></td>
          <td className="px-10 py-6 text-right text-[10px] font-black text-on-surface-variant uppercase">{formatDate(b.createdAt)}</td>
        </tr>
      )}
    />
  );
}

function CreateDriverForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await api.post('/operator/drivers', data);
      toast.success('Pilot onboarded!');
      navigate('/operator/drivers');
    } catch { toast.error('Onboarding failed. Check telemetry.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="animate-slide-up max-w-xl">
      <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-8">Onboard Pilot</h1>
      <Card className="p-12 space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Input label="Full Operational Name" {...register('name', { required: true })} />
          <Input label="Secure Contact String (Mobile)" {...register('phone', { required: true })} />
          <Input label="Pilot License ID" {...register('licenseNumber', { required: true })} />
          <Input label="Cumulative Experience (Years)" type="number" {...register('experienceYears')} />
          <Button fullWidth loading={submitting}>Onboard Pilot ✓</Button>
        </form>
      </Card>
    </div>
  );
}

function CreateScheduleForm({ buses, routes, drivers }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { busId: '', routeId: '', driverId: '', departureTime: '21:00', arrivalTime: '06:00', baseFare: 500 }
  });

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const onSubmit = async (data) => {
    if (!selectedDays.length) { toast.error('Operational error: Minimum 1 day required'); return; }
    try {
      setSubmitting(true);
      await api.post('/operator/schedules', {
        ...data,
        baseFare: Number(data.baseFare),
        operatingDays: selectedDays,
      });
      toast.success('Service assignment activated!');
      navigate('/operator/schedules');
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="animate-slide-up max-w-4xl">
      <Link to="/operator/schedules" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline mb-4 block">← Scheduling Grid</Link>
      <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Assign Service</h1>
      <p className="text-on-surface-variant text-sm mb-10">Map an active asset to a corridor with timing parameters.</p>

      <Card className="p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Active Asset (Bus)</label>
              <select {...register('busId', { required: 'Required' })} className="input-field">
                <option value="">— Select Fleet Vehicle —</option>
                {buses.map(b => <option key={b._id} value={b._id}>{b.busName} ({b.registrationNo})</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Active Corridor (Route)</label>
              <select {...register('routeId', { required: 'Required' })} className="input-field">
                <option value="">— Select Service Corridor —</option>
                {routes.map(r => <option key={r._id} value={r._id}>{r.originCity} ➔ {r.destinationCity}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <Input label="Departure" type="time" {...register('departureTime')} />
            <Input label="Arrival" type="time" {...register('arrivalTime')} />
            <Input label="Unit Fare (₹)" type="number" {...register('baseFare')} />
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">Weekly Operational Cycle</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {DAYS.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDays.includes(day) ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-surface-container text-on-surface-variant hover:bg-outline-variant/20'}`}
                >{day}</button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-outline-variant/10">
            <Button type="submit" loading={submitting} className="w-full sm:w-auto">Confirm Service Assignment ✓</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function TripManifestWrapper() {
  const { tripId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/operator/trips/${tripId}/manifest`);
        setData(data);
      } catch { toast.error('Manifest retrieval failed'); }
      finally { setLoading(false); }
    }
    load();
  }, [tripId]);

  if (loading) return <Loading message="Retrieving Passenger Manifest..." />;
  if (!data || !data.manifest.length) return <EmptyState icon="📋" title="Empty Manifest" message="No passengers confirmed for this trip yet." actionLabel="Back to Schedules" onAction={() => window.history.back()} />;

  return (
    <div className="animate-slide-up space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Passenger Manifest</h2>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">
             <span className="text-primary">{data.busName}</span> // {formatDate(data.travelDate)}
          </p>
        </div>
        <Button variant="ghost" onClick={() => window.print()}>Print Manifest 🖨️</Button>
      </header>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black uppercase text-on-surface-variant">Seat</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase text-on-surface-variant">Profile</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase text-on-surface-variant text-right">Identifier / Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {data.manifest.map((p, i) => (
              <tr key={i} className="hover:bg-surface-container-low transition-all">
                <td className="px-10 py-6"><Badge variant="primary">{p.seatNumber}</Badge></td>
                <td className="px-10 py-6">
                  <p className="text-sm font-black uppercase">{p.name}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">{p.gender} // {p.age} YRS</p>
                </td>
                <td className="px-10 py-6 text-right font-black text-[10px] tracking-tight">
                  <p className="text-primary text-xs tracking-widest mb-1">{p.pnr}</p>
                  <p className="text-on-surface-variant">{p.phone}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
