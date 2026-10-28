import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const socketRef = useRef(null);
  const currentAuctionRoomRef = useRef(null);

  useEffect(() => {
    // Automatically use same-origin proxy (Vite /socket.io proxy) for guaranteed CORS/WebSocket success
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    console.log('[Socket] Initializing connection to:', socketUrl);

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 25,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected successfully! ID:', newSocket.id, 'transport:', newSocket.io.engine.transport.name);
      
      // Re-join personal user alerts room
      if (user?.id) {
        newSocket.emit('join_user_room', String(user.id));
      }
      // Re-join current auction room
      if (currentAuctionRoomRef.current) {
        console.log('[Socket] Re-subscribing to auction room:', currentAuctionRoomRef.current);
        newSocket.emit('join_auction_room', currentAuctionRoomRef.current);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    return () => {
      console.log('[Socket] Cleaning up socket connection.');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Update personal room membership when user login status changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && user?.id) {
      socketRef.current.emit('join_user_room', String(user.id));
    }
  }, [user]);

  const joinAuction = useCallback((auctionId) => {
    if (!auctionId) return;
    const cleanId = String(auctionId);
    currentAuctionRoomRef.current = cleanId;
    console.log('[Socket] Requesting join_auction_room for lot:', cleanId);
    if (socketRef.current) {
      socketRef.current.emit('join_auction_room', cleanId);
    }
  }, []);

  const leaveAuction = useCallback((auctionId) => {
    if (!auctionId) return;
    const cleanId = String(auctionId);
    if (currentAuctionRoomRef.current === cleanId) {
      currentAuctionRoomRef.current = null;
    }
    console.log('[Socket] Requesting leave_auction_room for lot:', cleanId);
    if (socketRef.current) {
      socketRef.current.emit('leave_auction_room', cleanId);
    }
  }, []);

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
