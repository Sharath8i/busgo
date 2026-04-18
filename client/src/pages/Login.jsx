import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { loginThunk, clearError, setTempEmail } from '../redux/slices/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  });
  const { isLoading, error, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'operator') navigate('/operator');
      else navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  }, [user, navigate, location]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const res = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(res)) {
      toast.success('Welcome back!');
    } else if (loginThunk.rejected.match(res)) {
       // Logic for email verification if needed
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* ── LEFT SIDE: LOGIN FORM ── */}
      <div className="w-full md:w-1/2 lg:w-[45%] bg-surface flex flex-col px-8 md:px-16 lg:px-24 py-12 relative z-10 transition-all duration-500">
        
        {/* Header/Logo Area */}
        <div className="flex items-center justify-between mb-16">
          <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary">BusGo</Link>
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-sm font-medium">New here?</span>
            <Link to="/register" className="text-primary font-bold text-sm hover:underline active:scale-95 transition-all">Register</Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-md w-full mx-auto md:mx-0 flex-grow flex flex-col justify-center animate-slide-up">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">Welcome Back</h1>
            <p className="text-on-surface-variant font-medium leading-relaxed">Access your itinerary and manage your journeys with ease.</p>
          </div>

          {/* Demo Info */}
          <div className="mb-8 p-4 bg-surface-container-low rounded-xl border border-surface-border">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Platform Credentials</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-on-surface-variant font-bold">Admin</p>
                <p className="text-on-surface font-medium truncate">admin@busgo.test</p>
              </div>
              <div>
                <p className="text-on-surface-variant font-bold">Password</p>
                <p className="text-on-surface font-medium">Test@1234</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Email Address</label>
              <input 
                type="email" 
                {...register('email', { required: true })} 
                className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 transition-all font-bold" 
                placeholder="name@company.com" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Password</label>
                <Link to="#" className="text-xs font-semibold text-primary hover:text-primary-container">Forgot Password?</Link>
              </div>
              <input 
                type="password" 
                {...register('password', { required: true })} 
                className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 transition-all font-bold" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-b from-primary to-primary-container text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? 'Authenticating...' : 'Sign In ➜'}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-8">
              <div className="w-full h-px bg-surface-border"></div>
              <span className="absolute px-4 bg-surface text-[10px] font-black text-outline-variant uppercase tracking-widest">Or continue with</span>
            </div>
            
            <div className="flex justify-center">
              <button className="flex items-center justify-center gap-3 py-3.5 px-8 border border-surface-border rounded-xl hover:bg-surface-container-low transition-colors active:scale-95 w-full max-w-sm group">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiDRtKJVXw1OS8XC1u_y9s7FSm88c0uVDiuz4dppDNKoNWM-uZMIiV4j2pot66Xi3kpHndrtdkZ3Gajpj-mtTqXn8cWT8A4DnZblXGRh7FHh8HDCk326X2-4Qe0Gw56JfeVD4OO_aZ8XIMwZIme5ujMs93bbNjiBBA281NfGMjB-Ry9COOaWkqlTRprGjdMQsY93NDIYUGwvs4hjR0bu93RuXWrEYYCpYZgvS3p-RU4RRPQ4fK3zWPG6XFiYVKws3xyJaNd8ry4O8" 
                  alt="Google" 
                  className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"
                />
                <span className="text-sm font-black text-on-surface uppercase tracking-widest">Google Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 flex flex-wrap gap-x-6 gap-y-2 opacity-60">
          <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">Terms</Link>
          <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">Support</Link>
        </div>
      </div>

      {/* ── RIGHT SIDE: IMAGERY & BRAND ── */}
      <div className="hidden md:block md:w-1/2 lg:w-[55%] relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-primary-container">
          <img 
            className="w-full h-full object-cover mix-blend-multiply opacity-60" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtUCdxLgFOMXOMXIqPClnwxjlWFYjqs4ODaLFJ0jEVpG3U3qynekFDknld-YsigWt2B_xYDkKZHn_BY-v8JyQvcIvBKzqMxQii5R1MH_mDFTLXd93tfkExpIv2MO3dmT6pE1hqvvS2ITSslVUN4D3wVjZnshihL46zaw-TRIcH-n3rrvRfnVDtIFmOCQ7X5jRYsT4h4AftwBPUDrI6-q5h8D0_Q63ejH1U6zgg1DfWQjYCWWDgSA9Ml2IHGHUOuBlvyv7ucnPT5xY" 
            alt="Luxury Bus Interior"
          />
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-transparent to-primary/20"></div>

        {/* Text Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-16 lg:p-24">
          <div className="relative animate-slide-up">
            <span className="inline-block px-4 py-1 bg-tertiary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
              Kinetic Editorial
            </span>
            <h2 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tighter mb-6">
              Redesigning the way we <span className="text-primary-light italic font-black">move.</span>
            </h2>
            <p className="text-xl text-white/80 max-w-lg font-medium leading-relaxed">
              Experience travel as a high-end service. More than a booking tool, we are your digital concierge on every road.
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white/20 bg-slate-200 overflow-hidden shadow-xl">
                   <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <span className="text-white/60 text-sm font-bold tracking-tight">+2.4k commuters joined today</span>
          </div>
        </div>

        {/* Global Stats Badge */}
        <div className="absolute top-24 right-16 hidden lg:block animate-slide-up">
          <div className="backdrop-blur-xl bg-white/10 p-6 rounded-3xl border border-white/20 shadow-2xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-tertiary flex items-center justify-center text-3xl">
              🚌
            </div>
            <div>
              <div className="text-white text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Live Fleet</div>
              <div className="text-white text-2xl font-black tabular-nums tracking-tighter">842 Active</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
