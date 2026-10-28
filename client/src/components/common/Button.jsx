import React from 'react';

/**
 * Reusable Button component adhering to NEXTowner restrained design system.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded border focus:outline-none focus:ring-1 focus:ring-forest disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-forest hover:bg-forest-dark text-paper border-transparent active:bg-forest-dark',
    secondary: 'bg-stone hover:bg-stone-hover text-ink border-border active:bg-stone-dark',
    outline: 'bg-transparent hover:bg-stone text-ink border-border active:bg-stone-hover',
    ghost: 'bg-transparent hover:bg-stone/60 text-ink border-transparent active:bg-stone',
    danger: 'bg-[#9E392F] hover:bg-[#852F26] text-paper border-transparent'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
