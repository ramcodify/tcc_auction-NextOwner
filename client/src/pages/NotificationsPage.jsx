import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  Zap,
  Tag,
  CheckCheck,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      const json = await res.json();
      if (res.ok) {
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time listener for incoming alerts
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on('notification_received', handleNewNotification);
    return () => {
      socket.off('notification_received', handleNewNotification);
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bid_outbid':
        return <AlertTriangle className="w-4 h-4 text-[#9E392F]" />;
      case 'bid_leading':
        return <Gavel className="w-4 h-4 text-forest" />;
      case 'auction_extended':
        return <Zap className="w-4 h-4 text-[#9E392F]" />;
      case 'auction_won':
      case 'seller_decision':
        return <CheckCircle2 className="w-4 h-4 text-forest" />;
      case 'new_question':
        return <MessageSquare className="w-4 h-4 text-forest" />;
      default:
        return <Bell className="w-4 h-4 text-olive" />;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="py-20">
          <LoadingState message="Loading your notification stream..." description="Synchronizing in-app alerts" />
        </div>
      </PageContainer>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <PageContainer
      title="Notification Center"
      subtitle="Real-time alerts for outbids, 30s deadline extensions, seller approvals, and saved search matches."
      actions={
        unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={markAllRead}
          >
            Mark All as Read
          </Button>
        )
      }
    >
      <div className="max-w-2xl mx-auto space-y-3">
        {notifications.length === 0 ? (
          <Card variant="stone" padding="lg" className="text-center py-16">
            <Bell className="w-8 h-8 text-forest mx-auto mb-2 opacity-60" />
            <h3 className="text-sm font-semibold text-ink">No Notifications Yet</h3>
            <p className="text-xs text-olive mt-1">
              Alerts for your bids, watchlist countdowns, and listings will appear here in real time.
            </p>
          </Card>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => !item.isRead && markAsRead(item._id)}
              className={`p-4 rounded border transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                item.isRead
                  ? 'bg-paper/80 border-border text-ink'
                  : 'bg-stone border-forest/40 shadow-subtle'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-paper border border-border flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-ink">{item.title}</h4>
                    <span className="text-[10px] uppercase font-mono text-olive">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-olive mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  {item.link && (
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest hover:underline mt-2"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {!item.isRead && (
                <span className="w-2 h-2 rounded-full bg-forest shrink-0 mt-2" title="Unread" />
              )}
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
};

export default NotificationsPage;
