/**
 * Reusable Button component with all BusGo variants.
 *
 * Usage:
 *   <Button variant="primary" size="md" loading={...} disabled={...}>Label</Button>
 *   <Button variant="accent" icon={<SomeIcon />}>Pay Now</Button>
 *   <Button variant="ghost">Cancel</Button>
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  type = 'button',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-display font-semibold transition-all duration-200 focus:outline-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'rounded-xl2 text-white hover:opacity-90 focus:ring-2 focus:ring-brand/40',
    accent:
      'rounded-xl2 text-white hover:opacity-90 focus:ring-2 focus:ring-accent-orange/40',
    ghost:
      'rounded-xl border border-outlineV bg-surface-white text-on-variant hover:bg-surface-container focus:ring-2 focus:ring-outlineV/40',
    danger:
      'rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
    link: 'text-brand-mid hover:underline underline-offset-2 bg-transparent',
  };

  const gradients = {
    primary: { background: 'linear-gradient(160deg, #1D4ED8 0%, #0037b0 100%)' },
    accent:  { background: 'linear-gradient(160deg, #F97316 0%, #9a4200 100%)' },
    ghost:   {},
    danger:  {},
    link:    {},
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-4 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={gradients[variant]}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
