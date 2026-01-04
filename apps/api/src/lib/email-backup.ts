import nodemailer from 'nodemailer';
import { logInfo, logError } from './logger';

// Backup email service using Nodemailer (fallback for Resend)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendBackupEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@toymarketplace.in',
      to,
      subject,
      html,
    });

    logInfo('Backup email sent', { to, messageId: info.messageId });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    logError('Backup email error', error);
    return { success: false, error: error.message };
  }
};

// Email queue for batch processing
interface EmailJob {
  to: string;
  subject: string;
  html: string;
  priority: 'high' | 'normal' | 'low';
  retries: number;
}

class EmailQueue {
  private queue: EmailJob[] = [];
  private processing = false;
  private maxRetries = 3;

  add(job: Omit<EmailJob, 'retries'>) {
    this.queue.push({ ...job, retries: 0 });
    this.process();
  }

  private async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      // Sort by priority
      this.queue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      const job = this.queue.shift()!;

      try {
        await sendBackupEmail(job.to, job.subject, job.html);
        logInfo('Email job completed', { to: job.to });
      } catch (error) {
        logError('Email job failed', error);

        // Retry logic
        if (job.retries < this.maxRetries) {
          job.retries++;
          this.queue.push(job);
          logInfo('Email job retrying', { to: job.to, retries: job.retries });
        } else {
          logError('Email job failed permanently', { to: job.to });
        }
      }

      // Wait between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  getQueueLength() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
  }
}

export const emailQueue = new EmailQueue();

// Email templates with better formatting
export const emailTemplates = {
  orderConfirmation: (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>Thank you for your order! We're excited to get your toys to you.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${data.amount}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          </div>

          <p>We'll send you another email when your order ships.</p>
          
          <a href="${process.env.FRONTEND_URL}/orders/${data.orderNumber}" class="button">
            Track Your Order
          </a>
        </div>
        <div class="footer">
          <p>© 2024 Toy Marketplace India. All rights reserved.</p>
          <p>Questions? Contact us at support@toymarketplace.in</p>
        </div>
      </div>
    </body>
    </html>
  `,

  orderShipped: (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .tracking-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>Great news! Your order is on its way.</p>
          
          <div class="tracking-info">
            <h3>Tracking Information</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
          </div>

          <a href="${process.env.FRONTEND_URL}/track/${data.trackingNumber}" class="button">
            Track Package
          </a>
        </div>
        <div class="footer">
          <p>© 2024 Toy Marketplace India. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .reset-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .code { font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #EF4444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>We received a request to reset your password. Use the code below:</p>
          
          <div class="reset-box">
            <p class="code">${data.resetCode}</p>
            <p>This code expires in 15 minutes.</p>
          </div>

          <p>If you didn't request this, please ignore this email.</p>
          
          <a href="${process.env.FRONTEND_URL}/reset-password?code=${data.resetCode}" class="button">
            Reset Password
          </a>
        </div>
        <div class="footer">
          <p>© 2024 Toy Marketplace India. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};
