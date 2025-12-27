import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      await SecureStore.setItemAsync('token', response.data.token);
    }
    return response.data;
  },

  register: async (data: any) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.token) {
      await SecureStore.setItemAsync('token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
  },

  // Toys
  getToys: async (params?: any) => {
    const response = await apiClient.get('/toys', { params });
    return response.data;
  },

  getToy: async (id: string) => {
    const response = await apiClient.get(`/toys/${id}`);
    return response.data;
  },

  getFeaturedToys: async () => {
    const response = await apiClient.get('/toys?featured=true&limit=10');
    return response.data;
  },

  createToy: async (data: any) => {
    const response = await apiClient.post('/toys', data);
    return response.data;
  },

  // Cart
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  addToCart: async (toyId: string, quantity: number) => {
    const response = await apiClient.post('/cart', { toyId, quantity });
    return response.data;
  },

  // Orders
  createOrder: async (data: any) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Messages
  getChats: async () => {
    const response = await apiClient.get('/messages');
    return response.data;
  },

  getMessages: async (chatId: string) => {
    const response = await apiClient.get(`/messages/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, content: string) => {
    const response = await apiClient.post(`/messages/${chatId}/messages`, { content });
    return response.data;
  },

  // User
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },
};
