import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Redis for pub/sub
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisSub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Store online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

// Redis pub/sub for horizontal scaling
redisSub.subscribe('chat:message', 'chat:typing', 'chat:read');

redisSub.on('message', (channel, message) => {
  const data = JSON.parse(message);

  switch (channel) {
    case 'chat:message':
      io.to(data.conversationId).emit('message:new', data.message);
      break;
    case 'chat:typing':
      io.to(data.conversationId).emit(
        data.isTyping ? 'typing:start' : 'typing:stop',
        data
      );
      break;
    case 'chat:read':
      io.to(data.conversationId).emit('message:read', data);
      break;
  }
});

io.use(async (socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error('Authentication error'));
  }
  socket.data.userId = userId;
  next();
});

io.on('connection', (socket: Socket) => {
  const userId = socket.data.userId;
  console.log(`User connected: ${userId}`);

  // Store online user
  onlineUsers.set(userId, socket.id);

  // Broadcast user online status
  socket.broadcast.emit('user:online', { userId });

  // Join user's conversations
  joinUserConversations(socket, userId);

  // Handle joining a conversation
  socket.on('conversation:join', async ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  // Handle sending a message
  socket.on('message:send', async (data) => {
    try {
      const { conversationId, senderId, content, type, mediaUrl } = data;

      // Save message to database
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
          type,
          mediaUrl,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Update conversation's last message
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          updatedAt: new Date(),
        },
      });

      // Publish to Redis for other servers
      await redis.publish(
        'chat:message',
        JSON.stringify({
          conversationId,
          message,
        })
      );

      // Send to room (local server)
      io.to(conversationId).emit('message:new', message);

      // Send push notification to offline users
      await sendPushNotification(conversationId, senderId, message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing:start', async ({ conversationId }) => {
    const data = { conversationId, userId, isTyping: true };
    await redis.publish('chat:typing', JSON.stringify(data));
    socket.to(conversationId).emit('typing:start', data);
  });

  socket.on('typing:stop', async ({ conversationId }) => {
    const data = { conversationId, userId, isTyping: false };
    await redis.publish('chat:typing', JSON.stringify(data));
    socket.to(conversationId).emit('typing:stop', data);
  });

  // Handle message read receipts
  socket.on('message:read', async ({ messageId }) => {
    try {
      const message = await prisma.message.update({
        where: { id: messageId },
        data: { readAt: new Date() },
      });

      const data = {
        conversationId: message.conversationId,
        messageId,
        readAt: message.readAt,
      };

      await redis.publish('chat:read', JSON.stringify(data));
      io.to(message.conversationId).emit('message:read', data);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle marking all messages as read
  socket.on('messages:read', async ({ conversationId }) => {
    try {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          readAt: null,
        },
        data: { readAt: new Date() },
      });

      socket.to(conversationId).emit('messages:read', { conversationId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    onlineUsers.delete(userId);
    socket.broadcast.emit('user:offline', { userId });
  });
});

async function joinUserConversations(socket: Socket, userId: string) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      select: { id: true },
    });

    conversations.forEach((conv) => {
      socket.join(conv.id);
    });
  } catch (error) {
    console.error('Error joining conversations:', error);
  }
}

async function sendPushNotification(
  conversationId: string,
  senderId: string,
  message: any
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        buyer: true,
        seller: true,
      },
    });

    if (!conversation) return;

    const recipientId =
      senderId === conversation.buyerId
        ? conversation.sellerId
        : conversation.buyerId;

    // Check if recipient is online
    if (!onlineUsers.has(recipientId)) {
      // Send push notification (implement with FCM, OneSignal, etc.)
      console.log(`Sending push notification to ${recipientId}`);
      // await sendPushNotificationService(recipientId, message);
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});

export { io, httpServer };