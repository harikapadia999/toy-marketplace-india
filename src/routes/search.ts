import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { toySearchService } from '../services/toySearch.service';

const router = Router();

// Validation schema
const searchSchema = z.object({
  query: z.string().optional(),
  ageGroup: z.array(z.string()).optional(),
  condition: z.array(z.string()).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  category: z.array(z.string()).optional(),
  location: z.string().optional(),
  availability: z.enum(['all', 'available', 'sold']).optional(),
  sortBy: z
    .enum(['relevance', 'price-asc', 'price-desc', 'date-desc', 'date-asc'])
    .optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

/**
 * GET /api/search
 * Search toys with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    const params = searchSchema.parse({
      query: req.query.query,
      ageGroup: req.query.ageGroup
        ? Array.isArray(req.query.ageGroup)
          ? req.query.ageGroup
          : [req.query.ageGroup]
        : undefined,
      condition: req.query.condition
        ? Array.isArray(req.query.condition)
          ? req.query.condition
          : [req.query.condition]
        : undefined,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      category: req.query.category
        ? Array.isArray(req.query.category)
          ? req.query.category
          : [req.query.category]
        : undefined,
      location: req.query.location,
      availability: req.query.availability,
      sortBy: req.query.sortBy,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });

    // Perform search
    const result = await toySearchService.searchToys(params);

    // Log search for analytics
    if (params.query) {
      await toySearchService.logSearch(
        params.query,
        req.user?.userId,
        result.toys.length
      );
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors,
      });
    }

    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions/autocomplete
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { query, limit } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    const suggestions = await toySearchService.getSearchSuggestions(
      query,
      limit ? Number(limit) : undefined
    );

    res.json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/search/popular
 * Get popular search terms
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const searches = await toySearchService.getPopularSearches(
      limit ? Number(limit) : undefined
    );

    res.json({
      success: true,
      data: { searches },
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/search/filters
 * Get available filter options with counts
 */
router.get('/filters', async (req: Request, res: Response) => {
  try {
    const filters = await toySearchService.getFilterOptions();

    res.json({
      success: true,
      data: { filters },
    });
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;