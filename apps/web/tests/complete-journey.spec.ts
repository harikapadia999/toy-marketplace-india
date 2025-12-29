import { describe, it, expect, beforeAll, afterAll } from '@playwright/test';

describe('Complete User Journey E2E Tests', () => {
  let page: any;

  beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  describe('New User Registration to First Purchase', () => {
    it('should complete full user journey', async () => {
      // 1. Visit homepage
      await page.goto('http://localhost:3000');
      await expect(page).toHaveTitle(/Toy Marketplace India/);

      // 2. Register new account
      await page.click('text=Register');
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
      await page.fill('input[name="phone"]', '9876543210');
      await page.fill('input[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to home
      await page.waitForURL('http://localhost:3000');

      // 3. Browse toys
      await page.click('text=Browse Toys');
      await page.waitForSelector('[data-testid="toy-card"]');

      // 4. Search for specific toy
      await page.fill('input[placeholder*="Search"]', 'LEGO');
      await page.press('input[placeholder*="Search"]', 'Enter');
      await page.waitForSelector('[data-testid="toy-card"]');

      // 5. View toy details
      await page.click('[data-testid="toy-card"]:first-child');
      await page.waitForSelector('[data-testid="toy-details"]');

      // 6. Add to cart
      await page.click('button:has-text("Add to Cart")');
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

      // 7. Add to wishlist
      await page.click('button[aria-label="Add to wishlist"]');
      await expect(page.locator('text=Added to wishlist')).toBeVisible();

      // 8. View cart
      await page.click('[data-testid="cart-icon"]');
      await page.waitForURL(/.*\/cart/);
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

      // 9. Proceed to checkout
      await page.click('button:has-text("Proceed to Checkout")');
      await page.waitForURL(/.*\/checkout/);

      // 10. Fill shipping address
      await page.fill('input[name="fullName"]', 'Test User');
      await page.fill('input[name="addressLine1"]', '123 Test Street');
      await page.fill('input[name="city"]', 'Mumbai');
      await page.fill('input[name="state"]', 'Maharashtra');
      await page.fill('input[name="pincode"]', '400001');
      await page.click('button:has-text("Continue")');

      // 11. Select payment method
      await page.click('input[value="cod"]');
      await page.click('button:has-text("Continue")');

      // 12. Review and place order
      await page.click('button:has-text("Place Order")');
      await page.waitForURL(/.*\/order-success/);
      await expect(page.locator('text=Order Placed Successfully')).toBeVisible();

      // 13. View order details
      const orderNumber = await page.locator('[data-testid="order-number"]').textContent();
      expect(orderNumber).toBeTruthy();

      // 14. Go to profile
      await page.click('[data-testid="user-menu"]');
      await page.click('text=My Profile');
      await page.waitForURL(/.*\/profile/);

      // 15. Check orders
      await page.click('text=My Orders');
      await expect(page.locator('[data-testid="order-card"]')).toHaveCount(1);

      // 16. Leave a review
      await page.click('[data-testid="order-card"]:first-child');
      await page.click('button:has-text("Write Review")');
      await page.fill('textarea[name="comment"]', 'Great toy! My kids love it.');
      await page.click('[data-testid="star-5"]');
      await page.click('button:has-text("Submit Review")');
      await expect(page.locator('text=Review submitted')).toBeVisible();
    });
  });

  describe('Seller Journey', () => {
    it('should complete seller journey', async () => {
      // 1. Login
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'seller@example.com');
      await page.fill('input[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');

      // 2. Go to sell page
      await page.click('text=Sell');
      await page.waitForURL(/.*\/sell/);

      // 3. Fill toy details
      await page.fill('input[name="title"]', 'LEGO City Police Station');
      await page.fill('textarea[name="description"]', 'Complete LEGO set with all pieces');
      await page.selectOption('select[name="category"]', 'educational');
      await page.fill('input[name="brand"]', 'LEGO');
      await page.selectOption('select[name="condition"]', 'like-new');
      await page.click('button:has-text("Next")');

      // 4. Upload images
      await page.setInputFiles('input[type="file"]', ['test-images/toy1.jpg']);
      await page.waitForSelector('[data-testid="uploaded-image"]');
      await page.click('button:has-text("Next")');

      // 5. Set pricing
      await page.fill('input[name="originalPrice"]', '2000');
      await page.fill('input[name="salePrice"]', '1500');
      await page.click('button:has-text("Next")');

      // 6. Preview and publish
      await expect(page.locator('text=LEGO City Police Station')).toBeVisible();
      await page.click('button:has-text("Publish Listing")');
      await expect(page.locator('text=Listing published successfully')).toBeVisible();

      // 7. View my listings
      await page.click('text=My Listings');
      await expect(page.locator('[data-testid="listing-card"]')).toHaveCount(1);
    });
  });

  describe('Admin Journey', () => {
    it('should complete admin journey', async () => {
      // 1. Login as admin
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@toymarketplace.in');
      await page.fill('input[name="password"]', 'Admin@123456');
      await page.click('button[type="submit"]');

      // 2. Go to admin dashboard
      await page.click('text=Admin');
      await page.waitForURL(/.*\/admin/);

      // 3. View statistics
      await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-listings"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();

      // 4. Manage users
      await page.click('text=Users');
      await expect(page.locator('[data-testid="user-row"]')).toHaveCount.greaterThan(0);

      // 5. Manage listings
      await page.click('text=Listings');
      await expect(page.locator('[data-testid="listing-row"]')).toHaveCount.greaterThan(0);

      // 6. Approve listing
      await page.click('[data-testid="listing-row"]:first-child button:has-text("Approve")');
      await expect(page.locator('text=Listing approved')).toBeVisible();

      // 7. View reports
      await page.click('text=Reports');
      await expect(page.locator('[data-testid="report-row"]')).toBeVisible();

      // 8. Resolve report
      await page.click('[data-testid="report-row"]:first-child button:has-text("Resolve")');
      await page.fill('textarea[name="resolution"]', 'Issue resolved');
      await page.click('button:has-text("Submit")');
      await expect(page.locator('text=Report resolved')).toBeVisible();
    });
  });

  describe('Messaging Journey', () => {
    it('should complete messaging journey', async () => {
      // 1. Login as buyer
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'buyer@example.com');
      await page.fill('input[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');

      // 2. View toy
      await page.goto('http://localhost:3000/toys/toy-id');

      // 3. Contact seller
      await page.click('button:has-text("Contact Seller")');
      await page.waitForSelector('[data-testid="message-input"]');

      // 4. Send message
      await page.fill('[data-testid="message-input"]', 'Is this toy still available?');
      await page.click('button:has-text("Send")');
      await expect(page.locator('text=Is this toy still available?')).toBeVisible();

      // 5. Wait for response (simulated)
      await page.waitForTimeout(2000);

      // 6. View all messages
      await page.click('text=Messages');
      await page.waitForURL(/.*\/messages/);
      await expect(page.locator('[data-testid="chat-item"]')).toHaveCount.greaterThan(0);
    });
  });

  describe('Coupon Journey', () => {
    it('should apply coupon successfully', async () => {
      // 1. Add item to cart
      await page.goto('http://localhost:3000/toys');
      await page.click('[data-testid="toy-card"]:first-child');
      await page.click('button:has-text("Add to Cart")');

      // 2. Go to cart
      await page.click('[data-testid="cart-icon"]');

      // 3. Apply coupon
      await page.fill('input[placeholder*="coupon"]', 'WELCOME10');
      await page.click('button:has-text("Apply")');
      await expect(page.locator('text=Coupon applied')).toBeVisible();

      // 4. Verify discount
      const discount = await page.locator('[data-testid="discount-amount"]').textContent();
      expect(parseFloat(discount!)).toBeGreaterThan(0);
    });
  });

  describe('Referral Journey', () => {
    it('should complete referral journey', async () => {
      // 1. Login
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');

      // 2. Get referral code
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Referrals');
      await page.waitForURL(/.*\/referrals/);

      // 3. Copy referral link
      const referralLink = await page.locator('[data-testid="referral-link"]').textContent();
      expect(referralLink).toContain('ref=');

      // 4. View referral stats
      await expect(page.locator('[data-testid="total-referrals"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-rewards"]')).toBeVisible();
    });
  });

  describe('Notification Journey', () => {
    it('should receive and manage notifications', async () => {
      // 1. Login
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');

      // 2. Check notifications
      await page.click('[data-testid="notifications-icon"]');
      await expect(page.locator('[data-testid="notification-item"]')).toBeVisible();

      // 3. Mark as read
      await page.click('[data-testid="notification-item"]:first-child');
      await expect(page.locator('[data-testid="notification-item"]:first-child')).toHaveClass(/read/);

      // 4. Mark all as read
      await page.click('button:has-text("Mark all as read")');
      await expect(page.locator('[data-testid="unread-count"]')).toHaveText('0');
    });
  });

  describe('Saved Search Journey', () => {
    it('should save and manage searches', async () => {
      // 1. Login
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');

      // 2. Search for toys
      await page.goto('http://localhost:3000/toys');
      await page.fill('input[placeholder*="Search"]', 'LEGO');
      await page.selectOption('select[name="category"]', 'educational');
      await page.click('button:has-text("Search")');

      // 3. Save search
      await page.click('button:has-text("Save Search")');
      await page.fill('input[name="searchName"]', 'LEGO Educational Toys');
      await page.click('input[name="notifyOnNew"]');
      await page.click('button:has-text("Save")');
      await expect(page.locator('text=Search saved')).toBeVisible();

      // 4. View saved searches
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Saved Searches');
      await expect(page.locator('text=LEGO Educational Toys')).toBeVisible();
    });
  });
});
