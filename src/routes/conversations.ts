import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                readAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format response
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      buyerId: conv.buyerId,
      sellerId: conv.sellerId,
      listingId: conv.listingId,
      listing: {
        title: conv.listing.title,
        price: conv.listing.price,
        image: conv.listing.images[0]?.url || '',
      },
      otherUser:
        conv.buyerId === userId
          ? {
              id: conv.seller.id,
              name: conv.seller.name,
              avatar: conv.seller.avatar,
              online: false, // Will be updated by socket
            }
          : {
              id: conv.buyer.id,
              name: conv.buyer.name,
              avatar: conv.buyer.avatar,
              online: false,
            },
      lastMessage: conv.messages[0] || null,
      unreadCount: conv._count.messages,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    res.json({
      success: true,
      data: {
        conversations: formattedConversations,
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/conversations
 * Create or get existing conversation
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { otherUserId, listingId } = req.body;

    if (!otherUserId || !listingId) {
      return res.status(400).json({
        success: false,
        error: 'otherUserId and listingId are required',
      });
    }

    // Determine buyer and seller
    const listing = await prisma.toy.findUnique({
      where: { id: listingId },
      select: { sellerId: true },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    const isBuyer = userId !== listing.sellerId;
    const buyerId = isBuyer ? userId : otherUserId;
    const sellerId = isBuyer ? otherUserId : userId;

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        buyerId,
        sellerId,
        listingId,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          buyerId,
          sellerId,
          listingId,
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                take: 1,
                select: {
                  url: true,
                },
              },
            },
          },
        },
      });
    }

    res.json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/conversations/:id/messages
 * Get messages for a conversation
 */
router.get('/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const conversationId = req.params.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.message.count({
        where: { conversationId },
      }),
    ]);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const conversationId = req.params.id;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;