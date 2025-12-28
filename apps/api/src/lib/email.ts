import { Resend } from 'resend';
import { logInfo, logError } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@toymarketplace.in';

// Email templates
const templates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Toy Marketplace India! 🧸',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to Toy Marketplace India!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining Toy Marketplace India - your trusted platform for buying and selling pre-loved toys.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Browse thousands of quality toys</li>
          <li>List your toys for sale</li>
          <li>Connect with buyers and sellers</li>
          <li>Track your orders</li>
        </ul>
        <p>Happy shopping!</p>
        <p>Best regards,<br>Team Toy Marketplace India</p>
      </div>
    `,
  }),

  orderConfirmation: (name: string, orderNumber: string, totalAmount: number) => ({
    subject: `Order Confirmed - ${orderNumber} 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Order Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your order has been confirmed and is being processed.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <p>You can track your order status in your profile.</p>
        <p>Thank you for shopping with us!</p>
        <p>Best regards,<br>Team Toy Marketplace India</p>
      </div>
    `,
  }),

  orderShipped: (name: string, orderNumber: string, trackingNumber?: string) => ({
    subject: `Order Shipped - ${orderNumber} 📦`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Your Order is on the Way!</h1>
        <p>Hi ${name},</p>
        <p>Great news! Your order has been shipped.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
        </div>
        <p>Your order should arrive within 3-5 business days.</p>
        <p>Best regards,<br>Team Toy Marketplace India</p>
      </div>
    `,
  }),

  orderDelivered: (name: string, orderNumber: string) => ({
    subject: `Order Delivered - ${orderNumber} ✅`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Order Delivered!</h1>
        <p>Hi ${name},</p>
        <p>Your order has been successfully delivered.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
        </div>
        <p>We hope you love your purchase! Please leave a review to help other buyers.</p>
        <p>Best regards,<br>Team Toy Marketplace India</p>
      </div>
    `,
  }),

  newMessage: (name: string, senderName: string, message: string) => ({
    subject: `New Message from ${senderName} 💬`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">You have a new message!</h1>
        <p>Hi ${name},</p>
        <p><strong>${senderName}</strong> sent you a message:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>${message}</p>
        </div>
        <p>Reply to continue the conversation.</p>
        <p>Best regards,<br>Team Toy Marketplace India</p>
      </div>
    `,
  }),

  listingApproved: (name: string, toyTitle: string) => ({
    subject: `Listing Approved - ${toyTitle} ✅`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Listing Approved!</h1>
        <p>Hi ${name},</p>
        <p>Your toy listing has been approved and is now live on the marketplace.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Toy:</strong> ${toyTitle}</p>
        </div>
        <p>Buyers can now see and purchase your toy. Good luck with your sale!</p>
        <p>Best regards,<br>Team Toy Marketplace India</p>
      </div>
    `,
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Reset Your Password 🔐',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Team Toy Marketplace India</p>
      </div>
    `,
  }),
};

// Send email function
export async function sendEmail(
  to: string,
  template: keyof typeof templates,
  data: any
) {
  try {
    const emailTemplate = templates[template](...Object.values(data));

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    logInfo('Email sent successfully', {
      to,
      template,
      messageId: result.data?.id,
    });

    return { success: true, data: result.data };
  } catch (error: any) {
    logError('Send email error', error, { to, template });
    return { success: false, error: error.message };
  }
}

// Bulk email function
export async function sendBulkEmail(
  recipients: string[],
  template: keyof typeof templates,
  data: any
) {
  try {
    const emailTemplate = templates[template](...Object.values(data));

    const promises = recipients.map((to) =>
      resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
    );

    const results = await Promise.allSettled(promises);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    logInfo('Bulk email sent', {
      template,
      total: recipients.length,
      successful,
      failed,
    });

    return { success: true, successful, failed };
  } catch (error: any) {
    logError('Send bulk email error', error, { template });
    return { success: false, error: error.message };
  }
}

// Email verification
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  return sendEmail(email, 'welcome', { name });
}

// Order emails
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  totalAmount: number
) {
  return sendEmail(email, 'orderConfirmation', { name, orderNumber, totalAmount });
}

export async function sendOrderShippedEmail(
  email: string,
  name: string,
  orderNumber: string,
  trackingNumber?: string
) {
  return sendEmail(email, 'orderShipped', { name, orderNumber, trackingNumber });
}

export async function sendOrderDeliveredEmail(
  email: string,
  name: string,
  orderNumber: string
) {
  return sendEmail(email, 'orderDelivered', { name, orderNumber });
}

// Message notification
export async function sendNewMessageEmail(
  email: string,
  name: string,
  senderName: string,
  message: string
) {
  return sendEmail(email, 'newMessage', { name, senderName, message });
}

// Listing notification
export async function sendListingApprovedEmail(
  email: string,
  name: string,
  toyTitle: string
) {
  return sendEmail(email, 'listingApproved', { name, toyTitle });
}

// Password reset
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  return sendEmail(email, 'passwordReset', { name, resetLink });
}
