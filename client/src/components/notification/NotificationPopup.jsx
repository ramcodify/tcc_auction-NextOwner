import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  X,
  Gavel,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';

/**
 * On-screen real-time notification toast popup
 * Displays interactive toast alerts when real-time auction events occur.
 */
export const NotificationToastContainer = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for direct notification events
    const handleNotification = (notif) => {
      addToast({
        id: notif._id || String(Date.now()),
        title: notif.title || 'Auction Update',
        message: notif.message,
        type: notif.type || 'info',
        link: notif.auctionId ? `/auction/${notif.auctionId}` : null
      });
    };

    // Listen for last-minute anti-sniping extension
    const handleAuctionExtended = (data) => {
      addToast({
        id: 'ext-' + Date.now(),
        title: 'Auction Deadline Extended! ⏱️',
        message: data.message || 'A late bid in the final 30 seconds added +60 seconds.',
        type: 'warning',
        link: data.auctionId ? `/auction/${data.auctionId}` : null
      });
    };

    // Listen for status changes (e.g. auction closed, provisional winner)
    const handleStatusChange = (data) => {
      if (data.status === 'awaiting_approval' && data.winnerId === user.id) {
        addToast({
          id: 'win-' + Date.now(),
          title: 'Provisional Winner! 🏆',
          message: 'You placed the highest bid. Awaiting seller price approval.',
          type: 'success',
          link: data.auctionId ? `/auction/${data.auctionId}` : null
        });
      }
    };

    socket.on('notification', handleNotification);
    socket.on('auction_extended', handleAuctionExtended);
    socket.on('status_change', handleStatusChange);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('auction_extended', handleAuctionExtended);
      socket.off('status_change', handleStatusChange);
    };
  }, [socket, user]);

  const addToast = (toast) => {
    setToasts((prev) => [toast, ...prev.slice(0, 3)]); // Keep max 4 on screen

    // Auto dismiss after 7 seconds
    setTimeout(() => {
      dismissToast(toast.id);
    }, 7000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-32px)] pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-paper border border-border shadow-2xl rounded-lg p-3.5 flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-200"
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
            {t.link && (
              <Link
                to={t.link}
                onClick={() => dismissToast(t.id)}
                className="text-[10px] text-forest font-semibold hover:underline flex items-center gap-1 mt-1.5 inline-block"
              >
                View auction lot <ExternalLink className="w-2.5 h-2.5 inline" />
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className="p-1 rounded text-olive hover:text-ink hover:bg-stone transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * On-screen pop-up window dropdown triggered from the Navbar bell
 */
export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('[Notification fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include'
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('[Mark all read error]', err);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('[Mark read error]', err);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 max-h-[500px] bg-paper border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-forest" />
          <h3 className="text-xs font-bold text-ink">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="forest" size="sm" className="text-[10px] py-0 px-1.5">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[10px] text-forest font-semibold hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-border/60">
        {loading ? (
          <div className="py-8 text-center text-xs text-olive">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 px-4 text-center space-y-1">
            <p className="text-xs font-semibold text-ink">All caught up!</p>
            <p className="text-[11px] text-olive">No notifications right now.</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <div
              key={n._id}
              className={`p-3 text-xs transition-colors hover:bg-stone/50 flex gap-2.5 items-start ${
                !n.read ? 'bg-forest/5' : ''
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  !n.read ? 'bg-forest' : 'bg-transparent'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-[11px] leading-snug">
                  {n.title}
                </p>
                <p className="text-olive text-[11px] mt-0.5 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] text-olive/80">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {n.auctionId && (
                    <Link
                      to={`/auction/${n.auctionId}`}
                      onClick={() => {
                        markSingleRead(n._id);
                        onClose();
                      }}
                      className="text-[10px] text-forest font-semibold hover:underline flex items-center gap-0.5"
                    >
                      View lot <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer link to full notification center */}
      <div className="p-2.5 bg-stone border-t border-border text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-forest hover:text-forest-dark transition-colors inline-block"
        >
          Open Notification Center →
        </Link>
      </div>
    </div>
  );
};

export default NotificationToastContainer;
