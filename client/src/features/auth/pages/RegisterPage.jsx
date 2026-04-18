import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { registerThunk, verifyOtpThunk, clearError, setTempEmail } from '../authSlice';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Badge from '../../../components/common/Badge';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, '10 digits required'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword'],
});

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, user, tempEmail } = useSelector((s) => s.auth);
  const [otp, setOtp] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onRegister = async (data) => {
    const { confirmPassword, ...payload } = data;
    const res = await dispatch(registerThunk(payload));
    if (registerThunk.fulfilled.match(res)) {
      toast.success('Universal Security Code Dispatched');
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Check OTP sequence');
    const res = await dispatch(verifyOtpThunk({ email: tempEmail, otp }));
    if (verifyOtpThunk.fulfilled.match(res)) {
      toast.success('Account Verified and Active');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row overflow-hidden">
      {/* ── LEFT SIDE: BRANDING ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-start justify-center p-24 text-white relative overflow-hidden">
         <div className="relative z-10 animate-slide-up">
            <Link to="/" className="text-3xl font-black italic tracking-tighter text-white mb-20 block">BusGo</Link>
            <h2 className="text-6xl font-black tracking-tighter leading-[0.9] mb-8">Access the <br />Future of <br /><span className="text-white opacity-40 italic">Intercity</span> Movement.</h2>
            <p className="text-xl text-white/50 max-w-sm font-medium leading-relaxed mb-12">Universal access to premium fleet networks and intelligent routing.</p>
            
            <div className="space-y-4">
               {['Market Intelligence', 'Instant Fleet Access', 'Priority Concierge'].map((f, i) => (
                  <div key={f} className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${0.4 + i*0.1}s` }}>
                     <div className="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-[10px]">✓</div>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{f}</span>
                  </div>
               ))}
            </div>
         </div>
         {/* Background Decoration */}
         <div className="absolute -right-32 -bottom-32 h-96 w-96 bg-white/5 rounded-full blur-3xl" />
         <div className="absolute left-20 top-20 h-64 w-64 bg-tertiary/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* ── RIGHT SIDE: FORM ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-12 overflow-y-auto">
         <div className="w-full max-w-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {!tempEmail ? (
               <>
                  <div className="mb-12">
                     <h1 className="text-5xl font-black text-on-surface tracking-tighter mb-4">Initialize Account</h1>
                     <p className="text-on-surface-variant font-medium text-sm">Join the network for premium transit services.</p>
                  </div>

                  <form onSubmit={handleSubmit(onRegister)} className="space-y-8">
                     <Input label="Identity Name" {...register('fullName')} error={errors.fullName?.message} placeholder="Eg. Sharath Kumar" />

                     <div className="grid grid-cols-2 gap-6">
                        <Input label="Email Identity" type="email" {...register('email')} error={errors.email?.message} placeholder="you@host.com" />
                        <Input label="Contact Node" type="tel" {...register('phone')} error={errors.phone?.message} placeholder="10 Digits" />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <Input label="Access Passcode" type="password" {...register('password')} error={errors.password?.message} />
                        <Input label="Re-type Passcode" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
                     </div>

                     <Button type="submit" fullWidth loading={isLoading} size="lg" className="mt-4">
                        Initialize Node ✓
                     </Button>
                  </form>

                  <div className="mt-12 pt-10 border-t border-outline-variant/10 text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-6">Established Member?</p>
                     <Link to="/login">
                        <Button variant="ghost" fullWidth>Relink Account ➜</Button>
                     </Link>
                  </div>
               </>
            ) : (
               <div className="text-center">
                  <div className="mb-12">
                     <h1 className="text-5xl font-black text-on-surface tracking-tighter mb-4">Verify Node</h1>
                     <p className="text-on-surface-variant font-medium text-sm">Transmit the 6-digit sequence sent to your hub.</p>
                  </div>

                  <form onSubmit={onVerifyOtp} className="space-y-10">
                     <div className="space-y-2">
                        <input 
                           type="text" maxLength="6" value={otp} 
                           onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                           className="w-full text-center text-6xl tracking-[0.5em] font-black py-8 bg-surface-container border-2 border-transparent focus:border-primary/20 rounded-[2rem] outline-none transition-all"
                           placeholder="000000"
                           autoFocus
                        />
                         <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-4">Security sequence required</p>
                     </div>
                     
                     <Button type="submit" fullWidth loading={isLoading} disabled={otp.length < 6} size="lg">
                        Finalize Sync ✓
                     </Button>
                     
                     <div className="flex items-center justify-between mt-8">
                        <button type="button" onClick={() => dispatch(setTempEmail(null))} className="text-[10px] font-black uppercase text-on-surface-variant hover:text-primary transition-colors tracking-widest">
                           ← Correct Hub ID
                        </button>
                        <button type="button" className="text-[10px] font-black uppercase text-primary underline tracking-widest">Resend Sequence</button>
                     </div>
                  </form>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
