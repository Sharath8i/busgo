import { forwardRef } from 'react';

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
  ...rest
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

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
          className={`input-field ${startIcon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''} ${
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''
          }`}
          {...rest}
        />

        {endIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-variant">
            {endIcon}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && helper && <p className="text-xs text-on-variant">{helper}</p>}
    </div>
  );
});

export default Input;
