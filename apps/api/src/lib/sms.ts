import axios from 'axios';
import { logInfo, logError } from './logger';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'TOYMKT';
const MSG91_ROUTE = '4'; // Transactional route

// SMS templates
const templates = {
  otp: (otp: string) => `Your OTP for Toy Marketplace India is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
  
  orderConfirmation: (orderNumber: string) => `Your order ${orderNumber} has been confirmed! Track it in your profile. - Toy Marketplace India`,
  
  orderShipped: (orderNumber: string) => `Great news! Your order ${orderNumber} has been shipped and will arrive in 3-5 days. - Toy Marketplace India`,
  
  orderDelivered: (orderNumber: string) => `Your order ${orderNumber} has been delivered! Please leave a review. - Toy Marketplace India`,
  
  paymentSuccess: (amount: number) => `Payment of ₹${amount} received successfully. Thank you for shopping with Toy Marketplace India!`,
  
  listingApproved: (toyTitle: string) => `Your listing "${toyTitle}" is now live on Toy Marketplace India! Good luck with your sale.`,
  
  newMessage: (senderName: string) => `You have a new message from ${senderName} on Toy Marketplace India. Check your inbox!`,
};

// Send SMS function
export async function sendSMS(
  phone: string,
  template: keyof typeof templates,
  data: any
) {
  try {
    // Format phone number (remove +91 if present)
    const formattedPhone = phone.replace(/^\+91/, '');

    const message = templates[template](...Object.values(data));

    const response = await axios.get('https://api.msg91.com/api/v5/flow/', {
      params: {
        authkey: MSG91_AUTH_KEY,
        mobiles: formattedPhone,
        message,
        sender: MSG91_SENDER_ID,
        route: MSG91_ROUTE,
        country: '91',
      },
    });

    logInfo('SMS sent successfully', {
      phone: formattedPhone,
      template,
      response: response.data,
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    logError('Send SMS error', error, { phone, template });
    return { success: false, error: error.message };
  }
}

// Send OTP
export async function sendOTP(phone: string, otp: string) {
  return sendSMS(phone, 'otp', { otp });
}

// Verify OTP (using MSG91 OTP API)
export async function verifyOTP(phone: string, otp: string) {
  try {
    const formattedPhone = phone.replace(/^\+91/, '');

    const response = await axios.post(
      'https://api.msg91.com/api/v5/otp/verify',
      {
        authkey: MSG91_AUTH_KEY,
        mobile: formattedPhone,
        otp,
      }
    );

    logInfo('OTP verified', { phone: formattedPhone });

    return { success: true, data: response.data };
  } catch (error: any) {
    logError('Verify OTP error', error, { phone });
    return { success: false, error: error.message };
  }
}

// Send order confirmation SMS
export async function sendOrderConfirmationSMS(phone: string, orderNumber: string) {
  return sendSMS(phone, 'orderConfirmation', { orderNumber });
}

// Send order shipped SMS
export async function sendOrderShippedSMS(phone: string, orderNumber: string) {
  return sendSMS(phone, 'orderShipped', { orderNumber });
}

// Send order delivered SMS
export async function sendOrderDeliveredSMS(phone: string, orderNumber: string) {
  return sendSMS(phone, 'orderDelivered', { orderNumber });
}

// Send payment success SMS
export async function sendPaymentSuccessSMS(phone: string, amount: number) {
  return sendSMS(phone, 'paymentSuccess', { amount });
}

// Send listing approved SMS
export async function sendListingApprovedSMS(phone: string, toyTitle: string) {
  return sendSMS(phone, 'listingApproved', { toyTitle });
}

// Send new message SMS
export async function sendNewMessageSMS(phone: string, senderName: string) {
  return sendSMS(phone, 'newMessage', { senderName });
}

// Bulk SMS function
export async function sendBulkSMS(
  phones: string[],
  template: keyof typeof templates,
  data: any
) {
  try {
    const formattedPhones = phones.map((p) => p.replace(/^\+91/, '')).join(',');
    const message = templates[template](...Object.values(data));

    const response = await axios.get('https://api.msg91.com/api/v5/flow/', {
      params: {
        authkey: MSG91_AUTH_KEY,
        mobiles: formattedPhones,
        message,
        sender: MSG91_SENDER_ID,
        route: MSG91_ROUTE,
        country: '91',
      },
    });

    logInfo('Bulk SMS sent', {
      count: phones.length,
      template,
      response: response.data,
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    logError('Send bulk SMS error', error, { template });
    return { success: false, error: error.message };
  }
}

// Check SMS balance
export async function checkSMSBalance() {
  try {
    const response = await axios.get('https://api.msg91.com/api/balance.php', {
      params: {
        authkey: MSG91_AUTH_KEY,
        type: MSG91_ROUTE,
      },
    });

    logInfo('SMS balance checked', { balance: response.data });

    return { success: true, balance: response.data };
  } catch (error: any) {
    logError('Check SMS balance error', error);
    return { success: false, error: error.message };
  }
}
