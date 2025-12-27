import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="password"]', 'Test@123456');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@123456');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout user', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button:has-text("Profile")');
    await page.click('button:has-text("Logout")');
    
    await expect(page).toHaveURL('/auth/login');
  });
});

test.describe('Toy Browsing', () => {
  test('should display toys on homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Featured Toys')).toBeVisible();
    await expect(page.locator('[data-testid="toy-card"]')).toHaveCount(10);
  });

  test('should search for toys', async ({ page }) => {
    await page.goto('/toys');
    
    await page.fill('input[placeholder*="Search"]', 'LEGO');
    await page.press('input[placeholder*="Search"]', 'Enter');
    
    await expect(page).toHaveURL(/search=LEGO/);
    
    const toyCards = page.locator('[data-testid="toy-card"]');
    await expect(toyCards.first()).toContainText('LEGO');
  });

  test('should filter toys by category', async ({ page }) => {
    await page.goto('/toys');
    
    await page.click('button:has-text("Educational")');
    
    await expect(page).toHaveURL(/category=educational/);
    
    const toyCards = page.locator('[data-testid="toy-card"]');
    await expect(toyCards).toHaveCount.greaterThan(0);
  });

  test('should filter toys by price range', async ({ page }) => {
    await page.goto('/toys');
    
    await page.fill('input[name="minPrice"]', '500');
    await page.fill('input[name="maxPrice"]', '2000');
    await page.click('button:has-text("Apply Filters")');
    
    await expect(page).toHaveURL(/minPrice=500.*maxPrice=2000/);
  });

  test('should sort toys by price', async ({ page }) => {
    await page.goto('/toys');
    
    await page.selectOption('select[name="sort"]', 'price_asc');
    
    await expect(page).toHaveURL(/sort=price_asc/);
  });

  test('should view toy details', async ({ page }) => {
    await page.goto('/toys');
    
    await page.click('[data-testid="toy-card"]');
    
    await expect(page).toHaveURL(/\/toys\/[a-z0-9-]+/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
  });
});

test.describe('Shopping Cart', () => {
  test('should add toy to cart', async ({ page }) => {
    await page.goto('/toys');
    
    await page.click('[data-testid="toy-card"]');
    await page.click('button:has-text("Add to Cart")');
    
    await expect(page.locator('text=Added to cart')).toBeVisible();
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');
  });

  test('should view cart', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="cart-button"]');
    
    await expect(page).toHaveURL('/cart');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount.greaterThan(0);
  });

  test('should update quantity in cart', async ({ page }) => {
    await page.goto('/cart');
    
    const quantityInput = page.locator('input[name="quantity"]').first();
    await quantityInput.fill('2');
    
    await expect(page.locator('text=Total')).toContainText('₹');
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/cart');
    
    const initialCount = await page.locator('[data-testid="cart-item"]').count();
    
    await page.click('button[aria-label="Remove"]');
    
    const newCount = await page.locator('[data-testid="cart-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should proceed to checkout', async ({ page }) => {
    await page.goto('/cart');
    
    await page.click('button:has-text("Proceed to Checkout")');
    
    await expect(page).toHaveURL('/checkout');
  });
});

test.describe('Checkout Flow', () => {
  test('should complete checkout', async ({ page }) => {
    await page.goto('/checkout');
    
    // Step 1: Address
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="addressLine1"]', 'Test Address');
    await page.fill('input[name="city"]', 'Mumbai');
    await page.fill('input[name="state"]', 'Maharashtra');
    await page.fill('input[name="pincode"]', '400001');
    await page.click('button:has-text("Continue")');
    
    // Step 2: Payment
    await page.click('input[value="cod"]');
    await page.click('button:has-text("Review Order")');
    
    // Step 3: Review
    await expect(page.locator('text=Order Summary')).toBeVisible();
    await page.click('button:has-text("Place Order")');
    
    await expect(page).toHaveURL(/\/orders\/[a-z0-9-]+/);
    await expect(page.locator('text=Order placed successfully')).toBeVisible();
  });

  test('should validate address fields', async ({ page }) => {
    await page.goto('/checkout');
    
    await page.click('button:has-text("Continue")');
    
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Phone is required')).toBeVisible();
  });
});

test.describe('Sell Toy Flow', () => {
  test('should create toy listing', async ({ page }) => {
    await page.goto('/sell');
    
    // Step 1: Basic Info
    await page.fill('input[name="title"]', 'Test LEGO Set');
    await page.fill('textarea[name="description"]', 'A test LEGO building set');
    await page.selectOption('select[name="category"]', 'educational');
    await page.fill('input[name="brand"]', 'LEGO');
    await page.click('button:has-text("Continue")');
    
    // Step 2: Images
    await page.setInputFiles('input[type="file"]', 'test-image.jpg');
    await page.click('button:has-text("Continue")');
    
    // Step 3: Pricing
    await page.fill('input[name="originalPrice"]', '2000');
    await page.fill('input[name="salePrice"]', '1500');
    await page.click('button:has-text("Preview")');
    
    // Step 4: Preview
    await expect(page.locator('text=Test LEGO Set')).toBeVisible();
    await page.click('button:has-text("Publish")');
    
    await expect(page.locator('text=Listing published successfully')).toBeVisible();
  });
});

test.describe('Messaging', () => {
  test('should send message to seller', async ({ page }) => {
    await page.goto('/toys');
    
    await page.click('[data-testid="toy-card"]');
    await page.click('button:has-text("Contact Seller")');
    
    await expect(page).toHaveURL(/\/messages\/[a-z0-9-]+/);
    
    await page.fill('input[placeholder*="Type a message"]', 'Is this toy still available?');
    await page.click('button[aria-label="Send"]');
    
    await expect(page.locator('text=Is this toy still available?')).toBeVisible();
  });

  test('should view all conversations', async ({ page }) => {
    await page.goto('/messages');
    
    await expect(page.locator('[data-testid="chat-item"]')).toHaveCount.greaterThan(0);
  });

  test('should search conversations', async ({ page }) => {
    await page.goto('/messages');
    
    await page.fill('input[placeholder*="Search"]', 'Seller');
    
    const chatItems = page.locator('[data-testid="chat-item"]');
    await expect(chatItems.first()).toContainText('Seller');
  });
});

test.describe('Profile Management', () => {
  test('should view profile', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('text=My Listings')).toBeVisible();
    await expect(page.locator('text=My Orders')).toBeVisible();
  });

  test('should edit profile', async ({ page }) => {
    await page.goto('/profile');
    
    await page.click('button:has-text("Edit Profile")');
    
    await page.fill('input[name="name"]', 'Updated Name');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

  test('should view my listings', async ({ page }) => {
    await page.goto('/profile');
    
    await page.click('text=My Listings');
    
    await expect(page.locator('[data-testid="listing-card"]')).toHaveCount.greaterThan(0);
  });

  test('should view order history', async ({ page }) => {
    await page.goto('/profile');
    
    await page.click('text=My Orders');
    
    await expect(page.locator('[data-testid="order-card"]')).toHaveCount.greaterThan(0);
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile menu', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button[aria-label="Menu"]');
    
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate on mobile', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button[aria-label="Menu"]');
    await page.click('text=Toys');
    
    await expect(page).toHaveURL('/toys');
  });
});

test.describe('Performance', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load images lazily', async ({ page }) => {
    await page.goto('/toys');
    
    const images = page.locator('img[loading="lazy"]');
    await expect(images).toHaveCount.greaterThan(0);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/toys');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate to focused element
  });
});
