import React from 'react';

/**
 * Reusable Input component with restrained styling, error states, and label support.
 */
export const Input = ({
  label,
  id,
  error,
  helperText,
  icon: Icon,
  className = '',
  wrapperClassName = '',
  type = 'text',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-ink tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-olive pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`
            w-full bg-paper text-ink placeholder-olive text-sm
            border ${error ? 'border-[#9E392F]' : 'border-border'}
            rounded px-3 py-2
            ${Icon ? 'pl-9' : ''}
            transition-colors duration-150
            focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest
            disabled:opacity-50 disabled:bg-stone/50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-[#9E392F] font-normal">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-olive">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
