import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@toy-marketplace/database/client';
import { chats, messages } from '@toy-marketplace/database';
import { eq, and, or, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// Get all chats for user
app.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const userChats = await db.query.chats.findMany({
      where: or(
        eq(chats.user1Id, user.userId),
        eq(chats.user2Id, user.userId)
      ),
      with: {
        user1: true,
        user2: true,
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
        },
      },
      orderBy: [desc(chats.updatedAt)],
    });

    return c.json({
      success: true,
      data: userChats.map((chat) => ({
        ...chat,
        otherUser: chat.user1Id === user.userId ? chat.user2 : chat.user1,
        lastMessage: chat.messages[0],
      })),
    });
  } catch (error: any) {
    console.error('Get chats error:', error);
    return c.json({
      error: 'Failed to get chats',
      message: error.message,
    }, 500);
  }
});

// Get or create chat
const createChatSchema = z.object({
  otherUserId: z.string().uuid(),
});

app.post('/', authMiddleware, zValidator('json', createChatSchema), async (c) => {
  try {
    const user = c.get('user');
    const { otherUserId } = c.req.valid('json');

    // Check if chat already exists
    const existingChat = await db.query.chats.findFirst({
      where: or(
        and(
          eq(chats.user1Id, user.userId),
          eq(chats.user2Id, otherUserId)
        ),
        and(
          eq(chats.user1Id, otherUserId),
          eq(chats.user2Id, user.userId)
        )
      ),
    });

    if (existingChat) {
      return c.json({
        success: true,
        data: existingChat,
      });
    }

    // Create new chat
    const [newChat] = await db.insert(chats).values({
      user1Id: user.userId,
      user2Id: otherUserId,
    }).returning();

    return c.json({
      success: true,
      data: newChat,
    }, 201);
  } catch (error: any) {
    console.error('Create chat error:', error);
    return c.json({
      error: 'Failed to create chat',
      message: error.message,
    }, 500);
  }
});

// Get chat by ID
app.get('/:chatId', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { chatId } = c.req.param();

    const chat = await db.query.chats.findFirst({
      where: and(
        eq(chats.id, chatId),
        or(
          eq(chats.user1Id, user.userId),
          eq(chats.user2Id, user.userId)
        )
      ),
      with: {
        user1: true,
        user2: true,
      },
    });

    if (!chat) {
      return c.json({
        error: 'Chat not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        ...chat,
        participants: [chat.user1, chat.user2],
      },
    });
  } catch (error: any) {
    console.error('Get chat error:', error);
    return c.json({
      error: 'Failed to get chat',
      message: error.message,
    }, 500);
  }
});

// Get messages for chat
app.get('/:chatId/messages', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { chatId } = c.req.param();

    // Verify user is part of chat
    const chat = await db.query.chats.findFirst({
      where: and(
        eq(chats.id, chatId),
        or(
          eq(chats.user1Id, user.userId),
          eq(chats.user2Id, user.userId)
        )
      ),
    });

    if (!chat) {
      return c.json({
        error: 'Chat not found',
      }, 404);
    }

    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      orderBy: [messages.createdAt],
    });

    return c.json({
      success: true,
      data: chatMessages,
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return c.json({
      error: 'Failed to get messages',
      message: error.message,
    }, 500);
  }
});

// Send message
const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  type: z.enum(['text', 'image']).default('text'),
});

app.post('/:chatId/messages', authMiddleware, zValidator('json', sendMessageSchema), async (c) => {
  try {
    const user = c.get('user');
    const { chatId } = c.req.param();
    const { content, type } = c.req.valid('json');

    // Verify user is part of chat
    const chat = await db.query.chats.findFirst({
      where: and(
        eq(chats.id, chatId),
        or(
          eq(chats.user1Id, user.userId),
          eq(chats.user2Id, user.userId)
        )
      ),
    });

    if (!chat) {
      return c.json({
        error: 'Chat not found',
      }, 404);
    }

    // Create message
    const [message] = await db.insert(messages).values({
      chatId,
      senderId: user.userId,
      content,
      type,
    }).returning();

    // Update chat timestamp
    await db.update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, chatId));

    return c.json({
      success: true,
      data: message,
    }, 201);
  } catch (error: any) {
    console.error('Send message error:', error);
    return c.json({
      error: 'Failed to send message',
      message: error.message,
    }, 500);
  }
});

export { app as messagesRoutes };
