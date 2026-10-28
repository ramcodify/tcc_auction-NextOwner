import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button.jsx';

export const Dialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-md',
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog content box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className={`relative w-full ${maxWidth} bg-paper border border-border rounded-md shadow-modal p-6 z-10 transition-all ${className}`}
      >
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-border/70">
          <div>
            {title && (
              <h3 id="dialog-title" className="text-base font-semibold text-ink">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-olive mt-1 leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-olive hover:text-ink p-1 rounded hover:bg-stone transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 text-sm text-ink">{children}</div>

        {footer && (
          <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
