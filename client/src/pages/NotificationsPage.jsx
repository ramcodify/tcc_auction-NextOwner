import React from 'react';
import { Bell, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const NotificationsPage = () => {
  const { user } = useAuth();

  const notifications = [
    {
      id: 1,
      title: 'Welcome to NEXTowner',
      description: 'Your student account is established. Both buying and selling capabilities are active.',
      time: 'Just now',
      read: false,
      tag: 'System'
    },
    {
      id: 2,
      title: 'Security Verified',
      description: 'Protected session initialized with secure httpOnly cookie credentials.',
      time: 'Just now',
      read: true,
      tag: 'Security'
    }
  ];

  return (
    <PageContainer
      title="Notifications"
      subtitle="Real-time alerts for outbids, auction countdowns, seller approvals, and campus handover notices."
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {notifications.map((item) => (
          <Card
            key={item.id}
            variant={item.read ? 'paper' : 'stone'}
            padding="md"
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-forest/10 border border-forest/20 text-forest flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-ink">{item.title}</h3>
                  <Badge variant={item.read ? 'olive' : 'forest'} size="sm">
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-xs text-olive mt-1 leading-relaxed">
                  {item.description}
                </p>
                <span className="text-[10px] text-olive font-mono mt-2 block">
                  {item.time}
                </span>
              </div>
            </div>
            {!item.read && (
              <span className="w-2 h-2 rounded-full bg-forest shrink-0 mt-2" />
            )}
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default NotificationsPage;
