import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('Search API', () => {
  let testUserId: string;
  let testToyIds: string[] = [];

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'seller@test.com',
        password: 'hashedpassword',
        name: 'Test Seller',
      },
    });
    testUserId = user.id;

    // Create test toys
    const toys = await Promise.all([
      prisma.toy.create({
        data: {
          title: 'LEGO Star Wars Millennium Falcon',
          description: 'Brand new LEGO set, never opened',
          price: 5000,
          condition: 'new',
          ageGroup: '9-12',
          category: 'building',
          tags: ['lego', 'star wars', 'building blocks'],
          city: 'Mumbai',
          state: 'Maharashtra',
          sellerId: testUserId,
        },
      }),
      prisma.toy.create({
        data: {
          title: 'Barbie Dreamhouse',
          description: 'Gently used Barbie dollhouse',
          price: 3000,
          condition: 'good',
          ageGroup: '3-5',
          category: 'dolls',
          tags: ['barbie', 'dollhouse', 'girls'],
          city: 'Delhi',
          state: 'Delhi',
          sellerId: testUserId,
        },
      }),
      prisma.toy.create({
        data: {
          title: 'Hot Wheels Track Set',
          description: 'Complete track set with 10 cars',
          price: 1500,
          condition: 'like_new',
          ageGroup: '6-8',
          category: 'vehicles',
          tags: ['hot wheels', 'cars', 'track'],
          city: 'Bangalore',
          state: 'Karnataka',
          sellerId: testUserId,
        },
      }),
    ]);

    testToyIds = toys.map((t) => t.id);
  });

  afterAll(async () => {
    // Clean up
    await prisma.toy.deleteMany({
      where: { id: { in: testToyIds } },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/search', () => {
    it('should search toys by query', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ query: 'LEGO' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toys).toHaveLength(1);
      expect(response.body.data.toys[0].title).toContain('LEGO');
    });

    it('should filter by age group', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ ageGroup: ['3-5'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toys.every((t: any) => t.ageGroup === '3-5')).toBe(true);
    });

    it('should filter by condition', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ condition: ['new'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toys.every((t: any) => t.condition === 'new')).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ priceMin: 1000, priceMax: 2000 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.toys.every(
          (t: any) => t.price >= 1000 && t.price <= 2000
        )
      ).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ category: ['building'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toys.every((t: any) => t.category === 'building')).toBe(
        true
      );
    });

    it('should filter by location', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ location: 'Mumbai' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toys.every((t: any) => t.city === 'Mumbai')).toBe(true);
    });

    it('should sort by price ascending', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ sortBy: 'price-asc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.data.toys.map((t: any) => parseFloat(t.price));
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should sort by price descending', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ sortBy: 'price-desc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.data.toys.map((t: any) => parseFloat(t.price));
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toys.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({
          query: 'LEGO',
          ageGroup: ['9-12'],
          condition: ['new'],
          priceMin: 4000,
          priceMax: 6000,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toys).toHaveLength(1);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('should return search suggestions', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .query({ query: 'LEG' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeInstanceOf(Array);
    });

    it('should fail without query parameter', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/search/filters', () => {
    it('should return available filter options', async () => {
      const response = await request(app).get('/api/search/filters').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.filters).toHaveProperty('ageGroups');
      expect(response.body.data.filters).toHaveProperty('conditions');
      expect(response.body.data.filters).toHaveProperty('categories');
      expect(response.body.data.filters).toHaveProperty('locations');
    });
  });
});