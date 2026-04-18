import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { registerThunk, verifyOtpThunk, clearError, setTempEmail } from '../redux/slices/authSlice';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, '10 digits required'),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Match fail",
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
      toast.success('Security Code Sent');
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Check OTP');
    const res = await dispatch(verifyOtpThunk({ email: tempEmail, otp }));
    if (verifyOtpThunk.fulfilled.match(res)) {
      toast.success('Verified');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-16 text-white text-center">
         <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight">Join the Elite <br />Travel Network.</h2>
         <p className="mt-4 text-primary-light opacity-80 max-w-xs mx-auto">Access premium bus routes, real-time tracking, and exclusive pricing.</p>
         
         <div className="mt-12 space-y-4 w-full max-w-xs text-left">
            {['Global Route Coverage', 'Priority Boarding', 'Instant Refunds'].map(f => (
               <div key={f} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-primary-light font-black uppercase tracking-widest text-[10px]">Active</span>
                  <span className="text-xs font-bold">{f}</span>
               </div>
            ))}
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
         <div className="w-full max-w-md">
            {!tempEmail ? (
               <>
                  <h1 className="text-4xl font-black text-text-main uppercase tracking-tighter">Register</h1>
                  <p className="mt-2 text-sm text-text-muted">Experience the future of intercity transit.</p>

                  <form onSubmit={handleSubmit(onRegister)} className="mt-10 space-y-5">


                     <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Full Name</label>
                        <input {...register('fullName')} className="input-field" placeholder="Eg. Sharath Kumar" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Email</label>
                           <input type="email" {...register('email')} className="input-field" placeholder="you@host.com" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Phone</label>
                           <input type="tel" {...register('phone')} className="input-field" placeholder="10 Digits" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Password</label>
                           <input type="password" {...register('password')} className="input-field" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Confirm</label>
                           <input type="password" {...register('confirmPassword')} className="input-field" />
                        </div>
                     </div>

                     <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 uppercase font-black tracking-widest shadow-xl">
                        {isLoading ? 'Processing...' : 'Initialize Account'}
                     </button>
                  </form>
               </>
            ) : (
               <div className="text-center">
                  <h1 className="text-4xl font-black text-text-main uppercase tracking-tighter">Verify</h1>
                  <p className="mt-2 text-sm text-text-muted">Enter the 6-digit code sent to your email.</p>

                  <form onSubmit={onVerifyOtp} className="mt-10 space-y-8">
                     <input 
                        type="text" maxLength="6" value={otp} 
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-5xl tracking-[0.4em] font-black py-6 bg-surface-alt border-2 border-surface-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="000000"
                        autoFocus
                     />
                     <button type="submit" disabled={isLoading || otp.length < 6} className="btn-primary w-full py-4 uppercase tracking-widest font-black">
                        {isLoading ? 'Verifying...' : 'Unlock Account'}
                     </button>
                     
                     <div className="flex items-center justify-between mt-4">
                        <button type="button" onClick={() => dispatch(setTempEmail(null))} className="text-[10px] font-black uppercase text-text-muted hover:text-primary transition-colors tracking-widest">
                           ← Change Email
                        </button>
                        <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">
                           Didn't get it? <button type="button" className="text-primary underline hover:text-primary-light">Resend</button>
                        </p>
                     </div>
                  </form>
               </div>
            )}

            {!tempEmail && (
              <div className="mt-10 pt-10 border-t border-surface-border text-center">
                 <p className="text-sm text-text-muted">Already a member?</p>
                 <Link to="/login" className="mt-4 btn-secondary w-full uppercase text-xs tracking-widest font-black">Standard Login</Link>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
