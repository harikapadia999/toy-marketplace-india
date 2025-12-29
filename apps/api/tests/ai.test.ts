import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { predictPrice, generateDescription, getRecommendations, chatbot, analyzeSentiment, recognizeToy } from '../lib/ai';

describe('AI/ML Features', () => {
  describe('Price Prediction', () => {
    it('should predict price for LEGO toy', async () => {
      const toyData = {
        title: 'LEGO City Police Station',
        description: 'Complete LEGO set with all pieces',
        category: 'educational',
        brand: 'LEGO',
        condition: 'like-new',
        ageRange: '5-10',
        originalPrice: 2000,
      };

      const result = await predictPrice(toyData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('recommendedPrice');
      expect(result.data).toHaveProperty('minPrice');
      expect(result.data).toHaveProperty('maxPrice');
      expect(result.data).toHaveProperty('reasoning');
      expect(result.data.recommendedPrice).toBeGreaterThan(0);
      expect(result.data.minPrice).toBeLessThan(result.data.recommendedPrice);
      expect(result.data.maxPrice).toBeGreaterThan(result.data.recommendedPrice);
    });

    it('should predict lower price for used toys', async () => {
      const toyData = {
        title: 'Hot Wheels Car Set',
        description: 'Used Hot Wheels cars',
        category: 'vehicles',
        brand: 'Hot Wheels',
        condition: 'used',
        ageRange: '3-8',
        originalPrice: 500,
      };

      const result = await predictPrice(toyData);

      expect(result.success).toBe(true);
      expect(result.data.recommendedPrice).toBeLessThan(toyData.originalPrice);
    });

    it('should handle toys without original price', async () => {
      const toyData = {
        title: 'Wooden Puzzle',
        description: 'Educational wooden puzzle',
        category: 'educational',
        brand: 'Generic',
        condition: 'new',
        ageRange: '2-5',
      };

      const result = await predictPrice(toyData);

      expect(result.success).toBe(true);
      expect(result.data.recommendedPrice).toBeGreaterThan(0);
    });
  });

  describe('Description Generation', () => {
    it('should generate engaging description', async () => {
      const toyData = {
        title: 'LEGO Technic Crane',
        category: 'educational',
        brand: 'LEGO',
        ageRange: '8-14',
        features: ['motorized', 'remote control', '1000+ pieces'],
      };

      const result = await generateDescription(toyData);

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(50);
      expect(result.data.length).toBeLessThan(500);
    });

    it('should include brand name in description', async () => {
      const toyData = {
        title: 'Barbie Dreamhouse',
        category: 'dolls',
        brand: 'Barbie',
        ageRange: '3-10',
      };

      const result = await generateDescription(toyData);

      expect(result.success).toBe(true);
      expect(result.data.toLowerCase()).toContain('barbie');
    });
  });

  describe('Smart Recommendations', () => {
    it('should generate personalized recommendations', async () => {
      const userData = {
        recentViews: ['LEGO City', 'Hot Wheels Track', 'Puzzle Set'],
        recentPurchases: ['LEGO Star Wars'],
        wishlist: ['LEGO Technic', 'Remote Control Car'],
        preferences: {
          categories: ['educational', 'vehicles'],
          brands: ['LEGO', 'Hot Wheels'],
          priceRange: { min: 500, max: 3000 },
        },
      };

      const result = await getRecommendations(userData);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('toyId');
      expect(result.data[0]).toHaveProperty('reason');
      expect(result.data[0]).toHaveProperty('confidence');
    });

    it('should provide confidence scores', async () => {
      const userData = {
        recentViews: ['Educational Toy'],
        recentPurchases: [],
        wishlist: [],
      };

      const result = await getRecommendations(userData);

      expect(result.success).toBe(true);
      result.data.forEach((rec: any) => {
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Customer Support Chatbot', () => {
    it('should answer platform questions', async () => {
      const message = 'How do I track my order?';

      const result = await chatbot(message);

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle payment queries', async () => {
      const message = 'What payment methods do you accept?';

      const result = await chatbot(message);

      expect(result.success).toBe(true);
      expect(result.data.toLowerCase()).toMatch(/payment|razorpay|cod|cash/);
    });

    it('should maintain conversation context', async () => {
      const conversationHistory = [
        { role: 'user', content: 'I want to buy a toy' },
        { role: 'assistant', content: 'Great! What kind of toy are you looking for?' },
      ];

      const result = await chatbot('Something educational for a 5 year old', conversationHistory);

      expect(result.success).toBe(true);
      expect(result.data.toLowerCase()).toMatch(/educational|learning|5|five/);
    });
  });

  describe('Sentiment Analysis', () => {
    it('should detect positive sentiment', async () => {
      const review = 'Amazing toy! My kids love it. Great quality and fast delivery.';

      const result = await analyzeSentiment(review);

      expect(result.success).toBe(true);
      expect(result.data.sentiment).toBe('positive');
      expect(result.data.score).toBeGreaterThan(0);
    });

    it('should detect negative sentiment', async () => {
      const review = 'Terrible quality. Broke within a day. Very disappointed.';

      const result = await analyzeSentiment(review);

      expect(result.success).toBe(true);
      expect(result.data.sentiment).toBe('negative');
      expect(result.data.score).toBeLessThan(0);
    });

    it('should detect neutral sentiment', async () => {
      const review = 'The toy arrived on time. It is as described.';

      const result = await analyzeSentiment(review);

      expect(result.success).toBe(true);
      expect(result.data.sentiment).toBe('neutral');
      expect(Math.abs(result.data.score)).toBeLessThan(0.3);
    });

    it('should identify key aspects', async () => {
      const review = 'Great quality but shipping was slow. Good value for money.';

      const result = await analyzeSentiment(review);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('aspects');
      expect(result.data.aspects).toHaveProperty('quality');
      expect(result.data.aspects).toHaveProperty('shipping');
      expect(result.data.aspects).toHaveProperty('value');
    });
  });

  describe('Image Recognition', () => {
    it('should recognize toy from image URL', async () => {
      const imageUrl = 'https://example.com/lego-set.jpg';

      const result = await recognizeToy(imageUrl);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('category');
      expect(result.data).toHaveProperty('ageRange');
      expect(result.data).toHaveProperty('brand');
      expect(result.data).toHaveProperty('condition');
      expect(result.data).toHaveProperty('features');
      expect(result.data).toHaveProperty('suggestedTitle');
      expect(result.data).toHaveProperty('suggestedDescription');
    });

    it('should suggest appropriate category', async () => {
      const imageUrl = 'https://example.com/educational-toy.jpg';

      const result = await recognizeToy(imageUrl);

      expect(result.success).toBe(true);
      expect(['educational', 'puzzles', 'learning']).toContain(result.data.category);
    });
  });
});

describe('AI API Routes', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test@123456',
      }),
    });
    const loginData = await loginResponse.json();
    authToken = loginData.data.token;
  });

  describe('POST /api/ai/predict-price', () => {
    it('should predict price via API', async () => {
      const response = await fetch('http://localhost:3001/api/ai/predict-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'LEGO Set',
          description: 'Complete LEGO set',
          category: 'educational',
          brand: 'LEGO',
          condition: 'new',
          ageRange: '5-10',
          originalPrice: 2000,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('recommendedPrice');
    });

    it('should require authentication', async () => {
      const response = await fetch('http://localhost:3001/api/ai/predict-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/ai/chatbot', () => {
    it('should respond to chatbot queries', async () => {
      const response = await fetch('http://localhost:3001/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'How do I track my order?',
          conversationHistory: [],
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(typeof data.data).toBe('string');
    });

    it('should not require authentication', async () => {
      const response = await fetch('http://localhost:3001/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });

      expect(response.status).toBe(200);
    });
  });
});
