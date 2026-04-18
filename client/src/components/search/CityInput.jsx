import { useState, useEffect, useRef } from 'react';
import { fetchCities } from '../../api/searchAPI';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * CityInput — autocomplete input for city selection.
 *
 * Props:
 *   value, onChange, placeholder, label, name, disabled
 */
export default function CityInput({ value, onChange, placeholder = 'City', label, name, disabled = false }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQ = useDebounce(query, 350);
  const containerRef = useRef(null);

  // Sync external value → internal query
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    fetchCities(debouncedQ)
      .then(({ data }) => setSuggestions(data.cities || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (city) => {
    setQuery(city);
    onChange(city);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          name={name}
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="input-field pr-10 font-bold"
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin block" />
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl bg-white shadow-2xl border border-surface-border">
          {suggestions.map((city) => (
            <li key={city}>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-main hover:bg-surface-alt transition-colors text-left"
                onMouseDown={() => select(city)}
              >
                <div className="h-6 w-6 rounded bg-primary-light/30 flex items-center justify-center text-primary">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
