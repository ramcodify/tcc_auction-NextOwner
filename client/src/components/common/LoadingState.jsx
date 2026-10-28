import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-[3px]'
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-forest border-t-transparent ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-stone/70 rounded ${className}`}
      aria-hidden="true"
    />
  );
};

export const LoadingState = ({
  message = 'Loading...',
  description,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <Spinner size="lg" className="mb-3 text-forest" />
      <p className="text-sm font-medium text-ink">{message}</p>
      {description && (
        <p className="text-xs text-olive mt-1 max-w-xs">{description}</p>
      )}
    </div>
  );
};

export default LoadingState;
