/**
 * Format currency in Indian Rupees
 * @param amount - Amount to format
 * @param showDecimals - Show decimal places (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showDecimals: boolean = true): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  
  return formatter.format(amount);
}

/**
 * Format number in Indian numbering system (lakhs, crores)
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format date in Indian format (DD/MM/YYYY)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format date and time
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format phone number (Indian format)
 * @param phone - Phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +91 XXXXX XXXXX
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}

/**
 * Format file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format percentage
 * @param value - Value to format
 * @param total - Total value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, total: number, decimals: number = 0): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format age range from months
 * @param minAge - Minimum age in months
 * @param maxAge - Maximum age in months
 * @returns Formatted age range string
 */
export function formatAgeRange(minAge?: number, maxAge?: number): string {
  if (!minAge && !maxAge) return 'All ages';
  
  const formatAge = (months: number): string => {
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${years}.${remainingMonths} years`;
  };
  
  if (minAge && maxAge) {
    return `${formatAge(minAge)} - ${formatAge(maxAge)}`;
  }
  
  if (minAge) {
    return `${formatAge(minAge)}+`;
  }
  
  return `Up to ${formatAge(maxAge!)}`;
}
