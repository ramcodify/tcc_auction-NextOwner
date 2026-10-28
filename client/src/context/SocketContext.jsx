import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const currentAuctionRoomRef = useRef(null);

  useEffect(() => {
    // Prefer direct server connection on dev to ensure WebSocket and polling succeed
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin);

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // Re-join personal alert room on connect/reconnect
      if (user?.id) {
        newSocket.emit('join_user_room', user.id);
      }
      // Re-join current auction room on connect/reconnect
      if (currentAuctionRoomRef.current) {
        newSocket.emit('join_auction_room', currentAuctionRoomRef.current);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Update room membership when user auth changes
  useEffect(() => {
    if (socket && user?.id) {
      socket.emit('join_user_room', user.id);
    }
  }, [socket, user]);

  const joinAuction = (auctionId) => {
    if (!auctionId) return;
    currentAuctionRoomRef.current = String(auctionId);
    if (socket) {
      socket.emit('join_auction_room', String(auctionId));
    }
  };

  const leaveAuction = (auctionId) => {
    if (currentAuctionRoomRef.current === String(auctionId)) {
      currentAuctionRoomRef.current = null;
    }
    if (socket) {
      socket.emit('leave_auction_room', String(auctionId));
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
