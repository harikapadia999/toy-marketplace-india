import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { logInfo, logError } from './logger';

export const initializeWebSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.data.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logInfo('WebSocket connected', { userId, socketId: socket.id });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle chat messages
    socket.on('chat:join', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      logInfo('User joined chat', { userId, chatId });
    });

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      logInfo('User left chat', { userId, chatId });
    });

    socket.on('chat:message', (data: { chatId: string; message: string }) => {
      // Broadcast to chat room
      socket.to(`chat:${data.chatId}`).emit('chat:new-message', {
        chatId: data.chatId,
        message: data.message,
        senderId: userId,
        timestamp: new Date(),
      });
    });

    socket.on('chat:typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('chat:user-typing', {
        chatId: data.chatId,
        userId,
        isTyping: data.isTyping,
      });
    });

    // Handle notifications
    socket.on('notification:read', (notificationId: string) => {
      logInfo('Notification read', { userId, notificationId });
    });

    // Handle online status
    socket.on('user:online', () => {
      socket.broadcast.emit('user:status', {
        userId,
        status: 'online',
      });
    });

    socket.on('disconnect', () => {
      logInfo('WebSocket disconnected', { userId, socketId: socket.id });
      socket.broadcast.emit('user:status', {
        userId,
        status: 'offline',
      });
    });
  });

  // Helper functions to emit events
  const emitToUser = (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  const emitToChat = (chatId: string, event: string, data: any) => {
    io.to(`chat:${chatId}`).emit(event, data);
  };

  const emitToAll = (event: string, data: any) => {
    io.emit(event, data);
  };

  return {
    io,
    emitToUser,
    emitToChat,
    emitToAll,
  };
};

// Export types
export type WebSocketServer = ReturnType<typeof initializeWebSocket>;
