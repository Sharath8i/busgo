import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchBusesThunk } from '../redux/slices/searchSlice';
import { selectTrip } from '../redux/slices/bookingSlice';
import { formatCurrency } from '../utils/format';

const BUS_TYPES = ['all', 'volvo', 'sleeper', 'semi_sleeper', 'seater'];

function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse border-surface-border">
      <div className="flex justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-5 bg-surface-alt rounded w-48" />
          <div className="h-4 bg-surface-alt rounded w-24" />
        </div>
        <div className="h-10 bg-surface-alt rounded-lg w-28" />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const seats = parseInt(searchParams.get('seats') || '1', 10);

  const { results, isLoading, error } = useSelector((s) => s.search);
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceRange, setPriceRange] = useState(5000);
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    if (from && to && date) {
      dispatch(fetchBusesThunk({ from, to, date, seats }));
    }
  }, [dispatch, from, to, date, seats]);

  const filtered = useMemo(() => {
    let list = typeFilter === 'all' ? results : results.filter((r) => r.busType === typeFilter);
    list = list.filter((r) => r.baseFare <= priceRange);
    if (sortBy === 'price') return [...list].sort((a, b) => a.baseFare - b.baseFare);
    if (sortBy === 'seats') return [...list].sort((a, b) => b.availableSeats - a.availableSeats);
    if (sortBy === 'departure') return [...list].sort((a, b) => a.departureTime?.localeCompare(b.departureTime));
    return list;
  }, [results, typeFilter, priceRange, sortBy]);

  if (!from || !to || !date) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt pt-20">
        <div className="card p-12 text-center max-w-sm mx-auto">
          <div className="mb-4 text-5xl">🔍</div>
          <h2 className="text-xl font-black uppercase tracking-tighter">No search yet</h2>
          <p className="mt-2 text-sm text-text-muted">Start a search to explore our premium fleet.</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6 w-full">Search Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt pt-20">
      {/* ── HEADER ── */}
      <div className="bg-primary pt-8 pb-10 border-b border-primary-dark">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                {from} → {to}
              </h1>
              <p className="mt-1 text-sm font-medium text-primary-light">
                {date} • {seats} Passenger{seats > 1 ? 's' : ''} • {filtered.length} Buses
              </p>
            </div>
            <button onClick={() => navigate('/')} className="btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
              Modify Search
            </button>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'price', label: 'Cheapest' },
              { key: 'departure', label: 'Earliest' },
              { key: 'seats', label: 'More Seats' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${sortBy === s.key ? 'bg-white text-primary' : 'bg-primary-dark/40 text-primary-light hover:bg-white/10'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Filters</h3>
                <button onClick={() => { setTypeFilter('all'); setPriceRange(5000); }} className="text-[10px] font-bold text-primary uppercase">Clear</button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Price Limit</label>
                  <input
                    type="range" min={300} max={5000} step={100} value={priceRange}
                    onChange={e => setPriceRange(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-black mt-2 text-primary">
                    <span>₹300</span>
                    <span>₹{priceRange}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Bus Service</label>
                  <div className="space-y-2">
                    {BUS_TYPES.map(t => (
                      <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio" name="type" checked={typeFilter === t}
                          onChange={() => setTypeFilter(t)}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className={`text-xs font-semibold capitalize ${typeFilter === t ? 'text-primary' : 'text-text-muted'}`}>
                          {t.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* List */}
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="card p-20 text-center">
                <p className="text-text-muted text-sm">No buses found matching your criteria.</p>
              </div>
            ) : filtered.map(r => (
              <article key={r.tripId} className="card bg-white border border-surface-border p-0 overflow-hidden hover:shadow-soft transition-all">
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-black text-text-main uppercase tracking-tight">{r.busName}</h2>
                        <div className="badge bg-primary-light/40 text-primary capitalize">{r.busType?.replace('_', ' ')}</div>
                      </div>

                      <div className="flex items-center gap-8 mt-5">
                        <div className="text-center">
                          <p className="text-xs font-bold text-text-muted mb-1">DEPART</p>
                          <p className="text-xl font-black text-text-main">{r.departureTime}</p>
                        </div>
                        <div className="flex-1 border-b-2 border-dashed border-surface-border relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                            <span className="text-[10px] font-black text-primary uppercase">Direct</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-text-muted mb-1">ARRIVE</p>
                          <p className="text-xl font-black text-text-main">{r.arrivalTime}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {r.amenities?.slice(0, 3).map(a => (
                          <span key={a} className="text-[10px] font-bold text-text-muted bg-surface-alt px-2 py-0.5 rounded uppercase">{a}</span>
                        ))}
                        <span className={`text-[10px] font-black uppercase ml-auto ${r.availableSeats < 5 ? 'text-error' : 'text-success'}`}>
                          {r.availableSeats} Seats Left
                        </span>
                      </div>
                    </div>

                    <div className="text-right border-l border-surface-border pl-8 flex flex-col justify-between h-full min-w-[140px]">
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase">Fare starts at</p>
                        <p className="text-3xl font-black text-primary">{formatCurrency(r.baseFare)}</p>
                      </div>
                      <button
                        onClick={() => { dispatch(selectTrip(r)); navigate(`/seats/${r.tripId}`); }}
                        className="btn-primary mt-4 w-full"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-alt border-t border-surface-border px-6 py-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Boarding: <span className="text-text-main">{from}</span></p>
                  <p className="text-[10px] font-bold text-text-muted uppercase">Dropping: <span className="text-text-main">{to}</span></p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
