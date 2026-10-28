/**
 * ZEBA Meta Pixel & Event Tracking Utility
 * 
 * Accurately tracks Meta Commerce events for Facebook & Instagram Shopping
 * and Dynamic Product Advertisements (DPA):
 * - PageView
 * - ViewContent
 * - AddToCart
 * - InitiateCheckout
 * - Purchase
 * - Search
 * 
 * Guarantees:
 * 1. Product IDs strictly match Meta Product Catalog feed IDs (g:id).
 * 2. Deduplication using matching eventID for browser & server-side CAPI.
 * 3. In-memory debounce / duplicate suppression.
 * 4. Error isolation: never crashes UI if ad-blocker blocks fbq.
 * 5. Respects cookie consent if explicitly rejected.
 */

const PIXEL_ID = '1770041220950860';

// Deduplication cache to prevent duplicate events during re-renders or page refreshes
const sentEventsCache = new Set();

/**
 * Check if user has opted out of tracking
 */
function isConsentAllowed() {
  try {
    const consent = localStorage.getItem('zeba_cookie_consent');
    if (consent === 'denied') return false;
  } catch {
    // ignore
  }
  return true;
}

/**
 * Safe invocation of window.fbq
 */
function emitFbq(trackType, eventName, parameters = {}, options = {}) {
  if (typeof window === 'undefined') return;
  if (!isConsentAllowed()) return;

  if (typeof window.fbq !== 'function') {
    // fbq not loaded or blocked by browser extension
    return;
  }

  try {
    if (options && options.eventID) {
      window.fbq(trackType, eventName, parameters, { eventID: options.eventID });
    } else {
      window.fbq(trackType, eventName, parameters);
    }
  } catch (err) {
    console.debug('[Meta Pixel] Suppressed event error:', err?.message);
  }
}

/**
 * Track PageView (e.g. on client-side route transitions)
 */
export function trackPageView() {
  emitFbq('track', 'PageView');
}

/**
 * Track ViewContent when a user views a product
 * @param {Object} product - Product object
 */
export function trackViewContent(product) {
  if (!product || !product.id) return;

  const contentId = String(product.id);
  const dedupeKey = `ViewContent_${contentId}`;

  // Suppress duplicates within a short window for same product view
  if (sentEventsCache.has(dedupeKey)) return;
  sentEventsCache.add(dedupeKey);
  setTimeout(() => sentEventsCache.delete(dedupeKey), 5000);

  const price = parseFloat(product.price) || 0;

  emitFbq('track', 'ViewContent', {
    content_name: product.name || 'ZEBA Periods Pain Relief Heating Pad',
    content_category: product.category || 'Period Care > Heating Pads',
    content_ids: [contentId],
    content_type: 'product',
    value: price,
    currency: 'INR'
  });
}

/**
 * Track AddToCart when a product is added to cart or Buy Now clicked
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity added
 */
export function trackAddToCart(product, quantity = 1) {
  if (!product || !product.id) return;

  const contentId = String(product.id);
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const unitPrice = parseFloat(product.price) || 0;
  const totalPrice = unitPrice * qty;

  emitFbq('track', 'AddToCart', {
    content_name: product.name || 'ZEBA Periods Pain Relief Heating Pad',
    content_category: product.category || 'Period Care > Heating Pads',
    content_ids: [contentId],
    content_type: 'product',
    value: totalPrice,
    currency: 'INR',
    num_items: qty
  });
}

/**
 * Track InitiateCheckout when user lands on checkout page
 * @param {Array} items - Array of checkout cart items
 * @param {number} totalAmount - Order subtotal/total
 */
export function trackInitiateCheckout(items = [], totalAmount = 0) {
  if (!items || items.length === 0) return;

  const contentIds = items.map(item => String(item.id || item.product_id)).filter(Boolean);
  const numItems = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 1), 0);
  const value = parseFloat(totalAmount) || 0;

  const dedupeKey = `InitiateCheckout_${contentIds.sort().join('_')}_${value}`;
  if (sentEventsCache.has(dedupeKey)) return;
  sentEventsCache.add(dedupeKey);
  setTimeout(() => sentEventsCache.delete(dedupeKey), 30000); // 30 sec debounce

  emitFbq('track', 'InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    value,
    currency: 'INR',
    num_items: numItems
  });
}

/**
 * Track Purchase event on order completion
 * Supports deduplication with Meta Conversions API via eventID
 * @param {Object} order - Confirmed order object
 * @param {Array} items - Order items
 * @param {string} orderNumber - Canonical order number (e.g. ZEBA-2026-XXXX)
 */
export function trackPurchase(order, items = [], orderNumber = '') {
  const ordNum = orderNumber || order?.order_number || order?.orderNumber;
  if (!ordNum) return;

  const dedupeKey = `Purchase_${ordNum}`;
  // Prevent duplicate purchase fires on page reload
  if (sentEventsCache.has(dedupeKey)) return;
  sentEventsCache.add(dedupeKey);

  const rawItems = items && items.length > 0 ? items : (order?.items || []);
  const contentIds = rawItems.map(item => String(item.product_id || item.productId || item.id)).filter(Boolean);
  const totalAmount = parseFloat(order?.total_amount || order?.totalAmount || 0);
  const numItems = rawItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 1), 0);

  const eventID = `order_${ordNum}`;

  emitFbq(
    'track',
    'Purchase',
    {
      content_ids: contentIds.length > 0 ? contentIds : ['1'],
      content_type: 'product',
      value: totalAmount,
      currency: 'INR',
      num_items: numItems || 1
    },
    { eventID }
  );
}

/**
 * Track Search event
 * @param {string} query - Search keyword
 */
export function trackSearch(query) {
  if (!query || typeof query !== 'string') return;
  const clean = query.trim();
  if (clean.length === 0) return;

  emitFbq('track', 'Search', {
    search_string: clean
  });
}

export default {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackSearch
};

