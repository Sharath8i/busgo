import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
      scrolled ? 'py-4 glass-nav shadow-2xl backdrop-blur-3xl' : 'py-6 bg-transparent'
    }`}>
      <div className="flex justify-between items-center px-10 max-w-[1600px] mx-auto">
        
        {/* Brand Node */}
        <div className="flex items-center gap-16">
          <Link to="/" className="group flex items-center gap-3">
            <div className="h-9 w-9 bg-primary text-white flex items-center justify-center rounded-xl font-black italic text-lg shadow-xl shadow-primary/20 transition-transform group-hover:rotate-12">B</div>
            <span className="text-3xl font-black italic tracking-tighter text-on-surface group-hover:text-primary transition-colors">BusGo</span>
          </Link>
          
          <div className="hidden items-center gap-10 lg:flex">
             {['my-bookings', 'offers', 'destinations'].map((path) => (
                <Link 
                  key={path}
                  to={`/${path}`} 
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary relative group ${
                    location.pathname === `/${path}` ? 'text-primary' : 'text-on-surface/40'
                  }`}
                >
                  {path.replace('-', ' ')}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    location.pathname === `/${path}` ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
             ))}
          </div>
        </div>

        {/* Tactical Controls */}
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <Link to="/profile" className="hidden sm:flex flex-col items-end group">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1 group-hover:translate-x-1 transition-transform">{user.role}</p>
                 <p className="text-sm font-black text-on-surface leading-none">{user.fullName}</p>
              </Link>
              
              <div className="h-10 w-px bg-outline-variant/10 hidden sm:block" />

              {['admin', 'operator'].includes(user.role) && (
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/operator'} 
                  className="px-6 py-3 bg-on-surface text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-on-surface/10"
                >
                  Dashboard
                </Link>
              )}
              
              <button 
                onClick={onLogout}
                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-container-low border-2 border-transparent hover:border-error/20 hover:text-error transition-all group shadow-sm"
                title="Disconnect Node"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface/40 hover:text-primary transition-colors">SignIn</Link>
              <Link 
                to="/register" 
                className="px-8 py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
              >
                Join Network
              </Link>
            </div>
          )}

          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="lg:hidden h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-container shadow-sm p-3 group"
          >
             <div className="space-y-1.5 w-full">
                <div className={`h-0.5 w-full bg-on-surface rounded-full transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <div className={`h-0.5 w-3/4 bg-on-surface rounded-full transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
                <div className={`h-0.5 w-full bg-on-surface rounded-full transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
             </div>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-on-surface/90 backdrop-blur-xl z-[60] lg:hidden transition-all duration-500 ${
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
         <div className="flex flex-col h-full p-12">
            <div className="flex justify-between items-center mb-20">
               <span className="text-4xl font-black italic text-white tracking-tighter">BusGo.</span>
               <button onClick={() => setMobileOpen(false)} className="text-white">Close X</button>
            </div>
            
            <div className="space-y-10">
               {['my-bookings', 'offers', 'destinations', 'profile'].map((path) => (
                  <Link 
                    key={path}
                    to={`/${path}`} 
                    className="block text-4xl font-black uppercase tracking-tighter text-white/40 hover:text-primary transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {path.replace('-', ' ')}
                  </Link>
               ))}
            </div>

            <div className="mt-auto pt-10 border-t border-white/10">
               {user ? (
                 <button onClick={onLogout} className="text-xl font-black text-error uppercase tracking-widest">Terminate Session</button>
               ) : (
                 <div className="grid gap-4">
                    <Link to="/login" className="px-10 py-5 bg-white text-on-surface text-center rounded-2xl font-black uppercase tracking-widest">Sign In</Link>
                    <Link to="/register" className="px-10 py-5 bg-primary text-white text-center rounded-2xl font-black uppercase tracking-widest">Join Registry</Link>
                 </div>
               )}
            </div>
         </div>
      </div>
    </nav>
  );
}
