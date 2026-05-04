import { forwardRef, useState } from 'react';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/**
 * Reusable Input component.
 * Supports label, error message, helper text, start/end icons.
 */
const Input = forwardRef(({
  label,
  error,
  helper,
  startIcon,
  endIcon,
  className = '',
  required = false,
  id,
  type = 'text',
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const actualEndIcon = isPassword ? (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
      tabIndex="-1"
    >
      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  ) : endIcon;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-display font-semibold uppercase tracking-wider text-on-variant"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-variant">
            {startIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`input-field ${startIcon ? 'pl-10' : ''} ${actualEndIcon ? 'pr-10' : ''} ${
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''
          }`}
          {...rest}
        />

        {actualEndIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-variant z-10">
            {actualEndIcon}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && helper && <p className="text-xs text-on-variant">{helper}</p>}
    </div>
  );
});

export default Input;
