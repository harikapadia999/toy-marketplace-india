/**
 * Generate a URL-friendly slug from a string
 * @param text - Input text
 * @returns Slugified string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generate a unique slug with ID
 * @param title - Title text
 * @param id - Unique identifier
 * @returns Unique slug
 */
export function generateUniqueSlug(title: string, id: string): string {
  const baseSlug = slugify(title);
  const shortId = id.slice(0, 8); // Use first 8 characters of UUID
  return `${baseSlug}-${shortId}`;
}

/**
 * Generate a slug from listing details
 * @param title - Listing title
 * @param category - Toy category
 * @param id - Listing ID
 * @returns SEO-friendly slug
 */
export function generateListingSlug(title: string, category: string, id: string): string {
  const titleSlug = slugify(title);
  const categorySlug = slugify(category);
  const shortId = id.slice(0, 8);
  return `${categorySlug}-${titleSlug}-${shortId}`;
}

/**
 * Extract ID from slug
 * @param slug - Slug string
 * @returns Extracted ID or null
 */
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part looks like a UUID fragment (8 hex characters)
  if (/^[0-9a-f]{8}$/i.test(lastPart)) {
    return lastPart;
  }
  
  return null;
}
