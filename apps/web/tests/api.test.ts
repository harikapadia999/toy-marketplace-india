import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api } from '../lib/api';

describe('Authentication API', () => {
  let authToken: string;
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test@123456',
    phone: '9876543210',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await api.register(testUser);
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
      expect(response.data.user.email).toBe(testUser.email);
      
      authToken = response.data.token;
    });

    it('should fail with duplicate email', async () => {
      await expect(api.register(testUser)).rejects.toThrow();
    });

    it('should fail with invalid email', async () => {
      await expect(
        api.register({ ...testUser, email: 'invalid-email' })
      ).rejects.toThrow();
    });

    it('should fail with weak password', async () => {
      await expect(
        api.register({ ...testUser, email: 'new@example.com', password: '123' })
      ).rejects.toThrow();
    });

    it('should fail with invalid phone', async () => {
      await expect(
        api.register({ ...testUser, email: 'new@example.com', phone: '123' })
      ).rejects.toThrow();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await api.login(testUser.email, testUser.password);
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
    });

    it('should fail with incorrect password', async () => {
      await expect(
        api.login(testUser.email, 'wrongpassword')
      ).rejects.toThrow();
    });

    it('should fail with non-existent email', async () => {
      await expect(
        api.login('nonexistent@example.com', testUser.password)
      ).rejects.toThrow();
    });

    it('should fail with empty credentials', async () => {
      await expect(api.login('', '')).rejects.toThrow();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const response = await api.getProfile();
      
      expect(response.success).toBe(true);
      expect(response.data.email).toBe(testUser.email);
    });

    it('should fail without token', async () => {
      await api.logout();
      await expect(api.getProfile()).rejects.toThrow();
    });
  });
});

describe('Toys API', () => {
  let toyId: string;
  const testToy = {
    title: 'Test LEGO Set',
    description: 'A test LEGO building set',
    category: 'educational',
    brand: 'LEGO',
    condition: 'new',
    ageRange: '5-10',
    originalPrice: 2000,
    salePrice: 1500,
    images: ['https://example.com/image1.jpg'],
  };

  describe('POST /api/toys', () => {
    it('should create a new toy listing', async () => {
      const response = await api.createToy(testToy);
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      expect(response.data.title).toBe(testToy.title);
      
      toyId = response.data.id;
    });

    it('should fail without authentication', async () => {
      await api.logout();
      await expect(api.createToy(testToy)).rejects.toThrow();
    });

    it('should fail with invalid data', async () => {
      await expect(
        api.createToy({ ...testToy, title: '' })
      ).rejects.toThrow();
    });
  });

  describe('GET /api/toys', () => {
    it('should get list of toys', async () => {
      const response = await api.getToys();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it('should filter toys by category', async () => {
      const response = await api.getToys({ category: 'educational' });
      
      expect(response.success).toBe(true);
      response.data.forEach((toy: any) => {
        expect(toy.category).toBe('educational');
      });
    });

    it('should search toys by keyword', async () => {
      const response = await api.getToys({ search: 'LEGO' });
      
      expect(response.success).toBe(true);
      response.data.forEach((toy: any) => {
        expect(toy.title.toLowerCase()).toContain('lego');
      });
    });

    it('should sort toys by price', async () => {
      const response = await api.getToys({ sort: 'price_asc' });
      
      expect(response.success).toBe(true);
      for (let i = 1; i < response.data.length; i++) {
        expect(response.data[i].salePrice).toBeGreaterThanOrEqual(
          response.data[i - 1].salePrice
        );
      }
    });
  });

  describe('GET /api/toys/:id', () => {
    it('should get toy details', async () => {
      const response = await api.getToy(toyId);
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(toyId);
      expect(response.data.title).toBe(testToy.title);
    });

    it('should fail with invalid ID', async () => {
      await expect(api.getToy('invalid-id')).rejects.toThrow();
    });
  });

  describe('PUT /api/toys/:id', () => {
    it('should update toy listing', async () => {
      const updatedData = { title: 'Updated LEGO Set' };
      const response = await api.updateToy(toyId, updatedData);
      
      expect(response.success).toBe(true);
      expect(response.data.title).toBe(updatedData.title);
    });
  });

  describe('DELETE /api/toys/:id', () => {
    it('should delete toy listing', async () => {
      const response = await api.deleteToy(toyId);
      
      expect(response.success).toBe(true);
    });

    it('should fail to get deleted toy', async () => {
      await expect(api.getToy(toyId)).rejects.toThrow();
    });
  });
});

describe('Cart API', () => {
  let toyId: string;

  beforeAll(async () => {
    // Create a test toy
    const toy = await api.createToy({
      title: 'Cart Test Toy',
      description: 'Test toy for cart',
      category: 'educational',
      brand: 'Test',
      condition: 'new',
      ageRange: '5-10',
      originalPrice: 1000,
      salePrice: 800,
      images: [],
    });
    toyId = toy.data.id;
  });

  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const response = await api.addToCart(toyId, 1);
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('items');
    });

    it('should update quantity if item exists', async () => {
      const response = await api.addToCart(toyId, 2);
      
      expect(response.success).toBe(true);
      const item = response.data.items.find((i: any) => i.toyId === toyId);
      expect(item.quantity).toBe(3);
    });
  });

  describe('GET /api/cart', () => {
    it('should get cart items', async () => {
      const response = await api.getCart();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data.items)).toBe(true);
    });
  });

  describe('DELETE /api/cart/:toyId', () => {
    it('should remove item from cart', async () => {
      const response = await api.removeFromCart(toyId);
      
      expect(response.success).toBe(true);
    });
  });
});

