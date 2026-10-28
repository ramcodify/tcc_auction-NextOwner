import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-stone-hover text-ink border-border',
    forest: 'bg-forest/10 text-forest border-forest/20 font-semibold',
    olive: 'bg-stone text-olive border-border',
    outline: 'bg-transparent text-ink border-border',
    alert: 'bg-[#9E392F]/10 text-[#9E392F] border-[#9E392F]/20'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
