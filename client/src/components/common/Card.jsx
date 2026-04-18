/**
 * Card — basic card wrapper using design tokens.
 */
export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`card ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardLow — surface-low variant card.
 */
export function CardLow({ children, className = '' }) {
  return <div className={`card-low p-5 ${className}`}>{children}</div>;
}

/**
 * KPICard — metric display card used in dashboards.
 */
export function KPICard({ title, value, change, up, icon, gradient }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-card">
      <div className={`p-5 ${gradient ? '' : 'bg-surface-white'}`}
           style={gradient ? { background: gradient } : {}}>
        <div className="flex items-start justify-between mb-4">
          <p className={`text-xs font-display font-semibold uppercase tracking-wider ${gradient ? 'text-white/80' : 'text-on-variant'}`}>
            {title}
          </p>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
        <p className={`font-display text-3xl font-bold ${gradient ? 'text-white' : 'text-on-surface'}`}>
          {value}
        </p>
      </div>
      {change && (
        <div className="bg-surface-white px-5 py-2.5">
          <p className={`text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}>
            {change}
          </p>
        </div>
      )}
    </div>
  );
}

export default Card;
