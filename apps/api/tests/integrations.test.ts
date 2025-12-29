import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sendEmail, sendOrderConfirmationEmail, sendOrderShippedEmail } from '../lib/email';
import { sendSMS, sendOrderConfirmationSMS, sendOTP, verifyOTP } from '../lib/sms';
import { uploadImage, deleteImage, generateThumbnail } from '../lib/cloudinary';

describe('Email Service', () => {
  describe('Send Email', () => {
    it('should send welcome email', async () => {
      const result = await sendEmail(
        'test@example.com',
        'welcome',
        { name: 'Test User' }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });

    it('should send order confirmation email', async () => {
      const result = await sendOrderConfirmationEmail(
        'test@example.com',
        'John Doe',
        'ORD-12345',
        1500
      );

      expect(result.success).toBe(true);
    });

    it('should send order shipped email', async () => {
      const result = await sendOrderShippedEmail(
        'test@example.com',
        'John Doe',
        'ORD-12345',
        'TRACK-67890'
      );

      expect(result.success).toBe(true);
    });

    it('should handle invalid email', async () => {
      const result = await sendEmail(
        'invalid-email',
        'welcome',
        { name: 'Test' }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Email Templates', () => {
    it('should have welcome template', () => {
      const templates = require('../lib/email').templates;
      expect(templates).toHaveProperty('welcome');
    });

    it('should have order confirmation template', () => {
      const templates = require('../lib/email').templates;
      expect(templates).toHaveProperty('orderConfirmation');
    });

    it('should have order shipped template', () => {
      const templates = require('../lib/email').templates;
      expect(templates).toHaveProperty('orderShipped');
    });

    it('should have order delivered template', () => {
      const templates = require('../lib/email').templates;
      expect(templates).toHaveProperty('orderDelivered');
    });

    it('should have new message template', () => {
      const templates = require('../lib/email').templates;
      expect(templates).toHaveProperty('newMessage');
    });

    it('should have listing approved template', () => {
      const templates = require('../lib/email').templates;
      expect(templates).toHaveProperty('listingApproved');
    });

    it('should have password reset template', () => {
      const templates = require('../lib/email').templates;
      expect(templates).toHaveProperty('passwordReset');
    });
  });

  describe('Bulk Email', () => {
    it('should send bulk emails', async () => {
      const recipients = [
        'test1@example.com',
        'test2@example.com',
        'test3@example.com',
      ];

      const result = await sendBulkEmail(
        recipients,
        'welcome',
        { name: 'Test User' }
      );

      expect(result.success).toBe(true);
      expect(result.successful).toBeGreaterThan(0);
    });
  });
});

describe('SMS Service', () => {
  describe('Send SMS', () => {
    it('should send OTP SMS', async () => {
      const result = await sendOTP('9876543210', '123456');

      expect(result.success).toBe(true);
    });

    it('should send order confirmation SMS', async () => {
      const result = await sendOrderConfirmationSMS('9876543210', 'ORD-12345');

      expect(result.success).toBe(true);
    });

    it('should format phone number correctly', async () => {
      const result = await sendSMS(
        '+919876543210',
        'otp',
        { otp: '123456' }
      );

      expect(result.success).toBe(true);
    });

    it('should handle invalid phone number', async () => {
      const result = await sendSMS(
        'invalid',
        'otp',
        { otp: '123456' }
      );

      expect(result.success).toBe(false);
    });
  });

  describe('OTP Verification', () => {
    it('should verify correct OTP', async () => {
      const phone = '9876543210';
      const otp = '123456';

      await sendOTP(phone, otp);
      const result = await verifyOTP(phone, otp);

      expect(result.success).toBe(true);
    });

    it('should reject incorrect OTP', async () => {
      const phone = '9876543210';
      
      const result = await verifyOTP(phone, 'wrong-otp');

      expect(result.success).toBe(false);
    });
  });

  describe('SMS Templates', () => {
    it('should have OTP template', () => {
      const templates = require('../lib/sms').templates;
      expect(templates).toHaveProperty('otp');
    });

    it('should have order confirmation template', () => {
      const templates = require('../lib/sms').templates;
      expect(templates).toHaveProperty('orderConfirmation');
    });

    it('should have order shipped template', () => {
      const templates = require('../lib/sms').templates;
      expect(templates).toHaveProperty('orderShipped');
    });
  });

  describe('Bulk SMS', () => {
    it('should send bulk SMS', async () => {
      const phones = ['9876543210', '9876543211', '9876543212'];

      const result = await sendBulkSMS(
        phones,
        'orderConfirmation',
        { orderNumber: 'ORD-12345' }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('SMS Balance', () => {
    it('should check SMS balance', async () => {
      const result = await checkSMSBalance();

      expect(result.success).toBe(true);
      expect(result.balance).toBeDefined();
    });
  });
});

describe('Cloudinary Service', () => {
  let uploadedImageId: string;

  describe('Image Upload', () => {
    it('should upload image', async () => {
      const result = await uploadImage(
        'https://example.com/test-image.jpg',
        { folder: 'test' }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('public_id');
      expect(result.data).toHaveProperty('url');

      uploadedImageId = result.data.public_id;
    });

    it('should upload with transformation', async () => {
      const result = await uploadImage(
        'https://example.com/test-image.jpg',
        {
          folder: 'test',
          transformation: [
            { width: 500, height: 500, crop: 'fill' },
          ],
        }
      );

      expect(result.success).toBe(true);
    });

    it('should upload multiple images', async () => {
      const files = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      const result = await uploadMultipleImages(files, { folder: 'test' });

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('Image Transformation', () => {
    it('should generate thumbnail', () => {
      const url = generateThumbnail('test/image', 200);

      expect(url).toContain('w_200');
      expect(url).toContain('h_200');
      expect(url).toContain('c_fill');
    });

    it('should generate responsive images', () => {
      const urls = generateResponsiveImages('test/image');

      expect(urls).toHaveLength(6); // 320, 640, 768, 1024, 1280, 1920
      expect(urls[0].size).toBe(320);
      expect(urls[5].size).toBe(1920);
    });

    it('should generate custom transformation URL', () => {
      const url = generateImageUrl('test/image', {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 80,
      });

      expect(url).toContain('w_800');
      expect(url).toContain('h_600');
      expect(url).toContain('c_fill');
    });
  });

  describe('Image Management', () => {
    it('should get image details', async () => {
      if (!uploadedImageId) return;

      const result = await getImageDetails(uploadedImageId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('public_id');
      expect(result.data).toHaveProperty('format');
      expect(result.data).toHaveProperty('width');
      expect(result.data).toHaveProperty('height');
    });

    it('should search images', async () => {
      const result = await searchImages('folder:test', 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('resources');
    });

    it('should delete image', async () => {
      if (!uploadedImageId) return;

      const result = await deleteImage(uploadedImageId);

      expect(result.success).toBe(true);
    });

    it('should delete multiple images', async () => {
      const publicIds = ['test/image1', 'test/image2'];

      const result = await deleteMultipleImages(publicIds);

      expect(result.success).toBe(true);
    });
  });

  describe('Folder Management', () => {
    it('should create folder', async () => {
      const result = await createFolder('test/subfolder');

      expect(result.success).toBe(true);
    });

    it('should get folder contents', async () => {
      const result = await getFolderContents('test');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('resources');
    });

    it('should delete folder', async () => {
      const result = await deleteFolder('test/subfolder');

      expect(result.success).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  describe('Order Flow Communication', () => {
    it('should send all order notifications', async () => {
      const email = 'test@example.com';
      const phone = '9876543210';
      const name = 'John Doe';
      const orderNumber = 'ORD-TEST-123';

      // Order confirmation
      const emailResult1 = await sendOrderConfirmationEmail(email, name, orderNumber, 1500);
      const smsResult1 = await sendOrderConfirmationSMS(phone, orderNumber);

      expect(emailResult1.success).toBe(true);
      expect(smsResult1.success).toBe(true);

      // Order shipped
      const emailResult2 = await sendOrderShippedEmail(email, name, orderNumber, 'TRACK-123');
      const smsResult2 = await sendOrderShippedSMS(phone, orderNumber);

      expect(emailResult2.success).toBe(true);
      expect(smsResult2.success).toBe(true);

      // Order delivered
      const emailResult3 = await sendOrderDeliveredEmail(email, name, orderNumber);
      const smsResult3 = await sendOrderDeliveredSMS(phone, orderNumber);

      expect(emailResult3.success).toBe(true);
      expect(smsResult3.success).toBe(true);
    });
  });

  describe('Image Upload Flow', () => {
    it('should upload, transform, and delete image', async () => {
      // Upload
      const uploadResult = await uploadImage(
        'https://example.com/test.jpg',
        { folder: 'test-flow' }
      );

      expect(uploadResult.success).toBe(true);
      const publicId = uploadResult.data.public_id;

      // Generate thumbnail
      const thumbnailUrl = generateThumbnail(publicId, 150);
      expect(thumbnailUrl).toContain(publicId);

      // Delete
      const deleteResult = await deleteImage(publicId);
      expect(deleteResult.success).toBe(true);
    });
  });
});
