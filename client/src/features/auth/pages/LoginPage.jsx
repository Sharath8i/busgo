import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { loginThunk, clearError } from '../authSlice';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Badge from '../../../components/common/Badge';

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
      toast.success('Welcome back to BusGo!');
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-surface">
      {/* ── LEFT SIDE: CONTENT ── */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col px-8 md:px-16 lg:px-24 py-12 relative z-10">
        
        <header className="flex items-center justify-between mb-20 animate-slide-up">
          <Link to="/" className="text-3xl font-black italic tracking-tighter text-primary">BusGo</Link>
          <div className="flex items-center gap-3">
            <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest">New Traveler?</span>
            <Link to="/register" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Join Us</Link>
          </div>
        </header>

        <div className="max-w-md w-full mx-auto md:mx-0 flex-grow flex flex-col justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-12">
            <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-4">Resume Your Journey</h1>
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed max-w-sm">Access your bookings and travel preferences in high fidelity.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Input 
              label="Email Identity" 
              type="email" 
              {...register('email', { required: 'Email address is required' })} 
              error={errors.email?.message}
              placeholder="operator@busgo.app" 
            />

            <div className="space-y-2">
              <Input 
                label="Secure Passcode" 
                type="password" 
                {...register('password', { required: 'Passcode is mandatory' })} 
                error={errors.password?.message}
                placeholder="••••••••" 
              />
              <div className="flex justify-end pt-1">
                <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-container transition-colors">Recover Credentials?</Link>
              </div>
            </div>

            <Button type="submit" fullWidth loading={isLoading} size="lg" className="mt-4">
              Authorize Access ➔
            </Button>
          </form>

          <div className="mt-12 opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative flex items-center justify-center mb-10">
              <div className="w-full h-px bg-outline-variant/10"></div>
              <span className="absolute px-6 bg-surface text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Fleet Authentication</span>
            </div>

            <div className="flex justify-center">
              <button className="flex items-center justify-center gap-4 py-4 px-10 border border-outline-variant/20 rounded-2xl hover:bg-surface-container transition-all active:scale-95 w-full group overflow-hidden relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiDRtKJVXw1OS8XC1u_y9s7FSm88c0uVDiuz4dppDNKoNWM-uZMIiV4j2pot66Xi3kpHndrtdkZ3Gajpj-mtTqXn8cWT8A4DnZblXGRh7FHh8HDCk326X2-4Qe0Gw56JfeVD4OO_aZ8XIMwZIme5ujMs93bbNjiBBA281NfGMjB-Ry9COOaWkqlTRprGjdMQsY93NDIYUGwvs4hjR0bu93RuXWrEYYCpYZgvS3p-RU4RRPQ4fK3zWPG6XFiYVKws3xyJaNd8ry4O8" alt="G" className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em]">Enterprise Login</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-20 flex flex-wrap gap-8 opacity-40 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Link to="#" className="text-[9px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Privacy Protocal</Link>
          <Link to="#" className="text-[9px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors">T&C</Link>
          <Link to="#" className="text-[9px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Network Status</Link>
        </footer>
      </div>

      {/* ── RIGHT SIDE: ARTWORK ── */}
      <div className="hidden md:block md:w-1/2 lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-primary">
          <img className="w-full h-full object-cover mix-blend-overlay opacity-40 scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtUCdxLgFOMXOMXIqPClnwxjlWFYjqs4ODaLFJ0jEVpG3U3qynekFDknld-YsigWt2B_xYDkKZHn_BY-v8JyQvcIvBKzqMxQii5R1MH_mDFTLXd93tfkExpIv2MO3dmT6pE1hqvvS2ITSslVUN4D3wVjZnshihL46zaw-TRIcH-n3rrvRfnVDtIFmOCQ7X5jRYsT4h4AftwBPUDrI6-q5h8D0_Q63ejH1U6zgg1DfWQjYCWWDgSA9Ml2IHGHUOuBlvyv7ucnPT5xY" alt="Fleet" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-20 lg:p-32 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Badge variant="tertiary" className="mb-8 w-fit bg-white/10 text-white backdrop-blur-md px-6 border-white/20">Operational Hub</Badge>
          <h2 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
            The Digital <br /> <span className="text-primary italic">Backbone</span> of <br /> Modern Transit.
          </h2>
          <p className="text-xl text-white/60 max-w-md font-medium leading-relaxed">
            BusGo connects millions of journeys with world-class operational efficiency.
          </p>
        </div>
      </div>
    </main>
  );
}
