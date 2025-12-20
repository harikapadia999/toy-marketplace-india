/**
 * Generate a random OTP
 * @param length - Length of OTP (default: 6)
 * @returns Random OTP string
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}

/**
 * Generate OTP expiry time
 * @param minutes - Minutes until expiry (default: 10)
 * @returns Expiry timestamp
 */
export function generateOTPExpiry(minutes: number = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if OTP is expired
 * @param expiryTime - OTP expiry timestamp
 * @returns True if expired
 */
export function isOTPExpired(expiryTime: Date): boolean {
  return new Date() > expiryTime;
}

/**
 * Verify OTP
 * @param inputOTP - User input OTP
 * @param storedOTP - Stored OTP
 * @param expiryTime - OTP expiry time
 * @returns True if OTP is valid and not expired
 */
export function verifyOTP(inputOTP: string, storedOTP: string, expiryTime: Date): boolean {
  if (isOTPExpired(expiryTime)) {
    return false;
  }
  
  return inputOTP === storedOTP;
}

/**
 * Format OTP for display (e.g., "123 456")
 * @param otp - OTP string
 * @returns Formatted OTP
 */
export function formatOTP(otp: string): string {
  if (otp.length === 6) {
    return `${otp.slice(0, 3)} ${otp.slice(3)}`;
  }
  return otp;
}
