import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileThunk } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';

export default function Profile() {
  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || formData.phone.length < 10) {
      return toast.error('Please enter valid name and phone details.');
    }

    const { type, payload } = await dispatch(updateProfileThunk(formData));
    if (type.endsWith('fulfilled')) {
      toast.success('Profile credentials updated!');
    } else {
      toast.error(payload || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low font-body text-text-main pt-24 pb-20">
      <Navbar />
      
      <div className="max-w-[1000px] mx-auto px-6">
        <header className="mb-10 animate-slide-up">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-on-surface">Identity Hub</h1>
          <p className="text-sm font-bold text-text-muted mt-2">Manage your personal credentials and contact methods.</p>
        </header>

        <div className="grid md:grid-cols-[300px_1fr] gap-10">
          
          <aside className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-white p-8 rounded-[2.5rem] editorial-shadow border border-outline-variant/10 text-center relative overflow-hidden group">
               <div className="h-24 w-24 bg-primary mx-auto rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20 mb-6 relative z-10 transition-transform group-hover:scale-110">
                  {user?.fullName?.charAt(0) || 'U'}
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight text-on-surface">{user?.fullName}</h3>
               <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">{user?.role}</p>

               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] editorial-shadow border border-outline-variant/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 drop-shadow-sm">Account Status</p>
               <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-success">Verified Active</span>
               </div>
               <hr className="my-6 border-outline-variant/10" />
               <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 drop-shadow-sm">System Entity ID</p>
               <p className="text-xs font-bold text-on-surface-variant break-all font-mono bg-surface-container-low p-2 rounded-lg">{user?.id}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] editorial-shadow border border-gray-800 text-white relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">BusGo Wallet Balance</p>
               <p className="text-4xl font-black tracking-tighter">₹{user?.walletBalance || 0}</p>
               <p className="text-[10px] text-gray-500 font-bold mt-4">Refunds drop exactly here.</p>
            </div>
          </aside>

          <main className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3rem] editorial-shadow border border-outline-variant/10">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Edit Details</h2>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Registered Email</label>
                  <input 
                    type="text" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full px-5 py-4 bg-surface-container-low/50 border border-surface-border rounded-xl text-text-muted font-bold cursor-not-allowed opacity-70" 
                  />
                  <p className="text-[10px] text-primary font-bold">Email address cannot be changed. It operates as your primary identifier.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                    placeholder="E.g. Sharath"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Contact Interface (Mobile)</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all tracking-[0.2em]" 
                    placeholder="10 digit number"
                    maxLength="10"
                  />
                </div>

              </div>

              <div className="mt-12 pt-8 border-t border-outline-variant/10 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Syncing...' : 'Update Details ➔'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
