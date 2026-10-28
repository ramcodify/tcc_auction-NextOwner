import Notification from '../models/Notification.js';

let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Client joins room for their personal user alerts
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Client joins room for a specific auction's live countdown and bid stream
    socket.on('join_auction_room', (auctionId) => {
      if (auctionId) {
        socket.join(`auction:${auctionId}`);
      }
    });

    socket.on('leave_auction_room', (auctionId) => {
      if (auctionId) {
        socket.leave(`auction:${auctionId}`);
      }
    });

    socket.on('disconnect', () => {
      // Room memberships automatically cleaned up
    });
  });
};

export const getIO = () => ioInstance;

export const createNotification = async ({
  userId,
  title,
  message,
  type = 'system',
  relatedAuctionId = null,
  link = ''
}) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedAuctionId,
      link
    });

    if (ioInstance) {
      ioInstance.to(`user:${userId}`).emit('notification_received', notification);
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService Error]', error.message);
    return null;
  }
};
