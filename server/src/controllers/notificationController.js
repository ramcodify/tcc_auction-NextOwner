import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    return res.status(200).json({
      status: 'success',
      data: notifications,
      unreadCount
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    return res.status(200).json({ status: 'success', data: notification });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    return res.status(200).json({ status: 'success', message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
