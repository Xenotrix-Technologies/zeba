/**
 * ZEBA Image Utility
 * Safely parses and normalizes product image URLs from various backend formats
 * (Arrays, JSON strings, single URL strings, null/undefined).
 */

export const DEFAULT_PRODUCT_IMAGE = '/images/zeba-1pack.jpg';

export function parseProductImages(images) {
  if (!images) {
    return [DEFAULT_PRODUCT_IMAGE];
  }

  if (Array.isArray(images)) {
    const valid = images.filter(img => typeof img === 'string' && img.trim().length > 0);
    return valid.length > 0 ? valid : [DEFAULT_PRODUCT_IMAGE];
  }

  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (!trimmed) return [DEFAULT_PRODUCT_IMAGE];

    // Check if it is a JSON array string e.g. '["/images/zeba-1pack.jpg"]'
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback to single string treatment if JSON parse fails
      }
    }

    // Direct image path / URL string
    return [trimmed];
  }

  return [DEFAULT_PRODUCT_IMAGE];
}

export function getProductMainImage(images) {
  const list = parseProductImages(images);
  return list[0] || DEFAULT_PRODUCT_IMAGE;
}

export default {
  DEFAULT_PRODUCT_IMAGE,
  parseProductImages,
  getProductMainImage
};
