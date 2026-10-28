import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to server (in dev Vite proxies or connect to window.location.origin)
    const newSocket = io(window.location.origin, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // If user is authenticated, join their personal alert room
      if (user?.id) {
        newSocket.emit('join_user_room', user.id);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Update room membership when user changes
  useEffect(() => {
    if (socket && socket.connected && user?.id) {
      socket.emit('join_user_room', user.id);
    }
  }, [socket, user]);

  const joinAuction = (auctionId) => {
    if (socket && socket.connected && auctionId) {
      socket.emit('join_auction_room', auctionId);
    }
  };

  const leaveAuction = (auctionId) => {
    if (socket && socket.connected && auctionId) {
      socket.emit('leave_auction_room', auctionId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinAuction, leaveAuction }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || { socket: null, joinAuction: () => {}, leaveAuction: () => {} };
};

export default SocketContext;
