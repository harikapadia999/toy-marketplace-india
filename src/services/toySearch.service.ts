import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SearchParams {
  query?: string;
  ageGroup?: string[];
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  category?: string[];
  location?: string;
  availability?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export class ToySearchService {
  /**
   * Search toys with advanced filters
   */
  async searchToys(params: SearchParams) {
    const {
      query = '',
      ageGroup = [],
      condition = [],
      priceMin = 0,
      priceMax = 1000000,
      category = [],
      location = '',
      availability = 'all',
      sortBy = 'relevance',
      page = 1,
      limit = 20,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      AND: [
        // Price range
        {
          price: {
            gte: priceMin,
            lte: priceMax,
          },
        },
      ],
    };

    // Full-text search
    if (query) {
      where.AND.push({
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            tags: {
              hasSome: query.split(' '),
            },
          },
        ],
      });
    }

    // Age group filter
    if (ageGroup.length > 0) {
      where.AND.push({
        ageGroup: {
          in: ageGroup,
        },
      });
    }

    // Condition filter
    if (condition.length > 0) {
      where.AND.push({
        condition: {
          in: condition,
        },
      });
    }

    // Category filter
    if (category.length > 0) {
      where.AND.push({
        category: {
          in: category,
        },
      });
    }

    // Location filter
    if (location) {
      where.AND.push({
        OR: [
          {
            city: {
              contains: location,
              mode: 'insensitive',
            },
          },
          {
            state: {
              contains: location,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    // Availability filter
    if (availability !== 'all') {
      where.AND.push({
        status: availability,
      });
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'date-desc':
        orderBy = { createdAt: 'desc' };
        break;
      case 'date-asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'relevance':
      default:
        // For relevance, we'll use a combination of factors
        orderBy = [
          { featured: 'desc' },
          { views: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
    }

    // Execute query
    const [toys, total] = await Promise.all([
      prisma.toy.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              rating: true,
            },
          },
          images: {
            take: 1,
            orderBy: {
              order: 'asc',
            },
          },
        },
      }),
      prisma.toy.count({ where }),
    ]);

    return {
      toys,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSearchSuggestions(query: string, limit: number = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = await prisma.toy.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            tags: {
              hasSome: [query],
            },
          },
        ],
        status: 'available',
      },
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        images: {
          take: 1,
          select: {
            url: true,
          },
        },
      },
      take: limit,
      orderBy: {
        views: 'desc',
      },
    });

    return suggestions;
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit: number = 10) {
    const searches = await prisma.searchLog.groupBy({
      by: ['query'],
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: limit,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return searches.map((s) => ({
      query: s.query,
      count: s._count.query,
    }));
  }

  /**
   * Log search query for analytics
   */
  async logSearch(query: string, userId?: string, resultsCount?: number) {
    await prisma.searchLog.create({
      data: {
        query,
        userId,
        resultsCount,
      },
    });
  }

  /**
   * Get filter options with counts
   */
  async getFilterOptions() {
    const [ageGroups, conditions, categories, locations] = await Promise.all([
      prisma.toy.groupBy({
        by: ['ageGroup'],
        _count: true,
        where: { status: 'available' },
      }),
      prisma.toy.groupBy({
        by: ['condition'],
        _count: true,
        where: { status: 'available' },
      }),
      prisma.toy.groupBy({
        by: ['category'],
        _count: true,
        where: { status: 'available' },
      }),
      prisma.toy.groupBy({
        by: ['city', 'state'],
        _count: true,
        where: { status: 'available' },
      }),
    ]);

    return {
      ageGroups: ageGroups.map((g) => ({
        value: g.ageGroup,
        count: g._count,
      })),
      conditions: conditions.map((c) => ({
        value: c.condition,
        count: c._count,
      })),
      categories: categories.map((c) => ({
        value: c.category,
        count: c._count,
      })),
      locations: locations.map((l) => ({
        city: l.city,
        state: l.state,
        count: l._count,
      })),
    };
  }
}

export const toySearchService = new ToySearchService();