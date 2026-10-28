import React from 'react';

export const PageContainer = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  maxWidth = 'max-w-7xl'
}) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-border">
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-sans">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-olive mt-1 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2.5 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
