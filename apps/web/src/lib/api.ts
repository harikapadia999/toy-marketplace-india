import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.post<{ token: string; user: any }>(
      '/auth/login',
      { email, password }
    );
    this.setToken(response.token);
    return response;
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const response = await this.post<{ token: string; user: any }>(
      '/auth/register',
      data
    );
    this.setToken(response.token);
    return response;
  }

  async logout() {
    this.clearToken();
  }

  // Toy methods
  async getToys(params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    location?: string;
    search?: string;
  }) {
    return this.get<{
      toys: any[];
      total: number;
      page: number;
      totalPages: number;
    }>('/toys', { params });
  }

  async getToy(id: string) {
    return this.get<any>(`/toys/${id}`);
  }

  async createToy(data: FormData) {
    return this.post<any>('/toys', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateToy(id: string, data: any) {
    return this.put<any>(`/toys/${id}`, data);
  }

  async deleteToy(id: string) {
    return this.delete<any>(`/toys/${id}`);
  }

  // User methods
  async getProfile() {
    return this.get<any>('/users/profile');
  }

  async updateProfile(data: any) {
    return this.put<any>('/users/profile', data);
  }

  // Order methods
  async createOrder(data: any) {
    return this.post<any>('/orders', data);
  }

  async getOrders() {
    return this.get<any[]>('/orders');
  }

  async getOrder(id: string) {
    return this.get<any>(`/orders/${id}`);
  }

  // Wishlist methods
  async addToWishlist(toyId: string) {
    return this.post<any>('/wishlist', { toyId });
  }

  async removeFromWishlist(toyId: string) {
    return this.delete<any>(`/wishlist/${toyId}`);
  }

  async getWishlist() {
    return this.get<any[]>('/wishlist');
  }

  // Cart methods
  async addToCart(toyId: string, quantity: number = 1) {
    return this.post<any>('/cart', { toyId, quantity });
  }

  async removeFromCart(toyId: string) {
    return this.delete<any>(`/cart/${toyId}`);
  }

  async getCart() {
    return this.get<any>('/cart');
  }

  async updateCartItem(toyId: string, quantity: number) {
    return this.put<any>(`/cart/${toyId}`, { quantity });
  }

  // Review methods
  async createReview(toyId: string, data: { rating: number; comment: string }) {
    return this.post<any>(`/toys/${toyId}/reviews`, data);
  }

  async getReviews(toyId: string) {
    return this.get<any[]>(`/toys/${toyId}/reviews`);
  }

  // Message methods
  async sendMessage(recipientId: string, message: string) {
    return this.post<any>('/messages', { recipientId, message });
  }

  async getMessages(userId: string) {
    return this.get<any[]>(`/messages/${userId}`);
  }

  async getConversations() {
    return this.get<any[]>('/messages/conversations');
  }
}

export const api = new ApiClient();
