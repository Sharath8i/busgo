export default function Badge({ 
  children, 
  variant = 'neutral', 
  className = '' 
}) {
  const variants = {
    neutral: 'bg-surface-container text-on-surface-variant',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    tertiary: 'bg-tertiary/10 text-tertiary',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
