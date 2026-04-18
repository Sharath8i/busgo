import React from 'react';

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-5 py-4 bg-surface-container border border-surface-border rounded-xl 
          text-on-surface font-bold placeholder:text-outline-variant/60
          focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-all outline-none
          ${error ? 'border-error ring-error/10' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-black text-error uppercase tracking-wider animate-shake">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
