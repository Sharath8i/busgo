import { useState } from 'react';
import toast from 'react-hot-toast';

const MOCK_OFFERS = [
  {
    id: 1,
    tag: 'NEW USER',
    title: 'Save up to ₹250',
    desc: 'Valid on your first booking with BusGo across all major routes.',
    code: 'WELCOME250',
    terms: 'Min booking value ₹1000. For new users only.',
    color: 'from-blue-600 to-indigo-600',
    icon: '🎉'
  },
  {
    id: 2,
    tag: 'FESTIVE SPECIAL',
    title: 'Flat 15% Cashback',
    desc: 'Celebrate the season by getting instant cashback into your BusGo wallet.',
    code: 'FESTIVAL15',
    terms: 'Max cashback ₹300. Valid till month end.',
    color: 'from-orange-500 to-red-500',
    icon: '✨'
  },
  {
    id: 3,
    tag: 'WEEKEND GATEWAY',
    title: 'Flat ₹150 Off',
    desc: 'Get away this weekend on our premium sleeper fleet to Goa, Pune, or Shimla.',
    code: 'WEEKEND150',
    terms: 'Valid only for Friday - Sunday departures.',
    color: 'from-teal-500 to-emerald-600',
    icon: '🌴'
  },
  {
    id: 4,
    tag: 'UPI EXCLUSIVE',
    title: 'Get 10% Off via UPI',
    desc: 'Pay using any supported UPI app and get instant discount on checkout.',
    code: 'UPI10',
    terms: 'Max discount ₹200. Cannot be clubbed with others.',
    color: 'from-purple-600 to-fuchsia-600',
    icon: '📱'
  },
  {
    id: 5,
    tag: 'BUSINESS COMMUTE',
    title: 'Corporate ₹50 Off',
    desc: 'Daily traveler? Save consistently on your regular intercity routes.',
    code: 'CORP50',
    terms: 'No minimum booking amount required.',
    color: 'from-slate-700 to-gray-900',
    icon: '💼'
  },
  {
    id: 6,
    tag: 'RED EYE FLIGHTS',
    title: 'Night Owl Extra 5%',
    desc: 'Book buses departing between 11 PM and 4 AM to save extra on fares.',
    code: 'NIGHTOWL',
    terms: 'Applicable automatically on night time schedules.',
    color: 'from-indigo-900 to-black',
    icon: '🦉'
  }
];

export default function Offers() {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Promo code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-alt font-body pt-24 pb-24">
      <div className="max-w-[1440px] mx-auto px-8">
        
        {/* HERO SECTION */}
        <div className="mb-16 md:flex justify-between items-end gap-8 border-b-2 border-surface-border pb-8">
          <div className="max-w-2xl">
            <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-4 block">Travel Smart, Save More</span>
            <h1 className="text-5xl md:text-6xl font-black text-on-surface uppercase tracking-tighter mb-4">
              Trending <span className="text-primary italic">Offers.</span>
            </h1>
            <p className="text-on-surface-variant text-lg font-medium">
              Unlock exclusive promotional deals, massive cashbacks, and seasonal coupons tailored for our premium fleet. Redefine your journey today.
            </p>
          </div>
        </div>

        {/* OFFERS GRID (Inspired by top ticketing portals) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_OFFERS.map((offer) => (
            <div 
              key={offer.id} 
              className="bg-white rounded-[2rem] border border-outline-variant/20 editorial-shadow overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300"
            >
              {/* Top Banner Area */}
              <div className={`p-8 bg-gradient-to-br ${offer.color} text-white relative overflow-hidden`}>
                <div className="relative z-10 flex justify-between items-start">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    {offer.tag}
                  </span>
                  <span className="text-3xl opacity-80">{offer.icon}</span>
                </div>
                <h3 className="relative z-10 text-3xl font-black mt-6 leading-tight tracking-tight">
                  {offer.title}
                </h3>
                {/* Decorative Background Blur */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>

              {/* Bottom Info Area */}
              <div className="p-8 flex flex-col flex-grow bg-surface-container-lowest">
                <p className="text-sm font-medium text-text-muted mb-6">
                  {offer.desc}
                </p>

                <div className="mt-auto space-y-6">
                  {/* Coupon Box Container */}
                  <div className="relative flex items-center justify-between p-1 bg-surface-alt rounded-xl border border-dashed border-surface-border">
                    <div className="px-4 py-2 font-mono font-bold text-lg text-primary tracking-widest">
                      {offer.code}
                    </div>
                    <button
                      onClick={() => handleCopy(offer.code, offer.id)}
                      className={`h-10 px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                        copiedId === offer.id 
                          ? 'bg-success/10 text-success' 
                          : 'bg-primary text-white hover:bg-primary-dark shadow-md'
                      }`}
                    >
                      {copiedId === offer.id ? 'Copied' : 'Copy'}
                    </button>
                    {/* Punch Hole Details (UI Styling for coupon look) */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-r border-dashed border-surface-border rounded-full"></div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-dashed border-surface-border rounded-full"></div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="pt-4 border-t border-surface-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      T&C: <span className="font-medium normal-case">{offer.terms}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
