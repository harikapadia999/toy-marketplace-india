import twilio from 'twilio';
import { logInfo, logError } from './logger';

// Backup SMS service using Twilio (fallback for MSG91)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendBackupSMS = async (
  phone: string,
  message: string
) => {
  try {
    // Format phone number for India
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    logInfo('Backup SMS sent', { phone: formattedPhone, sid: result.sid });

    return { success: true, sid: result.sid };
  } catch (error: any) {
    logError('Backup SMS error', error);
    return { success: false, error: error.message };
  }
};

// SMS queue for batch processing
interface SMSJob {
  phone: string;
  message: string;
  priority: 'high' | 'normal' | 'low';
  retries: number;
}

class SMSQueue {
  private queue: SMSJob[] = [];
  private processing = false;
  private maxRetries = 3;

  add(job: Omit<SMSJob, 'retries'>) {
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
        await sendBackupSMS(job.phone, job.message);
        logInfo('SMS job completed', { phone: job.phone });
      } catch (error) {
        logError('SMS job failed', error);

        // Retry logic
        if (job.retries < this.maxRetries) {
          job.retries++;
          this.queue.push(job);
          logInfo('SMS job retrying', { phone: job.phone, retries: job.retries });
        } else {
          logError('SMS job failed permanently', { phone: job.phone });
        }
      }

      // Wait between SMS to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
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

export const smsQueue = new SMSQueue();

// Enhanced SMS templates
export const smsTemplates = {
  otp: (otp: string) => 
    `Your Toy Marketplace India OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,

  orderConfirmation: (orderNumber: string, amount: number) =>
    `Order ${orderNumber} confirmed! Amount: ₹${amount}. Track at toymarketplace.in/orders/${orderNumber}`,

  orderShipped: (orderNumber: string, trackingNumber: string) =>
    `Your order ${orderNumber} has shipped! Track: ${trackingNumber}. Expected delivery in 3-5 days.`,

  orderDelivered: (orderNumber: string) =>
    `Your order ${orderNumber} has been delivered! Thank you for shopping with us. Rate your experience at toymarketplace.in`,

  paymentSuccess: (orderNumber: string, amount: number) =>
    `Payment of ₹${amount} received for order ${orderNumber}. Thank you!`,

  paymentFailed: (orderNumber: string) =>
    `Payment failed for order ${orderNumber}. Please try again or contact support.`,

  newMessage: (senderName: string) =>
    `New message from ${senderName} on Toy Marketplace. Check your inbox at toymarketplace.in/messages`,

  priceAlert: (toyTitle: string, price: number) =>
    `Price drop alert! ${toyTitle} now at ₹${price}. Buy now at toymarketplace.in`,

  wishlistAvailable: (toyTitle: string) =>
    `Good news! ${toyTitle} from your wishlist is now available. Check it out at toymarketplace.in`,

  accountVerification: (code: string) =>
    `Verify your Toy Marketplace account with code: ${code}. Valid for 15 minutes.`,
};

// SMS analytics
export const getSMSAnalytics = async () => {
  try {
    const messages = await twilioClient.messages.list({ limit: 100 });

    const analytics = {
      total: messages.length,
      sent: messages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
      failed: messages.filter(m => m.status === 'failed').length,
      pending: messages.filter(m => m.status === 'queued' || m.status === 'sending').length,
    };

    return { success: true, data: analytics };
  } catch (error: any) {
    logError('Get SMS analytics error', error);
    return { success: false, error: error.message };
  }
};