describe('Orders API', () => {
  let orderId: string;
  let toyId: string;

  beforeAll(async () => {
    // Create a test toy and add to cart
    const toy = await api.createToy({
      title: 'Order Test Toy',
      description: 'Test toy for order',
      category: 'educational',
      brand: 'Test',
      condition: 'new',
      ageRange: '5-10',
      originalPrice: 1000,
      salePrice: 800,
      images: [],
    });
    toyId = toy.data.id;
    await api.addToCart(toyId, 1);
  });

  describe('POST /api/orders', () => {
    it('should create an order', async () => {
      const orderData = {
        shippingAddress: {
          fullName: 'Test User',
          phone: '9876543210',
          addressLine1: 'Test Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        paymentMethod: 'cod',
      };

      const response = await api.createOrder(orderData);
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('orderNumber');
      
      orderId = response.data.id;
    });

    it('should fail with invalid address', async () => {
      await expect(
        api.createOrder({
          shippingAddress: { fullName: '' },
          paymentMethod: 'cod',
        })
      ).rejects.toThrow();
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      const response = await api.getOrders();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order details', async () => {
      const response = await api.getOrder(orderId);
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(orderId);
      expect(response.data).toHaveProperty('orderNumber');
    });
  });
});

describe('Messages API', () => {
  let chatId: string;
  let otherUserId: string;

  beforeAll(async () => {
    // Create another user
    const otherUser = await api.register({
      name: 'Other User',
      email: `other${Date.now()}@example.com`,
      password: 'Test@123456',
      phone: '9876543211',
    });
    otherUserId = otherUser.data.user.id;
  });

  describe('POST /api/messages', () => {
    it('should create a chat', async () => {
      const response = await api.createChat(otherUserId);
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      
      chatId = response.data.id;
    });

    it('should return existing chat if already exists', async () => {
      const response = await api.createChat(otherUserId);
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(chatId);
    });
  });

  describe('POST /api/messages/:chatId/messages', () => {
    it('should send a message', async () => {
      const response = await api.sendMessage(chatId, 'Hello!');
      
      expect(response.success).toBe(true);
      expect(response.data.content).toBe('Hello!');
    });

    it('should fail with empty message', async () => {
      await expect(api.sendMessage(chatId, '')).rejects.toThrow();
    });
  });

  describe('GET /api/messages/:chatId/messages', () => {
    it('should get chat messages', async () => {
      const response = await api.getMessages(chatId);
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/messages', () => {
    it('should get user chats', async () => {
      const response = await api.getChats();
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });
});
