import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const ALL_DESTINATIONS = [
  { from: 'Chennai', to: 'Bangalore', duration: '6h 15m', price: 849, tag: 'Daily Service', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADGcES65z3Wbrk2vzQ3J-Y7VoaRsctnqn3gOcNIHJFhbZPkl0dd66rW4zczhOcdC4K_i2PlMYVKIzsz5c7KjPIw1xv3EiO4WppudPuLpQ5KC0JscoSUK0FlO4QHqCBUme8WU6WfCsYFA7NPY0Zf95HEuu-J_wFdrc_Hjz4sEgyjG2-cDERcoZYikd_vhb89H76MYf9XtoW3ZgIpibDTD94XIrHqxq_X2yYPp2emwHOg2SxWbjoYyjM_1cHxxIXkGiM9ERYWpRld5s' },
  { from: 'Mumbai', to: 'Pune', duration: '3h 00m', price: 399, tag: 'Express Route', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pune_West_skyline_-_March_2017.jpg/960px-Pune_West_skyline_-_March_2017.jpg' },
  { from: 'Delhi', to: 'Agra', duration: '4h 30m', price: 650, tag: 'Premium Fleet', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Taj_Mahal%2C_Agra%2C_India.jpg/960px-Taj_Mahal%2C_Agra%2C_India.jpg' },
  { from: 'Hyderabad', to: 'Vijayawada', duration: '5h 10m', price: 599, tag: 'Night Service', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Prakasham_Barriage%2C_Vijayawada.jpg/960px-Prakasham_Barriage%2C_Vijayawada.jpg' },
  { from: 'Bangalore', to: 'Goa', duration: '11h 20m', price: 1250, tag: 'Sleeper Coach', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/960px-BeachFun.jpg' },
  { from: 'Chennai', to: 'Madurai', duration: '7h 45m', price: 799, tag: 'Direct Route', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Meenakshi_Amman_West_Tower.jpg/960px-Meenakshi_Amman_West_Tower.jpg' },
  { from: 'Delhi', to: 'Jaipur', duration: '5h 00m', price: 600, tag: 'Superfast', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/960px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg' },
  { from: 'Ahmedabad', to: 'Surat', duration: '4h 15m', price: 450, tag: 'Morning Express', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Bharthana_Althan_area.jpg/960px-Bharthana_Althan_area.jpg' },
  { from: 'Pune', to: 'Nagpur', duration: '12h 30m', price: 1400, tag: 'Luxury Sleeper', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BAPS_Swaminarayan_Temple%2C_Nagpur.jpg/960px-BAPS_Swaminarayan_Temple%2C_Nagpur.jpg' },
  { from: 'Kolkata', to: 'Siliguri', duration: '14h 00m', price: 1100, tag: 'Scenic Route', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Siliguri_view_3.jpg/960px-Siliguri_view_3.jpg' },
  { from: 'Bangalore', to: 'Mysore', duration: '3h 15m', price: 350, tag: 'Daily Commute', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Mysore_Palace_Morning.jpg' },
  { from: 'Mumbai', to: 'Goa', duration: '14h 00m', price: 1550, tag: 'Premium Fleet', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/960px-BeachFun.jpg' },
  { from: 'Chandigarh', to: 'Shimla', duration: '3h 45m', price: 299, tag: 'Hill Service', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg/960px-Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg' },
  { from: 'Lucknow', to: 'Varanasi', duration: '6h 30m', price: 550, tag: 'Daily Service', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg/960px-Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg' },
  { from: 'Kochi', to: 'Thiruvananthapuram', duration: '5h 20m', price: 499, tag: 'Coastal Express', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Padmanabhaswamy_Temple_Thiruvananthapuram.jpg/960px-Padmanabhaswamy_Temple_Thiruvananthapuram.jpg' },
];

export default function Destinations() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-surface-alt font-body pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-8">

        <header className="mb-16 text-center animate-slide-up">
          <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-4 block">Expand Your Horizons</span>
          <h1 className="text-5xl font-black text-on-surface uppercase tracking-tight mb-4">Destinations</h1>
          <p className="text-on-surface-variant font-medium max-w-2xl mx-auto">
            Discover all 15 active premium routes operational within our network. Book your high-frequency luxury coach directly from the hub below.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {ALL_DESTINATIONS.map((route, i) => (
            <div key={i} className="group rounded-3xl overflow-hidden bg-white border border-outline-variant/10 editorial-shadow hover:translate-y-[-6px] transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="h-44 overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={route.img}
                  alt={route.to}
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-primary">
                  {route.tag}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-on-surface leading-tight">{route.from} <br /><span className="text-sm font-bold text-text-muted">to</span> {route.to}</h3>
                    <p className="text-xs text-on-surface-variant mt-2">Approx. {route.duration}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-text-muted block">From</span>
                    <span className="text-xl font-black text-primary">₹{route.price}</span>
                  </div>
                </div>

                <button
                  onClick={() => quickBook(route)}
                  className="w-full py-3.5 bg-surface-container-lowest border-2 border-surface-container text-primary font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all shadow-sm"
                >
                  Book Seat ⚡
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
