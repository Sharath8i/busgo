import React from 'react';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20',
  secondary: 'bg-surface-container text-on-surface hover:bg-outline-variant/20',
  outline: 'border-2 border-surface-border text-on-surface hover:bg-surface-container',
  ghost: 'text-on-surface hover:bg-surface-container',
  error: 'bg-error text-white hober:bg-error-dark shadow-lg shadow-error/20',
};

const sizes = {
  xs: 'px-3 py-1.5 text-[10px]',
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-10 py-4 text-header',
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  fullWidth = false,
  ...props 
}) => {
  const base = 'inline-flex items-center justify-center font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing</span>
        </div>
      ) : children}
    </button>
  );
};
