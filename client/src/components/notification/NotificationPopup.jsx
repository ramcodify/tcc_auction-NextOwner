import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  X,
  Gavel,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  CheckCheck,
  Check,
  MessageSquare,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';

/**
 * Format relative timestamps cleanly without external dependencies
 */
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '';
  const now = new Date();
  const date = new Date(dateInput);
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 45) return 'Just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHrs = Math.floor(diffInMin / 60);
  if (diffInHrs < 24) return `${diffInHrs}h ago`;
  const diffInDays = Math.floor(diffInHrs / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Visual status icon mapped to notification type
 */
const getNotificationIcon = (type) => {
  switch (type) {
    case 'bid_outbid':
      return (
        <div className="w-8 h-8 rounded-full bg-[#9E392F]/10 text-[#9E392F] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    case 'bid_leading':
      return (
        <div className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center shrink-0">
          <Gavel className="w-4 h-4" />
        </div>
      );
    case 'auction_extended':
      return (
        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4" />
        </div>
      );
    case 'auction_won':
    case 'seller_decision':
      return (
        <div className="w-8 h-8 rounded-full bg-forest text-paper flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    case 'new_question':
      return (
        <div className="w-8 h-8 rounded-full bg-stone text-ink flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-stone text-forest flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4" />
        </div>
      );
  }
};

/**
 * Interactive Notification Popup Modal (Replaces standalone page)
 */
export const NotificationModal = () => {
  const {
    isOpen,
    closeNotifications,
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    loading,
    activeTab,
    setActiveTab
  } = useNotifications();

  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeNotifications();
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
  }, [isOpen, closeNotifications]);

  if (!isOpen) return null;

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Smooth Animated Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        onClick={closeNotifications}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-lg bg-paper border border-border rounded-t-2xl sm:rounded-xl shadow-2xl z-10 flex flex-col max-h-[88vh] sm:max-h-[82vh] overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 bg-stone border-b border-border select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-forest text-paper flex items-center justify-center shadow-sm">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="notification-modal-title"
                  className="text-sm sm:text-base font-bold text-ink leading-tight"
                >
                  Campus Notifications
                </h2>
                {unreadCount > 0 && (
                  <Badge variant="forest" size="sm" className="text-[10px] py-0 px-1.5">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-olive leading-tight">
                Live alerts for bids, anti-sniping, and approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-forest hover:text-forest-dark font-semibold px-2 py-1 rounded hover:bg-stone-hover transition-colors flex items-center gap-1"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Mark all read</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeNotifications}
              className="p-1.5 rounded-lg text-olive hover:text-ink hover:bg-stone-hover transition-colors"
              aria-label="Close notification window"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center px-4 sm:px-5 bg-paper border-b border-border text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-2.5 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'border-forest text-forest'
                : 'border-transparent text-olive hover:text-ink'
            }`}
          >
            <span>All Alerts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone text-ink">
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`py-2.5 px-3 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'border-forest text-forest'
                : 'border-transparent text-olive hover:text-ink'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-forest text-paper font-bold">
                {unreadCount}
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone text-olive">
                0
              </span>
            )}
          </button>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60 bg-paper">
          {loading ? (
            <div className="py-16 text-center text-xs text-olive space-y-2">
              <div className="w-6 h-6 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Syncing notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-stone/70 border border-border flex items-center justify-center mx-auto text-olive">
                <Inbox className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-ink">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-xs text-olive max-w-xs mx-auto leading-relaxed">
                {activeTab === 'unread'
                  ? "You're completely up to date! New auction activity will appear here."
                  : 'Live alerts for your bids, 30s deadline extensions, and seller approvals will appear here in real time.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const targetLink =
                item.link ||
                (item.relatedAuctionId ? `/auction/${item.relatedAuctionId}` : null);

              return (
                <div
                  key={item._id}
                  className={`p-3.5 sm:p-4 text-xs transition-colors hover:bg-stone/40 flex items-start gap-3 group relative ${
                    !item.isRead ? 'bg-forest/5' : 'bg-paper'
                  }`}
                >
                  {/* Status Icon */}
                  {getNotificationIcon(item.type)}

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-ink text-xs sm:text-[13px] leading-snug truncate">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-forest shrink-0" title="Unread" />
                      )}
                    </div>

                    <p className="text-olive text-xs mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-olive/80 font-mono">
                        {formatTimeAgo(item.createdAt)}
                      </span>

                      {targetLink && (
                        <Link
                          to={targetLink}
                          onClick={() => {
                            if (!item.isRead) markAsRead(item._id);
                            closeNotifications();
                          }}
                          className="text-[11px] text-forest font-semibold hover:underline flex items-center gap-1"
                        >
                          View auction lot <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Single mark as read action */}
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(item._id)}
                      className="absolute top-3.5 right-3.5 p-1 rounded text-olive/60 hover:text-forest hover:bg-stone transition-colors"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-stone border-t border-border flex items-center justify-between text-[11px] text-olive select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span className="font-medium text-ink">Live Campus Sync Active</span>
          </div>

          <button
            type="button"
            onClick={closeNotifications}
            className="text-xs font-semibold text-forest hover:underline"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Floating On-Screen Toast Alert (for real-time auction notifications)
 */
export const NotificationToastContainer = () => {
  const { toasts, dismissToast, openNotifications } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-32px)] pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-paper border border-border shadow-2xl rounded-xl p-3.5 flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-forest text-paper flex items-center justify-center shrink-0 mt-0.5">
            {t.type === 'warning' ? (
              <Zap className="w-4 h-4 text-paper" />
            ) : t.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-paper" />
            ) : (
              <Bell className="w-4 h-4 text-paper" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-ink truncate">{t.title}</h4>
            <p className="text-[11px] text-olive mt-0.5 leading-snug line-clamp-2">
              {t.message}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              {t.link && (
                <Link
                  to={t.link}
                  onClick={() => dismissToast(t.id)}
                  className="text-[10px] text-forest font-semibold hover:underline flex items-center gap-1"
                >
                  View lot <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  dismissToast(t.id);
                  openNotifications();
                }}
                className="text-[10px] text-olive hover:text-ink font-medium"
              >
                Open all alerts
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className="p-1 rounded text-olive hover:text-ink hover:bg-stone transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationModal;
