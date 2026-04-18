import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-surface-border">
      <div className="flex justify-between items-center h-16 px-8 max-w-[1440px] mx-auto">
        
        {/* Logo */}
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary">
            BusGo
          </Link>
          
          <div className="hidden items-center gap-8 md:flex">
             <Link to="/my-bookings" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">My Bookings</Link>
             <Link to="/offers" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">Offers</Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="hidden md:block text-right group cursor-pointer">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1 group-hover:text-primary-light transition-colors">{user.role}</p>
                <p className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{user.fullName}</p>
              </Link>
              
              {user.role === 'admin' && <Link to="/admin" className="btn-primary !py-2 !px-4 text-[10px] uppercase font-black">Admin Panel</Link>}
              {user.role === 'operator' && <Link to="/operator" className="btn-secondary !py-2 !px-4 text-[10px] uppercase font-black">Fleet Ops</Link>}
              
              <button 
                onClick={onLogout}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface-container-low border border-surface-border hover:bg-error/10 hover:text-error transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">Sign in</Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Sign up
              </Link>
            </div>
          )}

          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-surface-container-low"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12h18M3 6h18M3 18h18"/>
             </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-surface-border p-6 space-y-4 animate-slide-up">
           <Link to="/my-bookings" className="block text-sm font-black uppercase tracking-widest text-text-main" onClick={() => setMobileOpen(false)}>My Bookings</Link>
           <Link to="/offers" className="block text-sm font-black uppercase tracking-widest text-text-main" onClick={() => setMobileOpen(false)}>Offers</Link>
           <hr className="border-surface-border" />
           {user ? (
             <button onClick={onLogout} className="text-sm font-black text-error uppercase tracking-widest">Log out</button>
           ) : (
             <Link to="/login" className="block text-sm font-black uppercase tracking-widest text-primary" onClick={() => setMobileOpen(false)}>Login</Link>
           )}
        </div>
      )}
    </nav>
  );
}
