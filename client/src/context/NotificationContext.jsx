import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext.jsx';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [toasts, setToasts] = useState([]);

  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        const notifs = data.data || [];
        setNotifications(notifs);
        const count = typeof data.unreadCount === 'number'
          ? data.unreadCount
          : notifs.filter((n) => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('[NotificationContext] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch and on user change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Socket listener for real-time alerts
  useEffect(() => {
    if (!socket || !user) return;

    const handleIncomingNotification = (notif) => {
      const newNotif = {
        _id: notif._id || 'notif-' + Date.now(),
        title: notif.title || 'Auction Update',
        message: notif.message || '',
        type: notif.type || 'system',
        relatedAuctionId: notif.relatedAuctionId || notif.auctionId || null,
        link: notif.link || (notif.auctionId ? `/auction/${notif.auctionId}` : ''),
        isRead: false,
        createdAt: notif.createdAt || new Date().toISOString()
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Add toast banner if popup is closed
      addToast({
        id: newNotif._id,
        title: newNotif.title,
        message: newNotif.message,
        type: newNotif.type,
        link: newNotif.link || (newNotif.relatedAuctionId ? `/auction/${newNotif.relatedAuctionId}` : null)
      });
    };

    const handleAuctionExtended = (data) => {
      const extNotif = {
        _id: 'ext-' + Date.now(),
        title: 'Auction Deadline Extended! ⏱️',
        message: data.message || 'A late bid in the final 30 seconds added +60 seconds.',
        type: 'auction_extended',
        relatedAuctionId: data.auctionId,
        link: `/auction/${data.auctionId}`,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      setNotifications((prev) => [extNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      addToast({
        id: extNotif._id,
        title: extNotif.title,
        message: extNotif.message,
        type: 'warning',
        link: extNotif.link
      });
    };

    const handleStatusChange = (data) => {
      if (data.status === 'awaiting_approval' && data.winnerId === user.id) {
        const winNotif = {
          _id: 'win-' + Date.now(),
          title: 'Provisional Winner! 🏆',
          message: 'You placed the highest bid. Awaiting seller price approval.',
          type: 'auction_won',
          relatedAuctionId: data.auctionId,
          link: `/auction/${data.auctionId}`,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        setNotifications((prev) => [winNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);

        addToast({
          id: winNotif._id,
          title: winNotif.title,
          message: winNotif.message,
          type: 'success',
          link: winNotif.link
        });
      }
    };

    socket.on('notification', handleIncomingNotification);
    socket.on('notification_received', handleIncomingNotification);
    socket.on('auction_extended', handleAuctionExtended);
    socket.on('status_change', handleStatusChange);

    return () => {
      socket.off('notification', handleIncomingNotification);
      socket.off('notification_received', handleIncomingNotification);
      socket.off('auction_extended', handleAuctionExtended);
      socket.off('status_change', handleStatusChange);
    };
  }, [socket, user]);

  const addToast = (toast) => {
    setToasts((prev) => [toast, ...prev.slice(0, 2)]);
    setTimeout(() => {
      dismissToast(toast.id);
    }, 6000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openNotifications = () => {
    setIsOpen(true);
    fetchNotifications();
  };

  const closeNotifications = () => {
    setIsOpen(false);
  };

  const toggleNotifications = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[NotificationContext] markAsRead error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationContext] markAllRead error:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        loading,
        activeTab,
        setActiveTab,
        toasts,
        dismissToast,
        openNotifications,
        closeNotifications,
        toggleNotifications,
        markAsRead,
        markAllRead,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
