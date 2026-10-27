/**
 * ZEBA Image Utility
 * Safely parses, normalizes, and optimizes product image URLs from various backend formats
 * (Arrays, JSON strings, single URL strings, null/undefined) with modern WebP compression,
 * responsive thumbnail selection, and CDN / Supabase Storage compatibility.
 */

export const DEFAULT_PRODUCT_IMAGE = '/images/zeba-1pack-sm.webp';
export const DEFAULT_DETAIL_IMAGE = '/images/zeba-1pack.webp';

/**
 * Normalizes image paths to modern WebP format and resolves external CDN / Supabase Storage if configured.
 */
export function getWebpImageUrl(url) {
  if (!url || typeof url !== 'string') return DEFAULT_PRODUCT_IMAGE;

  let clean = url.trim();

  // If raw GitHub URL was used, handle gracefully
  if (clean.includes('raw.githubusercontent.com') || clean.includes('github.com')) {
    clean = clean.replace(/github\.com\/([^/]+)\/([^/]+)\/raw\/[^/]+/, 'raw.githubusercontent.com/$1/$2/main');
  }

  // Convert legacy uncompressed images to modern WebP variants
  if (clean.startsWith('/images/') && (clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.png'))) {
    clean = clean.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  // Strip query timestamps for clean caching unless explicitly preserving version
  clean = clean.replace(/\?v=\d+/g, '');

  // Prepend optional CDN or Supabase Storage bucket URL if configured in environment
  const cdnBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMAGE_CDN_URL) ||
                  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_STORAGE_URL) || '';

  if (cdnBase && clean.startsWith('/images/')) {
    return `${cdnBase.replace(/\/$/, '')}${clean}`;
  }

  return clean;
}

/**
 * Extract and parse array of product images safely
 */
export function parseProductImages(images) {
  if (!images) {
    return [DEFAULT_DETAIL_IMAGE];
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

  if (list.length === 0) return [DEFAULT_DETAIL_IMAGE];
  return list.map(img => getWebpImageUrl(img));
}

/**
 * Returns full-resolution main image for product detail hero gallery
 */
export function getProductMainImage(images) {
  const list = parseProductImages(images);
  return list[0] || DEFAULT_DETAIL_IMAGE;
}

/**
 * Returns lightweight thumbnail (~36KB WebP) for product cards and listing views
 * Prevents downloading oversized hero assets on catalog and homepage listings.
 */
export function getProductThumbnail(images) {
  const list = parseProductImages(images);
  const main = list[0] || DEFAULT_PRODUCT_IMAGE;

  // Map to optimized small thumbnail variant when available
  if (main.includes('zeba-1pack.webp') || main.includes('zeba-1pack.jpg') || main.includes('zeba-1pack-md.webp')) {
    return '/images/zeba-1pack-sm.webp';
  }

  return main;
}

export default {
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_DETAIL_IMAGE,
  getWebpImageUrl,
  parseProductImages,
  getProductMainImage,
  getProductThumbnail
};
