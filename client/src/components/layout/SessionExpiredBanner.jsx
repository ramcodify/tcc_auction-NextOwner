import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';

export const SessionExpiredBanner = () => {
  const { sessionExpired, dismissSessionExpired } = useAuth();

  if (!sessionExpired) return null;

  return (
    <div className="bg-stone border-b border-border text-ink px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-[#9E392F] shrink-0" />
          <span>
            <strong>Session Expired:</strong> Your authenticated session has ended. Please sign in again to access protected auctions and profile tools.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/login" onClick={dismissSessionExpired}>
            <Button variant="primary" size="sm">
              Log In Now
            </Button>
          </Link>
          <button
            type="button"
            onClick={dismissSessionExpired}
            className="text-olive hover:text-ink p-1 rounded"
            aria-label="Dismiss session alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredBanner;
