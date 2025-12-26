import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@toy-marketplace/database/client';
import { toys, insertToySchema } from '@toy-marketplace/database';
import { eq, and, desc, asc, sql, like, gte, lte } from 'drizzle-orm';
import { authMiddleware, optionalAuthMiddleware, AuthContext } from '../middleware/auth';

const app = new Hono();

// Get all toys with filters
const getToysSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  category: z.string().optional(),
  condition: z.enum(['new', 'like_new', 'good', 'fair']).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).optional().default('newest'),
  status: z.enum(['active', 'sold', 'inactive']).optional().default('active'),
});

app.get('/', zValidator('query', getToysSchema), optionalAuthMiddleware, async (c) => {
  try {
    const query = c.req.valid('query');
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (query.status) {
      conditions.push(eq(toys.status, query.status));
    }
    
    if (query.category) {
      conditions.push(eq(toys.category, query.category));
    }
    
    if (query.condition) {
      conditions.push(eq(toys.condition, query.condition));
    }
    
    if (query.minPrice) {
      conditions.push(gte(toys.salePrice, query.minPrice));
    }
    
    if (query.maxPrice) {
      conditions.push(lte(toys.salePrice, query.maxPrice));
    }
    
    if (query.search) {
      conditions.push(
        sql`${toys.title} ILIKE ${`%${query.search}%`} OR ${toys.description} ILIKE ${`%${query.search}%`}`
      );
    }

    // Build order by
    let orderBy;
    switch (query.sortBy) {
      case 'price_asc':
        orderBy = asc(toys.salePrice);
        break;
      case 'price_desc':
        orderBy = desc(toys.salePrice);
        break;
      case 'oldest':
        orderBy = asc(toys.createdAt);
        break;
      case 'newest':
      default:
        orderBy = desc(toys.createdAt);
        break;
    }

    // Get toys
    const toysList = await db.query.toys.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        seller: {
          columns: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(toys)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return c.json({
      success: true,
      data: toysList,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error: any) {
    console.error('Get toys error:', error);
    return c.json({
      error: 'Failed to fetch toys',
      message: error.message,
    }, 500);
  }
});

// Get single toy
app.get('/:id', optionalAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');

    const toy = await db.query.toys.findFirst({
      where: eq(toys.id, id),
      with: {
        seller: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
          },
        },
        reviews: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: desc(sql`created_at`),
          limit: 10,
        },
      },
    });

    if (!toy) {
      return c.json({
        error: 'Not Found',
        message: 'Toy not found',
      }, 404);
    }

    // Increment views
    await db.update(toys)
      .set({ views: sql`${toys.views} + 1` })
      .where(eq(toys.id, id));

    return c.json({
      success: true,
      data: toy,
    });
  } catch (error: any) {
    console.error('Get toy error:', error);
    return c.json({
      error: 'Failed to fetch toy',
      message: error.message,
    }, 500);
  }
});

// Create toy (authenticated)
app.post('/', authMiddleware, zValidator('json', insertToySchema), async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const data = c.req.valid('json');

    const [toy] = await db.insert(toys).values({
      ...data,
      sellerId: user.userId,
    }).returning();

    return c.json({
      success: true,
      message: 'Toy created successfully',
      data: toy,
    }, 201);
  } catch (error: any) {
    console.error('Create toy error:', error);
    return c.json({
      error: 'Failed to create toy',
      message: error.message,
    }, 500);
  }
});

// Update toy (authenticated, owner only)
app.put('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const id = c.req.param('id');
    const data = await c.req.json();

    // Check ownership
    const toy = await db.query.toys.findFirst({
      where: eq(toys.id, id),
    });

    if (!toy) {
      return c.json({
        error: 'Not Found',
        message: 'Toy not found',
      }, 404);
    }

    if (toy.sellerId !== user.userId && user.role !== 'admin') {
      return c.json({
        error: 'Forbidden',
        message: 'You can only update your own toys',
      }, 403);
    }

    const [updatedToy] = await db.update(toys)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(toys.id, id))
      .returning();

    return c.json({
      success: true,
      message: 'Toy updated successfully',
      data: updatedToy,
    });
  } catch (error: any) {
    console.error('Update toy error:', error);
    return c.json({
      error: 'Failed to update toy',
      message: error.message,
    }, 500);
  }
});

// Delete toy (authenticated, owner only)
app.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const id = c.req.param('id');

    // Check ownership
    const toy = await db.query.toys.findFirst({
      where: eq(toys.id, id),
    });

    if (!toy) {
      return c.json({
        error: 'Not Found',
        message: 'Toy not found',
      }, 404);
    }

    if (toy.sellerId !== user.userId && user.role !== 'admin') {
      return c.json({
        error: 'Forbidden',
        message: 'You can only delete your own toys',
      }, 403);
    }

    await db.delete(toys).where(eq(toys.id, id));

    return c.json({
      success: true,
      message: 'Toy deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete toy error:', error);
    return c.json({
      error: 'Failed to delete toy',
      message: error.message,
    }, 500);
  }
});

export { app as toyRoutes };
