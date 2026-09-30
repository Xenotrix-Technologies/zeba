/**
 * ZEBA Image Utility
 * Safely parses and normalizes product image URLs from various backend formats
 * (Arrays, JSON strings, single URL strings, null/undefined) with modern WebP optimization.
 */

export const DEFAULT_PRODUCT_IMAGE = '/images/zeba-1pack.webp';

export function getWebpImageUrl(url) {
  if (!url || typeof url !== 'string') return DEFAULT_PRODUCT_IMAGE;
  if (url.startsWith('/images/') && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png'))) {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  return url;
}

export function parseProductImages(images) {
  if (!images) {
    return [DEFAULT_PRODUCT_IMAGE];
  }

  let list = [];
  if (Array.isArray(images)) {
    list = images.filter(img => typeof img === 'string' && img.trim().length > 0);
  } else if (typeof images === 'string') {
    const trimmed = images.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch {
        list = [trimmed];
      }
    } else if (trimmed) {
      list = [trimmed];
    }
  }

  if (list.length === 0) return [DEFAULT_PRODUCT_IMAGE];
  return list.map(img => getWebpImageUrl(img));
}

export function getProductMainImage(images) {
  const list = parseProductImages(images);
  return list[0] || DEFAULT_PRODUCT_IMAGE;
}

export default {
  DEFAULT_PRODUCT_IMAGE,
  getWebpImageUrl,
  parseProductImages,
  getProductMainImage
};
