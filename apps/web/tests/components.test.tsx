import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/app/auth/login/page';
import RegisterPage from '@/app/auth/register/page';
import HomePage from '@/app/page';
import ToysPage from '@/app/toys/page';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Login Page', () => {
  it('should render login form', () => {
    render(<LoginPage />, { wrapper });
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginPage />, { wrapper });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid email', async () => {
    render(<LoginPage />, { wrapper });
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    render(<LoginPage />, { wrapper });
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

describe('Register Page', () => {
  it('should render registration form', () => {
    render(<RegisterPage />, { wrapper });
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should validate phone number format', async () => {
    render(<RegisterPage />, { wrapper });
    
    const phoneInput = screen.getByLabelText(/phone/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
    });
  });

  it('should validate password strength', async () => {
    render(<RegisterPage />, { wrapper });
    
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
});

describe('Home Page', () => {
  it('should render hero section', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText(/find your perfect toy/i)).toBeInTheDocument();
  });

  it('should render categories', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText(/educational/i)).toBeInTheDocument();
    expect(screen.getByText(/outdoor/i)).toBeInTheDocument();
    expect(screen.getByText(/arts/i)).toBeInTheDocument();
  });

  it('should render featured toys section', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText(/featured toys/i)).toBeInTheDocument();
  });

  it('should navigate to toys page on category click', () => {
    render(<HomePage />, { wrapper });
    
    const categoryButton = screen.getByText(/educational/i);
    expect(categoryButton).toHaveAttribute('href', '/toys?category=educational');
  });
});

describe('Toys Page', () => {
  it('should render search bar', () => {
    render(<ToysPage />, { wrapper });
    
    expect(screen.getByPlaceholderText(/search toys/i)).toBeInTheDocument();
  });

  it('should render filters', () => {
    render(<ToysPage />, { wrapper });
    
    expect(screen.getByText(/category/i)).toBeInTheDocument();
    expect(screen.getByText(/condition/i)).toBeInTheDocument();
    expect(screen.getByText(/price range/i)).toBeInTheDocument();
  });

  it('should update search query on input', () => {
    render(<ToysPage />, { wrapper });
    
    const searchInput = screen.getByPlaceholderText(/search toys/i);
    fireEvent.change(searchInput, { target: { value: 'LEGO' } });
    
    expect(searchInput).toHaveValue('LEGO');
  });

  it('should toggle view mode', () => {
    render(<ToysPage />, { wrapper });
    
    const gridButton = screen.getByRole('button', { name: /grid view/i });
    const listButton = screen.getByRole('button', { name: /list view/i });
    
    fireEvent.click(listButton);
    expect(listButton).toHaveClass('active');
    
    fireEvent.click(gridButton);
    expect(gridButton).toHaveClass('active');
  });
});

describe('Cart Store', () => {
  it('should add item to cart', () => {
    const { addItem, items } = useCartStore.getState();
    
    addItem({
      id: '1',
      toyId: 'toy-1',
      title: 'Test Toy',
      price: 1000,
      originalPrice: 1500,
      image: 'test.jpg',
      seller: { id: 'seller-1', name: 'Seller' },
    });
    
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it('should update quantity if item exists', () => {
    const { addItem, items } = useCartStore.getState();
    
    addItem({
      id: '1',
      toyId: 'toy-1',
      title: 'Test Toy',
      price: 1000,
      originalPrice: 1500,
      image: 'test.jpg',
      seller: { id: 'seller-1', name: 'Seller' },
    });
    
    expect(items[0].quantity).toBe(2);
  });

  it('should remove item from cart', () => {
    const { removeItem, items } = useCartStore.getState();
    
    removeItem('toy-1');
    
    expect(items).toHaveLength(0);
  });

  it('should calculate total price', () => {
    const { addItem, getTotalPrice } = useCartStore.getState();
    
    addItem({
      id: '1',
      toyId: 'toy-1',
      title: 'Test Toy',
      price: 1000,
      originalPrice: 1500,
      image: 'test.jpg',
      seller: { id: 'seller-1', name: 'Seller' },
    });
    
    expect(getTotalPrice()).toBe(1000);
  });

  it('should calculate total savings', () => {
    const { getTotalSavings } = useCartStore.getState();
    
    expect(getTotalSavings()).toBe(500);
  });
});

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('should format price in Indian Rupees', () => {
      expect(formatPrice(1000)).toBe('₹1,000');
      expect(formatPrice(10000)).toBe('₹10,000');
      expect(formatPrice(100000)).toBe('₹1,00,000');
    });
  });

  describe('formatDate', () => {
    it('should format date in Indian format', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toMatch(/15.*Jan.*2024/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount percentage', () => {
      expect(calculateDiscount(1500, 1000)).toBe(33);
      expect(calculateDiscount(2000, 1000)).toBe(50);
    });
  });

  describe('slugify', () => {
    it('should convert string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test Toy 123')).toBe('test-toy-123');
    });
  });
});
