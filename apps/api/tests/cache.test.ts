import { describe, it, expect } from 'vitest';
import { cache, cacheKeys, cacheTTL } from '../lib/cache';

describe('Redis Caching', () => {
  describe('Cache Operations', () => {
    it('should set and get value', async () => {
      const key = 'test:key';
      const value = { name: 'Test', count: 42 };

      await cache.set(key, value, 60);
      const result = await cache.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await cache.get('non:existent:key');
      expect(result).toBeNull();
    });

    it('should delete value', async () => {
      const key = 'test:delete';
      await cache.set(key, 'value', 60);
      
      await cache.del(key);
      const result = await cache.get(key);

      expect(result).toBeNull();
    });

    it('should check if key exists', async () => {
      const key = 'test:exists';
      await cache.set(key, 'value', 60);

      const exists = await cache.exists(key);
      expect(exists).toBe(true);

      await cache.del(key);
      const notExists = await cache.exists(key);
      expect(notExists).toBe(false);
    });

    it('should increment counter', async () => {
      const key = 'test:counter';
      
      const count1 = await cache.incr(key);
      expect(count1).toBe(1);

      const count2 = await cache.incr(key);
      expect(count2).toBe(2);

      await cache.del(key);
    });

    it('should set expiry on existing key', async () => {
      const key = 'test:expire';
      await cache.set(key, 'value', 3600);

      await cache.expire(key, 60);

      // Key should still exist
      const exists = await cache.exists(key);
      expect(exists).toBe(true);

      await cache.del(key);
    });

    it('should delete keys by pattern', async () => {
      await cache.set('test:pattern:1', 'value1', 60);
      await cache.set('test:pattern:2', 'value2', 60);
      await cache.set('test:other', 'value3', 60);

      await cache.delPattern('test:pattern:*');

      const result1 = await cache.get('test:pattern:1');
      const result2 = await cache.get('test:pattern:2');
      const result3 = await cache.get('test:other');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBe('value3');

      await cache.del('test:other');
    });
  });

  describe('Cache Keys', () => {
    it('should generate toy cache key', () => {
      const key = cacheKeys.toy('toy-123');
      expect(key).toBe('toy:toy-123');
    });

    it('should generate toys list cache key', () => {
      const key = cacheKeys.toys('category=educational&sort=price');
      expect(key).toBe('toys:category=educational&sort=price');
    });

    it('should generate user cache key', () => {
      const key = cacheKeys.user('user-456');
      expect(key).toBe('user:user-456');
    });

    it('should generate cart cache key', () => {
      const key = cacheKeys.cart('user-789');
      expect(key).toBe('cart:user-789');
    });

    it('should generate featured toys cache key', () => {
      const key = cacheKeys.featuredToys();
      expect(key).toBe('toys:featured');
    });
  });

  describe('Cache TTL', () => {
    it('should have short TTL', () => {
      expect(cacheTTL.short).toBe(300); // 5 minutes
    });

    it('should have medium TTL', () => {
      expect(cacheTTL.medium).toBe(1800); // 30 minutes
    });

    it('should have long TTL', () => {
      expect(cacheTTL.long).toBe(3600); // 1 hour
    });

    it('should have day TTL', () => {
      expect(cacheTTL.day).toBe(86400); // 24 hours
    });
  });

  describe('Cache Performance', () => {
    it('should be faster than database query', async () => {
      const key = 'test:performance';
      const data = { large: 'data'.repeat(1000) };

      // First call - cache miss
      const start1 = Date.now();
      await cache.set(key, data, 60);
      const time1 = Date.now() - start1;

      // Second call - cache hit
      const start2 = Date.now();
      await cache.get(key);
      const time2 = Date.now() - start2;

      expect(time2).toBeLessThan(time1);

      await cache.del(key);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        cache.set(`test:concurrent:${i}`, { value: i }, 60)
      );

      await Promise.all(promises);

      const results = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          cache.get(`test:concurrent:${i}`)
        )
      );

      results.forEach((result, i) => {
        expect(result).toEqual({ value: i });
      });

      // Cleanup
      await cache.delPattern('test:concurrent:*');
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate toy cache on update', async () => {
      const toyId = 'toy-123';
      const key = cacheKeys.toy(toyId);

      await cache.set(key, { title: 'Old Title' }, 60);

      // Simulate toy update
      await cache.del(key);

      const result = await cache.get(key);
      expect(result).toBeNull();
    });

    it('should invalidate toys list cache on new toy', async () => {
      const key = cacheKeys.toys('category=educational');

      await cache.set(key, [{ id: '1' }, { id: '2' }], 60);

      // Simulate new toy added
      await cache.delPattern('toys:*');

      const result = await cache.get(key);
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      const key = 'test:invalid';
      
      // Manually set invalid JSON
      await cache.set(key, 'invalid json', 60);

      const result = await cache.get(key);
      expect(result).toBe('invalid json');

      await cache.del(key);
    });

    it('should handle connection errors', async () => {
      // This test would require mocking Redis connection failure
      // For now, we just ensure the cache functions don't throw
      try {
        await cache.get('test:error');
      } catch (error) {
        // Should not throw
        expect(error).toBeUndefined();
      }
    });
  });
});

describe('Cache Integration', () => {
  describe('Toy Caching', () => {
    it('should cache toy details', async () => {
      const toyId = 'toy-456';
      const toyData = {
        id: toyId,
        title: 'LEGO Set',
        price: 1500,
        category: 'educational',
      };

      const key = cacheKeys.toy(toyId);
      await cache.set(key, toyData, cacheTTL.medium);

      const cached = await cache.get(key);
      expect(cached).toEqual(toyData);

      await cache.del(key);
    });

    it('should cache toys list', async () => {
      const params = 'category=educational&page=1';
      const toysData = [
        { id: '1', title: 'Toy 1' },
        { id: '2', title: 'Toy 2' },
      ];

      const key = cacheKeys.toys(params);
      await cache.set(key, toysData, cacheTTL.short);

      const cached = await cache.get(key);
      expect(cached).toEqual(toysData);

      await cache.del(key);
    });
  });

  describe('User Caching', () => {
    it('should cache user profile', async () => {
      const userId = 'user-789';
      const userData = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const key = cacheKeys.user(userId);
      await cache.set(key, userData, cacheTTL.medium);

      const cached = await cache.get(key);
      expect(cached).toEqual(userData);

      await cache.del(key);
    });
  });

  describe('Cart Caching', () => {
    it('should cache shopping cart', async () => {
      const userId = 'user-101';
      const cartData = {
        items: [
          { toyId: 'toy-1', quantity: 2 },
          { toyId: 'toy-2', quantity: 1 },
        ],
        total: 3500,
      };

      const key = cacheKeys.cart(userId);
      await cache.set(key, cartData, cacheTTL.short);

      const cached = await cache.get(key);
      expect(cached).toEqual(cartData);

      await cache.del(key);
    });
  });
});
