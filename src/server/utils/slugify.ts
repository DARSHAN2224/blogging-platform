/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A slugified string
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
 * Generate a unique slug by appending a timestamp if needed
 * @param text - The text to convert to a slug
 * @returns A unique slugified string
 */
export function generateUniqueSlug(text: string): string {
  const baseSlug = slugify(text);
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
}
