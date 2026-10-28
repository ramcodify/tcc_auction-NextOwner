import React from 'react';

export const Card = ({
  children,
  className = '',
  variant = 'stone',
  padding = 'md',
  ...props
}) => {
  const variants = {
    stone: 'bg-stone border-border',
    paper: 'bg-paper border-border',
    flat: 'bg-stone/60 border-border/80'
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div
      className={`rounded border ${variants[variant] || variants.stone} ${paddings[padding] || paddings.md} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col gap-1 pb-3 mb-3 border-b border-border/60 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', as = 'h3' }) => {
  const Component = as;
  return (
    <Component className={`text-base font-semibold text-ink tracking-tight ${className}`}>
      {children}
    </Component>
  );
};

export const CardDescription = ({ children, className = '' }) => (
  <p className="text-xs text-olive leading-relaxed">{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`text-sm text-ink ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`pt-3 mt-3 border-t border-border/60 flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);

export default Card;
