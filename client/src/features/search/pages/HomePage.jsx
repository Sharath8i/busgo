import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSearchParams } from '../searchSlice';
import CityInput from '../../../components/search/CityInput';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';

const POPULAR_ROUTES = [
  { 
    from: 'Chennai', 
    to: 'Bangalore', 
    duration: '6h 15m', 
    price: 849, 
    tag: 'Daily Service',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADGcES65z3Wbrk2vzQ3J-Y7VoaRsctnqn3gOcNIHJFhbZPkl0dd66rW4zczhOcdC4K_i2PlMYVKIzsz5c7KjPIw1xv3EiO4WppudPuLpQ5KC0JscoSUK0FlO4QHqCBUme8WU6WfCsYFA7NPY0Zf95HEuu-J_wFdrc_Hjz4sEgyjG2-cDERcoZYikd_vhb89H76MYf9XtoW3ZgIpibDTD94XIrHqxq_X2yYPp2emwHOg2SxWbjoYyjM_1cHxxIXkGiM9ERYWpRld5s'
  },
  { 
    from: 'Mumbai', 
    to: 'Pune', 
    duration: '3h 00m', 
    price: 399, 
    tag: 'Express Route',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqigqIMzOvRnqeXqHkcnbOmBOtFgfYTHdK9fWCVN25S1UUlbHjdE-aU65fTR7zUMX-ol7EbEN92QT2OHxL5rhsvKVWN446CWKXkJokt2Wyzpq7VpdEOVjtYdhqAF9A8rXjk5Oaw0LFn6SaZRTxV8_hSzQn2UYFN0mMgT0AvTBzz3JoAqSEKR-4kftMyhmwWCOzD3RTKL4awpaLLq9WJbnboHinCxuoyULtNJFkvhqMymSu2TCyPaLK6S68kgo7dwA6gOUb_vJOW-I'
  },
  { 
    from: 'Delhi', 
    to: 'Agra', 
    duration: '4h 30m', 
    price: 650, 
    tag: 'Premium Fleet',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIeovWLeh-nsGlz5E4bdeE9TIKcsG5-bX_v-RwVSSgWbpbAX7mHLl6S7BhI54aaXKVNLcwdlqMIcIN8u7RZTO5FvkmSeenIWrEd9thpENIG8l5oNcH7MZpC6GO2X1apxEKAWoKgGTLRYfg0j-bCeiNje0JUiO4aIsS1Nhgi1bo6DFDXUl6JasdvKhDV8uG6OPCeP2YxXPeELxRS7KzjWG_CZfEndyfAEnv5RAJzWJC0JPMaGCKI4gRLiIDYY_3KLQqZAeuNIE_GJE'
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      from: '',
      to: '',
      date: '',
      seats: 1,
    },
  });

  const from = watch('from');
  const to = watch('to');

  useEffect(() => {
    register('from', { required: true });
    register('to', { required: true });
    register('date', { required: true });
    const today = new Date().toISOString().split('T')[0];
    setValue('date', today);
  }, [register, setValue]);

  const onSubmit = (data) => {
    const params = new URLSearchParams({
      from: data.from,
      to: data.to,
      date: data.date,
      seats: data.seats
    }).toString();
    navigate(`/search?${params}`);
  };

  const swap = () => {
    const f = from;
    const t = to;
    setValue('from', t);
    setValue('to', f);
  };

  const quickBook = (route) => {
    const today = new Date().toISOString().split('T')[0];
    const params = new URLSearchParams({
      from: route.from,
      to: route.to,
      date: today,
      seats: 1
    }).toString();
    navigate(`/search?${params}`);
  };

  return (
    <div className="bg-background">
      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-24 px-8">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <span className="tracking-widest uppercase text-primary font-bold text-xs mb-4 block">The Kinetic Editorial</span>
            <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.1] text-on-surface tracking-tight mb-8">
              Travel with <br /><span className="text-primary italic">Precision.</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-lg mb-10 leading-relaxed">
              Experience the next generation of intercity travel. Seamless bookings, real-time tracking, and a premium fleet at your fingertips.
            </p>
          </div>
          
          <div className="relative">
            <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden editorial-shadow bg-surface-container">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPmZUkOkCn5SLv74YOvUA2Hu27_mRGIgELiNPGHupJW-_A30fWrRMrEut6W55JQHe7mk3mUPseEabLXPpYtuyDmoIWik2l_6xeztt9llRovxF2iDQeD3irkV5RyW9eNunidCgGW-LS3PCcMs38v4k6KAonvjXs2Nz0V5rnLlmiB3JG27qFyobEEf1azhYgPsPFvEAxZ4jkhscczfpbLoOgWrG0gc5976RGV_FgXE2eiOJ8c_L2xB4X0HfyQwGHrONjis6m8vbqOdQ" 
                alt="Modern Luxury Coach"
              />
            </div>
            
            {/* Floating Trust Badge */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl editorial-shadow hidden md:block border border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                   <span className="text-xl">✅</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">5-Star Safety</p>
                  <p className="text-sm text-on-surface-variant">Certified Operators Only</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 SEARCH PLATTER 🚀 */}
        <div className="max-w-6xl mx-auto -mt-20 relative z-20">
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] editorial-shadow border border-outline-variant/10">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Source</label>
                <CityInput
                  value={from}
                  onChange={(v) => setValue('from', v)}
                  placeholder="Leaving from"
                  name="from"
                />
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Destination</label>
                <div className="relative">
                  <CityInput
                    value={to}
                    onChange={(v) => setValue('to', v)}
                    placeholder="Going to"
                    name="to"
                  />
                  <button
                    type="button"
                    onClick={swap}
                    className="absolute -left-8 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white border border-surface-border shadow-md hover:text-primary transition-all z-10"
                  >
                    ⇄
                  </button>
                </div>
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Date</label>
                <input 
                  type="date" 
                  {...register('date')} 
                  className="w-full h-[52px] px-4 bg-surface-container-low rounded-xl border-none font-bold text-on-surface focus:ring-2 focus:ring-primary/20 appearance-none"
                />
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Passengers</label>
                <select 
                   {...register('seats')}
                   className="w-full h-[52px] px-4 bg-surface-container-low rounded-xl border-none font-bold text-on-surface focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('https://cdn0.iconfinder.com/data/icons/user-interface-2062/24/arrow-down-512.png')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat"
                >
                  <option value="1">1 Seat</option>
                  <option value="2">2 Seats</option>
                  <option value="3">3 Seats</option>
                  <option value="4">4+ Seats</option>
                </select>
              </div>

              <div className="lg:col-span-1">
                <Button 
                  type="submit"
                  className="w-full h-[52px]"
                  icon={<span className="text-lg">🚀</span>}
                >
                  Search Routes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ── */}
      <section className="py-24 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-extrabold text-on-surface mb-4">Popular Routes</h2>
              <p className="text-on-surface-variant leading-relaxed">Connecting major hubs with high-frequency luxury coaches. Book your seat in seconds for our most-traveled paths.</p>
            </div>
            <Link to="/destinations" className="text-primary font-bold flex items-center gap-2 group underline-offset-4 hover:underline">
              View All Destinations →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POPULAR_ROUTES.map((route, i) => (
              <Card key={i} className="p-0 overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    src={route.img} 
                    alt={route.from} 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-primary">
                    {route.tag}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-extrabold text-on-surface">{route.from} to {route.to}</h3>
                      <p className="text-sm text-on-surface-variant">Approx. {route.duration} journey</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase text-text-muted block">Starting At</span>
                      <span className="text-2xl font-black text-primary">₹{route.price}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => quickBook(route)}
                    variant="ghost"
                    className="w-full py-4 group-hover:bg-primary group-hover:text-white"
                    icon={<span className="text-lg">⚡</span>}
                  >
                    Book Quick
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="py-24 px-8 bg-surface-container-low relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-on-surface tracking-tight">The BusGo Advantage</h2>
            <p className="text-lg text-on-surface-variant mt-4 max-w-2xl mx-auto">Why thousands of commuters choose us every day for their intercity journeys.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Unmatched Security', icon: '🛡️', desc: 'From secure payment gateways to verified fleet operators and real-time GPS monitoring, your safety is our blueprint.' },
              { title: 'Concierge Support', icon: '🤝', desc: 'Not just a helpdesk, but a travel concierge available 24/7. Reschedule or cancel trips with zero friction.' },
              { title: 'Kinetic Speed', icon: '⚡', desc: 'Book a ticket in under 60 seconds. Our editorial interface removes data clutter, giving you only what you need.' },
            ].map((item, i) => (
              <div key={i} className="space-y-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl editorial-shadow">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-on-surface">{item.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <Card animate={false} className="mt-24 p-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: '500+', label: 'Verified Operators' },
              { val: '2.4M', label: 'Happy Travelers' },
              { val: '12k+', label: 'Daily Routes' },
              { val: '99.8%', label: 'On-Time Arrival' },
            ].map((stat, i) => (
              <div key={i} className={`text-center ${i < 3 ? 'md:border-r border-outline-variant/10' : ''}`}>
                <p className="text-4xl font-black text-primary">{stat.val}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-2">{stat.label}</p>
              </div>
            ))}
          </Card>
        </div>
      </section>
    </div>
  );
}
