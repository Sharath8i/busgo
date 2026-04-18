import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function SidebarLayout({ children, menuItems, title }) {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-surface-container-low font-body text-on-surface">
      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-outline-variant/10 flex flex-col z-[100]">
        <div className="p-8">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <span className="text-lg font-black text-on-surface leading-none block">Fleet Manager</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 opacity-60">Enterprise Tier</span>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                group flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                ${isActive ? 'bg-primary-container/5 text-primary border-l-4 border-primary ml-[-16px] pl-[28px]' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}
              `}
            >
              <span className={`text-lg transition-transform group-hover:scale-110 ${item.isActive ? 'text-primary' : 'opacity-70'}`}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 space-y-4">
           <button className="w-full flex items-center gap-3 px-6 py-3 text-xs font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">
              <span className="text-lg">❓</span>
              Support
           </button>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-6 py-3 text-xs font-black text-error uppercase tracking-widest hover:bg-error/5 rounded-xl transition-all"
           >
              <span className="text-lg">🚪</span>
              Logout
           </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-10 flex items-center justify-between sticky top-0 z-50">
           <div className="relative w-96 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40">🔍</span>
              <input 
                type="text" 
                placeholder="Search operations..." 
                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-xs font-bold"
              />
           </div>

           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-on-surface uppercase tracking-tighter leading-none">{user?.fullName || 'Admin Root'}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 opacity-60">{user?.role === 'admin' ? 'Super Administrator' : 'Fleet Operator'}</p>
                 </div>
                 <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black uppercase shadow-lg shadow-primary/20">
                    {user?.fullName?.charAt(0) || 'A'}
                 </div>
              </div>
           </div>
        </header>

        <main className="p-10 flex-1">
          {children}
        </main>

        {/* Status Bar */}
        <footer className="h-12 bg-on-surface text-white/40 px-10 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-success">
                 <span className="h-2 w-2 bg-success rounded-full animate-pulse"></span>
                 System Online
              </div>
              <div className="hidden md:block">Load Balancer: <span className="text-white">Normal (14%)</span></div>
              <div className="hidden md:block">Active Sessions: <span className="text-white">1,204</span></div>
           </div>
           <div>V2.4.0-ENTERPRISE</div>
        </footer>
      </div>
    </div>
  );
}
