import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext.jsx';

/**
 * NotificationsPage is deprecated in favor of the Notification Popup modal.
 * This component automatically opens the notification popup over the home feed.
 */
export const NotificationsPage = () => {
  const { openNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    openNotifications();
    navigate('/', { replace: true });
  }, [openNotifications, navigate]);

  return null;
};

export default NotificationsPage;
