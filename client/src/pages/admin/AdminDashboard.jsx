import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils/format';
import SidebarLayout from '../../layouts/SidebarLayout';

const MENU_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: '📊', end: true },
  { label: 'Operators', path: '/admin/operators', icon: '🚌' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Coupons', path: '/admin/coupons', icon: '🏷️' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
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
      setUsers(u.data.items);
      setAnalytics(a.data.summary);
    } catch { toast.error('Overview sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data.items);
    } catch { toast.error('Users sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/operators');
      setOperators(data.operators);
    } catch { toast.error('Operators sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.coupons || []);
    } catch { toast.error('Coupons sync failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/analytics');
      setAnalytics(data.summary || data.analytics);
      setTopRoutes(data.topRoutes || []);
      setStatusDist(data.bookingStatusDistribution || []);
    } catch { toast.error('Analytics sync failed'); }
    finally { setLoading(false); }
  }, []);

  // Trigger correct fetch based on current path
  useEffect(() => {
    if (location.pathname === '/admin') fetchOverview();
    else if (location.pathname === '/admin/users') fetchUsers();
    else if (location.pathname === '/admin/operators') fetchOperators();
    else if (location.pathname === '/admin/coupons') fetchCoupons();
    else if (location.pathname === '/admin/analytics') fetchAnalytics();
  }, [location.pathname, fetchOverview, fetchUsers, fetchOperators, fetchCoupons, fetchAnalytics]);

  const handleApproveOp = async (id) => {
    try {
      await api.patch(`/admin/operators/${id}/approve`);
      toast.success('Operator Authorized');
      fetchOperators();
    } catch { toast.error('Approval failed'); }
  };

  const toggleUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`);
      toast.success('Access Updated');
      fetchUsers();
    } catch { toast.error('Update failed'); }
  };

  if (loading && !stats && !users.length) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
       <div className="text-center font-black uppercase text-xs tracking-[0.3em] text-primary animate-pulse">Establishing Command Link...</div>
    </div>
  );

  return (
    <SidebarLayout title="Master Control" menuItems={MENU_ITEMS}>
      <Routes>
        <Route index element={
          <div className="animate-slide-up">
            {/* ── OVERVIEW HEADER ── */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-4xl font-black text-on-surface tracking-tighter">Operations Overview</h1>
                <p className="text-on-surface-variant text-sm font-medium mt-1">Status Report: {formatDate(new Date())}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={fetchOverview} className="btn-secondary h-[46px] px-8 text-[10px] uppercase font-black">Sync Platform 🔄</button>
              </div>
            </div>

            {/* KPI Strip */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
               {[
                 { label: 'Platform Revenue', val: formatCurrency(stats?.revenueTotal || analytics?.totalRevenue || 0), color: 'text-primary' },
                 { label: 'Active Sessions', val: stats?.activeUsers || 1204, color: 'text-success' },
                 { label: 'Live Routes', val: 15, color: 'text-tertiary' },
                 { label: 'Fleet Status', val: 'Operational', color: 'text-on-surface' }
               ].map(k => (
                 <div key={k.label} className="bg-white p-8 rounded-[2rem] editorial-shadow border border-outline-variant/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{k.label}</p>
                    <p className={`text-3xl font-black tracking-tight ${k.color}`}>{k.val}</p>
                 </div>
               ))}
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
               <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden">
                  <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/20">
                     <h3 className="text-xl font-black text-on-surface">Recent Activity</h3>
                     <Link to="/admin/users" className="text-[10px] font-black text-primary uppercase tracking-widest">Global Map →</Link>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <tbody className="divide-y divide-outline-variant/10">
                           {users.map(u => (
                              <tr key={u._id} className="hover:bg-surface-container-low transition-all">
                                 <td className="px-10 py-6 font-bold text-sm text-on-surface uppercase tracking-tight">{u.fullName}</td>
                                 <td className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase">{u.email}</td>
                                 <td className="px-10 py-6 text-right">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${u.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                       {u.isActive ? 'Active' : 'Locked'}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </section>

               <aside className="space-y-8">
                  <div className="bg-primary text-white p-10 rounded-[2.5rem] shadow-xl">
                     <h4 className="text-xs font-black uppercase opacity-60 mb-8">Quick Intelligence</h4>
                     <p className="text-3xl font-black mb-1">{analytics?.totalBookings || 0}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Successful Transactions</p>
                     <div className="mt-10 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-3/4" />
                     </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-10 editorial-shadow border border-outline-variant/10">
                     <h4 className="text-xs font-black uppercase mb-8">Recent Alerts</h4>
                     <div className="space-y-6">
                        {['Safety Audit Passed', 'New Hub Active', 'Operator Resigned'].map((alert, i) => (
                          <div key={i} className="flex gap-4">
                             <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                             <p className="text-[10px] font-black uppercase leading-tight">{alert}</p>
                          </div>
                        ))}
                     </div>
                  </div>
               </aside>
            </div>
          </div>
        } />

        <Route path="users" element={
          <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden animate-slide-up">
            <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Global User Directory</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Authorized Access Only</p>
              </div>
              <button className="px-6 py-3 bg-surface-container rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={fetchUsers}>Sync Records</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest">Identity</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest">Role</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-surface-container-low transition-all">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black uppercase">{u.fullName}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase">{u.email}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-primary/5 text-primary rounded">{u.role}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          {u.isActive ? 'Authorized' : 'Locked'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button onClick={() => toggleUser(u._id)} className="text-[10px] font-black text-primary uppercase underline transition-all">
                           {u.isActive ? 'Suspend' : 'Reinstate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        } />

        <Route path="operators" element={
          <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden animate-slide-up">
            <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Fleet Operator Registry</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Verification Management</p>
              </div>
              <button className="px-6 py-3 bg-surface-container rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={fetchOperators}>Sync Registry</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest">Operator</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest">Approval</th>
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {operators.map(o => (
                    <tr key={o._id} className="hover:bg-surface-container-low transition-all">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black uppercase">{o.fullName}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase">{o.email}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.isVerified ? 'bg-primary-light/40 text-primary' : 'bg-amber-100/50 text-amber-700'}`}>
                          {o.isVerified ? 'Verified' : 'Review Required'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        {!o.isVerified && (
                          <button onClick={() => handleApproveOp(o._id)} className="px-6 py-2 bg-primary text-white text-[10px] uppercase font-black tracking-widest rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all">Approve Authorization</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        } />

        <Route path="coupons" element={
          <div className="animate-slide-up">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Promotional Assets</h2>
                <button className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg ring-offset-4 ring-primary/20 hover:ring-2 transition-all">+ Generate Asset</button>
             </div>
             
             <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.length > 0 ? coupons.map(c => (
                  <div key={c._id} className="bg-white p-10 rounded-[2.5rem] editorial-shadow border-2 border-dashed border-primary/20 flex flex-col justify-between">
                    <div>
                       <p className="text-4xl font-black text-primary tracking-tighter mb-2">{c.code}</p>
                       <p className="text-xs font-bold text-on-surface-variant">Expires: {formatDate(c.expiryDate)}</p>
                    </div>
                    <div className="mt-8 flex justify-between items-end">
                       <p className="text-2xl font-black text-on-surface">{c.discount}% OFF</p>
                       <span className="text-[10px] font-black text-success uppercase">Active</span>
                    </div>
                  </div>
                )) : (
                  <div className="lg:col-span-3 text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-outline-variant/20 italic text-on-surface-variant">
                     No coupon assets currently established.
                  </div>
                )}
             </div>
          </div>
        } />

        <Route path="analytics" element={
          <div className="space-y-12 animate-slide-up">
             <header className="flex items-center justify-between">
                <div>
                   <h2 className="text-4xl font-black tracking-tighter">Revenue Intelligence</h2>
                   <p className="text-on-surface-variant text-sm font-medium mt-1">Platform-wide performance metrics and route analytics.</p>
                </div>
                <button onClick={fetchAnalytics} className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Refresh Intelligence 📈</button>
             </header>

             {/* KPI Cards */}
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total Bookings', val: analytics?.totalBookings || 0, icon: '🎫', color: 'text-primary' },
                  { label: 'Gross Revenue', val: formatCurrency(analytics?.totalRevenue || 0), icon: '💰', color: 'text-success' },
                  { label: 'Avg. Ticket Value', val: analytics?.totalBookings ? formatCurrency((analytics.totalRevenue / analytics.totalBookings).toFixed(0)) : '₹0', icon: '📊', color: 'text-tertiary' },
                  { label: 'Active Routes', val: topRoutes.length || 0, icon: '🗺️', color: 'text-on-surface' },
                ].map(item => (
                  <div key={item.label} className="bg-white p-10 rounded-[2.5rem] editorial-shadow border border-outline-variant/10 relative overflow-hidden group">
                     <span className="text-3xl mb-6 block">{item.icon}</span>
                     <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{item.label}</p>
                     <p className={`text-3xl font-black tracking-tighter ${item.color}`}>{item.val}</p>
                     <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-500" />
                  </div>
                ))}
             </div>

             <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
                {/* Top Routes from Backend */}
                <section className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden">
                   <div className="px-10 py-8 border-b border-outline-variant/10">
                      <h3 className="text-xl font-black text-on-surface">Top Performing Routes</h3>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Ranked by booking volume</p>
                   </div>
                   {topRoutes.length > 0 ? (
                     <div className="divide-y divide-outline-variant/10">
                       {topRoutes.map((r, i) => {
                         const maxCount = topRoutes[0]?.count || 1;
                         const pct = Math.round((r.count / maxCount) * 100);
                         return (
                           <div key={r._id} className="px-10 py-8 hover:bg-surface-container-low/50 transition-all group">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-4">
                                    <span className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm ${
                                       i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' :
                                       i === 1 ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container text-on-surface-variant'
                                    }`}>#{i + 1}</span>
                                    <div>
                                       <p className="text-sm font-black text-on-surface uppercase tracking-tight">{r.origin} → {r.destination}</p>
                                       <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Route ID: {r._id?.slice(-6)}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-2xl font-black text-primary">{r.count}</p>
                                    <p className="text-[8px] font-black text-on-surface-variant uppercase">Bookings</p>
                                 </div>
                              </div>
                              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                                 <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                              </div>
                           </div>
                         );
                       })}
                     </div>
                   ) : (
                     <div className="px-10 py-16 text-center text-on-surface-variant italic">No route data available yet. Bookings will populate this section.</div>
                   )}
                </section>

                <aside className="space-y-10">
                   {/* Booking Status Distribution */}
                   <div className="bg-white rounded-[2.5rem] editorial-shadow border border-outline-variant/10 p-10">
                      <h4 className="text-sm font-black uppercase tracking-widest mb-8">Booking Status</h4>
                      {statusDist.length > 0 ? (
                        <div className="space-y-6">
                           {statusDist.map(s => {
                              const total = statusDist.reduce((acc, x) => acc + x.count, 0);
                              const pct = total ? Math.round((s.count / total) * 100) : 0;
                              const colorMap = { confirmed: 'bg-success', cancelled: 'bg-error', pending: 'bg-warning', paid: 'bg-primary' };
                              const bgColor = colorMap[s._id] || 'bg-primary';
                              return (
                                <div key={s._id}>
                                   <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-black uppercase tracking-widest">{s._id || 'Unknown'}</span>
                                      <span className="text-xs font-black text-on-surface-variant">{s.count} ({pct}%)</span>
                                   </div>
                                   <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                                      <div className={`h-full ${bgColor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                   </div>
                                </div>
                              );
                           })}
                        </div>
                      ) : (
                        <p className="text-on-surface-variant italic text-sm">No booking data yet.</p>
                      )}
                   </div>

                   {/* Revenue Breakdown */}
                   <div className="bg-on-surface text-white rounded-[2.5rem] p-10">
                      <h4 className="text-xs font-black uppercase tracking-widest opacity-60 mb-8">Revenue Breakdown</h4>
                      <div className="space-y-8">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-light mb-1">Gross Transaction Value</p>
                            <p className="text-4xl font-black tracking-tighter">{formatCurrency(analytics?.totalRevenue || 0)}</p>
                         </div>
                         <div className="h-px bg-white/10" />
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                               <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-1">Platform Fee (10%)</p>
                               <p className="text-xl font-black">{formatCurrency((analytics?.totalRevenue || 0) * 0.1)}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-1">Operator Payouts</p>
                               <p className="text-xl font-black">{formatCurrency((analytics?.totalRevenue || 0) * 0.9)}</p>
                            </div>
                         </div>
                         <div className="h-px bg-white/10" />
                         <div>
                            <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-1">GST Collected (5%)</p>
                            <p className="text-xl font-black">{formatCurrency((analytics?.totalRevenue || 0) * 0.05)}</p>
                         </div>
                      </div>
                   </div>
                </aside>
             </div>
          </div>
        } />
      </Routes>
    </SidebarLayout>
  );
}
