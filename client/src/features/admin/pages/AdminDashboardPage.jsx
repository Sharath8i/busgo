import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
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
import AdminKPI from '../components/AdminKPI';
import OperatorTable from '../../operator/components/OperatorTable'; // Reuse the robust table

const MENU_ITEMS = [
  { label: 'Control Center', path: '/admin', icon: '📊', end: true },
  { label: 'Fleet Owners', path: '/admin/operators', icon: '🚌' },
  { label: 'Traveler Base', path: '/admin/users', icon: '👥' },
  { label: 'Promotions', path: '/admin/coupons', icon: '🏷️' },
  { label: 'Intelligence', path: '/admin/analytics', icon: '📈' },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [topRoutes, setTopRoutes] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showOpModal, setShowOpModal] = useState(false);
  const [opForm, setOpForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  
  const location = useLocation();

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const [s, u, a] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=5'),
        api.get('/admin/analytics')
      ]);
      setStats(s.data);
      setUsers(u.data.items || []);
      setAnalytics(a.data.summary);
    } catch { toast.error('Command center link failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/admin/users'); setUsers(data.items || []); }
    catch { toast.error('Directory sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchOperators = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/admin/operators'); setOperators(data.operators || []); }
    catch { toast.error('Registry sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('/admin/coupons'); setCoupons(data.coupons || []); }
    catch { toast.error('Asset sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/analytics');
      setAnalytics(data.summary || data.analytics);
      setTopRoutes(data.topRoutes || []);
      setStatusDist(data.bookingStatusDistribution || []);
    } catch { toast.error('Intelligence sync failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const p = location.pathname;
    if (p === '/admin') fetchOverview();
    else if (p === '/admin/users') fetchUsers();
    else if (p === '/admin/operators') fetchOperators();
    else if (p === '/admin/coupons') fetchCoupons();
    else if (p === '/admin/analytics') fetchAnalytics();
  }, [location.pathname, fetchOverview, fetchUsers, fetchOperators, fetchCoupons, fetchAnalytics]);

  const handleApproveOp = async (id) => {
    try {
      await api.patch(`/admin/operators/${id}/approve`);
      toast.success('Operator Authorized');
      fetchOperators();
    } catch { toast.error('Authorization failed'); }
  };

  const toggleUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`);
      toast.success('Access privilege updated');
      fetchUsers();
    } catch { toast.error('Update failed'); }
  };

  const handleCreateOp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/admin/operators', opForm);
      toast.success('Operator Authorized & Provisioned');
      setShowOpModal(false);
      setOpForm({ fullName: '', email: '', phone: '', password: '' });
      fetchOperators();
    } catch (err) { toast.error(err.response?.data?.message || 'Provisioning failed'); }
    finally { setLoading(false); }
  };

  if (loading && !stats && !users.length && !analytics) return <Loading message="Syncing with Command Center..." />;

  return (
    <SidebarLayout title="Master Control" menuItems={MENU_ITEMS}>
      <Routes>
        {/* ── OVERVIEW ── */}
        <Route index element={
          <div className="animate-slide-up">
            <header className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-4xl font-black text-on-surface tracking-tighter">Command Overview</h1>
                <p className="text-on-surface-variant text-sm font-medium mt-1">Platform health report as of {formatDate(new Date())}</p>
              </div>
              <Button onClick={fetchOverview} variant="ghost" icon={<span>🔄</span>}>Sync Core</Button>
            </header>

            <AdminKPI stats={stats} analytics={analytics} />

            <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
               <section>
                  <Card className="p-0 overflow-hidden">
                    <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
                       <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">Recent Enrollment</h3>
                       <Link to="/admin/users" className="text-[10px] font-black text-primary hover:underline uppercase">View Full Log</Link>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                       {users.slice(0, 5).map(u => (
                         <div key={u._id} className="px-8 py-5 flex items-center justify-between hover:bg-surface-container-low/50 transition-all">
                            <div>
                               <p className="text-xs font-black uppercase tracking-tight">{u.fullName}</p>
                               <p className="text-[10px] text-on-surface-variant font-bold uppercase">{u.email}</p>
                            </div>
                            <Badge variant={u.isActive ? 'success' : 'error'}>{u.isActive ? 'Active' : 'Locked'}</Badge>
                         </div>
                       ))}
                       {users.length === 0 && <EmptyState icon="👥" title="No Users" message="User database is empty." />}
                    </div>
                  </Card>
               </section>

               <aside className="space-y-8">
                  <div className="bg-primary text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                     <h4 className="text-xs font-black uppercase opacity-60 mb-8">Quick Intelligence</h4>
                     <p className="text-5xl font-black tracking-tighter mb-1 animate-pulse">{analytics?.totalBookings || 0}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Successful Flights</p>
                     <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <span className="text-9xl">📈</span>
                     </div>
                  </div>

                  <Card className="p-8">
                     <h4 className="text-xs font-black uppercase mb-6 tracking-widest">System Alerts</h4>
                     <div className="space-y-6">
                        {['Node Health: 99.9%', 'Gateway Online', 'Payload Reached Hub'].map((alert, i) => (
                          <div key={i} className="flex gap-4 items-center">
                             <div className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                             <p className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant">{alert}</p>
                          </div>
                        ))}
                     </div>
                  </Card>
               </aside>
            </div>
          </div>
        } />

        {/* ── USER DIRECTORY ── */}
        <Route path="users" element={<UserDirectoryPage users={users} onToggle={toggleUser} onRefresh={fetchUsers} loading={loading} />} />

        {/* ── OPERATOR REGISTRY ── */}
        <Route path="operators" element={
          <OperatorRegistryPage 
            operators={operators} 
            onApprove={handleApproveOp} 
            onRefresh={fetchOperators} 
            loading={loading}
            onAdd={() => setShowOpModal(true)}
            showModal={showOpModal}
            onCloseModal={() => setShowOpModal(false)}
            opForm={opForm}
            setOpForm={setOpForm}
            onSubmitOp={handleCreateOp}
          />
        } />

        {/* ── PROMOTIONS ── */}
        <Route path="coupons" element={<PromotionsPage coupons={coupons} onRefresh={fetchCoupons} loading={loading} />} />

        {/* ── ANALYTICS ── */}
        <Route path="analytics" element={<AnalyticsIntelligencePage analytics={analytics} topRoutes={topRoutes} statusDist={statusDist} onRefresh={fetchAnalytics} loading={loading} />} />
      </Routes>
    </SidebarLayout>
  );
}

/* ────────────────────────────────────────
   SUB-PAGES (USERS, OPERATORS, COUPONS, ANALYTICS)
   ──────────────────────────────────────── */

function UserDirectoryPage({ users, onToggle, onRefresh, loading }) {
  const [q, setQ] = useState('');
  const filtered = users.filter(u => u.fullName.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  
  return (
    <OperatorTable 
      title="Global Intelligence"
      subtitle="Traveler registry and access control metadata"
      loading={loading}
      onSearch={setQ}
      headers={[{ label: 'Identity' }, { label: 'Auth Role' }, { label: 'Current Status' }, { label: 'Privileges', align: 'right' }]}
      data={filtered}
      renderRow={u => (
        <tr key={u._id} className="hover:bg-surface-container-low transition-all">
          <td className="px-10 py-6">
            <p className="text-sm font-black uppercase tracking-tight">{u.fullName}</p>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">{u.email}</p>
          </td>
          <td className="px-10 py-6"><Badge variant="primary">{u.role}</Badge></td>
          <td className="px-10 py-6"><Badge variant={u.isActive ? 'success' : 'error'}>{u.isActive ? 'Authorized' : 'Suspended'}</Badge></td>
          <td className="px-10 py-6 text-right">
            <Button size="sm" variant="ghost" onClick={() => onToggle(u._id)}>{u.isActive ? 'Revoke Access' : 'Authorize user'}</Button>
          </td>
        </tr>
      )}
    />
  );
}

function OperatorRegistryPage({ operators, onApprove, onRefresh, loading, onAdd, showModal, onCloseModal, opForm, setOpForm, onSubmitOp }) {
  const [q, setQ] = useState('');
  const filtered = operators.filter(o => o.fullName.toLowerCase().includes(q.toLowerCase()) || o.email.toLowerCase().includes(q.toLowerCase()));
  
  return (
    <>
      <OperatorTable 
        title="Fleet Principal Registry"
        subtitle="Manage authorization for verified enterprise partners"
        loading={loading}
        onSearch={setQ}
        headers={[{ label: 'Entity Profile' }, { label: 'Identity String' }, { label: 'Authorization State' }, { label: 'Actions', align: 'right' }]}
        data={filtered}
        actions={<Button size="sm" onClick={onAdd}>+ Provision Operator</Button>}
        renderRow={o => (
          <tr key={o._id} className="hover:bg-surface-container-low transition-all">
            <td className="px-10 py-6"><p className="text-sm font-black uppercase text-on-surface">{o.fullName}</p></td>
            <td className="px-10 py-6"><p className="text-[10px] font-black uppercase text-on-surface-variant">{o.email}</p></td>
            <td className="px-10 py-6">
              <Badge variant={o.isVerified ? 'primary' : 'neutral'}>{o.isVerified ? 'Verified Principal' : 'Awaiting Review'}</Badge>
            </td>
            <td className="px-10 py-6 text-right">
              {!o.isVerified && <Button size="sm" onClick={() => onApprove(o._id)}>Authorize Link</Button>}
            </td>
          </tr>
        )}
      />

      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-on-surface/80 backdrop-blur-xl animate-fade-in" onClick={onCloseModal}></div>
          <Card className="w-full max-w-lg p-12 relative animate-slide-up bg-white">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Issue Credentials</h3>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2">Provision new operator node</p>
              </div>
              <button onClick={onCloseModal} className="text-2xl opacity-40 hover:opacity-100 transition-opacity">✕</button>
            </div>
            <form onSubmit={onSubmitOp} className="space-y-6">
              <Input label="Full Operational Name" required value={opForm.fullName} onChange={e => setOpForm({...opForm, fullName: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Fleet Email" type="email" required value={opForm.email} onChange={e => setOpForm({...opForm, email: e.target.value})} />
                 <Input label="Contact Node" required value={opForm.phone} onChange={e => setOpForm({...opForm, phone: e.target.value})} />
              </div>
              <Input label="Passcode Allocation" type="password" required value={opForm.password} onChange={e => setOpForm({...opForm, password: e.target.value})} />
              <Button type="submit" fullWidth loading={loading} className="mt-8">Initialize Node ✓</Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

function PromotionsPage({ coupons, onRefresh, loading }) {
  return (
    <div className="animate-slide-up">
       <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">Promotional Assets</h2>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Platform-wide discount corridors and retention tools.</p>
          </div>
          <Button icon={<span>+</span>}>Generate Coupon</Button>
       </header>
       
       <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.length > 0 ? coupons.map(c => (
            <Card key={c._id} className="!border-dashed !border-2 !border-primary/20 bg-surface-container-low/20">
              <div className="flex justify-between items-start mb-8">
                 <Badge variant="primary">{c.discount}% REDUCTION</Badge>
                 <span className="text-[10px] font-black text-success uppercase">Active Asset</span>
              </div>
              <h4 className="text-4xl font-black text-primary tracking-[0.1em] mb-4">{c.code}</h4>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-t border-primary/10 pt-4">Expires: {formatDate(c.expiryDate)}</p>
            </Card>
          )) : (
            <div className="lg:col-span-3">
               <EmptyState icon="🎫" title="No Assets Identified" message="No promotional codes have been provisioned yet." />
            </div>
          )}
       </div>
    </div>
  );
}

function AnalyticsIntelligencePage({ analytics, topRoutes, statusDist, onRefresh, loading }) {
  return (
    <div className="space-y-12 animate-slide-up">
       <header className="flex items-center justify-between">
          <h2 className="text-4xl font-black tracking-tighter uppercase">Market Intelligence</h2>
          <Button variant="ghost" icon={<span>📈</span>} onClick={onRefresh}>Sync Data Cloud</Button>
       </header>

       <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Platform Bookings', val: analytics?.totalBookings || 0, icon: '🎫', color: 'text-primary' },
            { label: 'Gross Volume (GTV)', val: formatCurrency(analytics?.totalRevenue || 0), icon: '💰', color: 'text-success' },
            { label: 'Avg Sale Price', val: analytics?.totalBookings ? formatCurrency((analytics.totalRevenue / analytics.totalBookings).toFixed(0)) : '₹0', icon: '📊', color: 'text-tertiary' },
            { label: 'Active Asset Nodes', val: topRoutes.length || 0, icon: '🗺️', color: 'text-on-surface' },
          ].map(item => (
            <Card key={item.label} className="group cursor-default relative overflow-hidden">
               <span className="text-3xl mb-4 block">{item.icon}</span>
               <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{item.label}</p>
               <p className={`text-4xl font-black tracking-tighter ${item.color}`}>{item.val}</p>
               <div className="absolute top-0 right-0 h-full w-1 bg-primary/0 group-hover:bg-primary/20 transition-all" />
            </Card>
          ))}
       </div>

       <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
          <section>
            <Card className="p-0 overflow-hidden">
               <div className="px-10 py-8 border-b border-outline-variant/10 bg-surface-container-low/30">
                  <h3 className="text-xl font-black text-on-surface uppercase tracking-tighter">High Performance Hubs</h3>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Ranking by operational volume</p>
               </div>
               {topRoutes.length > 0 ? (
                 <div className="divide-y divide-outline-variant/10">
                   {topRoutes.map((r, i) => {
                     const pct = topRoutes[0]?.count ? Math.round((r.count / topRoutes[0].count) * 100) : 0;
                     return (
                       <div key={r._id} className="px-10 py-8 hover:bg-surface-container-low/50 transition-all group">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-6">
                                <span className="text-2xl font-black text-on-surface/10 group-hover:text-primary/20 transition-colors">0{i+1}</span>
                                <div>
                                   <p className="text-sm font-black text-on-surface uppercase tracking-tight">{r.origin} ➔ {r.destination}</p>
                                   <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest italic">{r.count} SUCCESSFUL JOURNEYS</p>
                                </div>
                             </div>
                             <p className="text-2xl font-black text-primary">{pct}%</p>
                          </div>
                          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                             <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                          </div>
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <EmptyState icon="📈" title="Intelligence Gathering" message="Operational metrics will mirror here once network volume increases." />
               )}
            </Card>
          </section>

          <aside className="space-y-12">
             <Card className="p-10">
                <h4 className="text-sm font-black uppercase tracking-widest mb-10 text-on-surface">Transmission State</h4>
                {statusDist.length > 0 ? (
                  <div className="space-y-8">
                     {statusDist.map(s => {
                        const total = statusDist.reduce((acc, x) => acc + x.count, 0);
                        const pct = total ? Math.round((s.count / total) * 100) : 0;
                        const colorMap = { confirmed: 'bg-success', cancelled: 'bg-error', pending: 'bg-warning', paid: 'bg-primary' };
                        return (
                          <div key={s._id}>
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s._id || 'Standard'}</span>
                                <span className="text-[10px] font-black text-on-surface-variant">{pct}%</span>
                             </div>
                             <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                                <div className={`h-full ${colorMap[s._id] || 'bg-primary'} rounded-full`} style={{ width: `${pct}%` }} />
                             </div>
                          </div>
                        );
                     })}
                  </div>
                ) : <EmptyState icon="💠" title="No Telemetry" />}
             </Card>

             <div className="bg-on-surface text-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-10">Financial Distribution</h4>
                <div className="space-y-10 relative z-10">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-light mb-2">Platform Gross Value (PGV)</p>
                      <p className="text-5xl font-black tracking-tighter text-white">{formatCurrency(analytics?.totalRevenue || 0)}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-10 border-t border-white/10 pt-10">
                      <div>
                         <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-1">Commission (10%)</p>
                         <p className="text-2xl font-black">{formatCurrency((analytics?.totalRevenue || 0) * 0.1)}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-1">Partner Share</p>
                         <p className="text-2xl font-black">{formatCurrency((analytics?.totalRevenue || 0) * 0.9)}</p>
                      </div>
                   </div>
                </div>
                <div className="absolute -right-20 -top-20 h-64 w-64 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
             </div>
          </aside>
       </div>
    </div>
  );
}
