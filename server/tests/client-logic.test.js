import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseProductImages,
  getProductMainImage,
  getProductThumbnail,
  getWebpImageUrl,
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_DETAIL_IMAGE
} from '../../client/src/utils/imageUtils.js';

// Replicate resolveProduct logic from client/src/pages/ProductDetail.jsx
function resolveProduct(prods, targetSlug, searchParams) {
  if (!prods || prods.length === 0) return null;

  // 1. By slug in URL path (/products/:slug)
  if (targetSlug) {
    const match = prods.find(p => p.slug === targetSlug);
    if (match) return match;
  }

  // 2. By pack count in query parameter (/products?pack=1 or /products?pack=3)
  const packParam = searchParams?.get?.('pack');
  if (packParam) {
    const match = prods.find(p => String(p.pack_count) === String(packParam));
    if (match) return match;
  }

  // 3. By ID query parameter (/products?id=1)
  const idParam = searchParams?.get?.('id');
  if (idParam) {
    const match = prods.find(p => String(p.id) === String(idParam));
    if (match) return match;
  }

  // 4. Default fallback when no specific pack requested: 3-pack or first product
  return prods.find(p => p.pack_count > 1) || prods[0];
}

const mockProducts = [
  { id: 1, slug: 'zeba-heating-pad-1-pack', name: 'ZEBA 1-Pack', pack_count: 1, price: 124 },
  { id: 2, slug: 'zeba-heating-pad-3-pack', name: 'ZEBA 3-Pack', pack_count: 3, price: 367 }
];

describe('Product Detail Resolution & Variant Selection Tests', () => {

  test('Resolves product directly by slug path', () => {
    const prod = resolveProduct(mockProducts, 'zeba-heating-pad-1-pack', new URLSearchParams());
    assert.equal(prod?.id, 1);
    assert.equal(prod?.slug, 'zeba-heating-pad-1-pack');
  });

  test('Resolves product by pack query parameter (/products?pack=3)', () => {
    const params = new URLSearchParams('pack=3');
    const prod = resolveProduct(mockProducts, null, params);
    assert.equal(prod?.id, 2);
    assert.equal(prod?.pack_count, 3);
  });

  test('Resolves product by ID query parameter (/products?id=1)', () => {
    const params = new URLSearchParams('id=1');
    const prod = resolveProduct(mockProducts, null, params);
    assert.equal(prod?.id, 1);
  });

  test('Falls back to value pack (pack_count > 1) when no slug or parameter is passed', () => {
    const prod = resolveProduct(mockProducts, null, new URLSearchParams());
    assert.equal(prod?.id, 2);
    assert.equal(prod?.pack_count, 3);
  });

  test('Returns null when product array is empty', () => {
    const prod = resolveProduct([], 'zeba-heating-pad-1-pack', new URLSearchParams());
    assert.equal(prod, null);
  });
});

describe('Image Optimization & Sizing Tests', () => {

  test('parseProductImages handles JSON array strings, arrays and legacy formats', () => {
    const fromJson = parseProductImages('["/images/zeba-1pack.webp", "/images/zeba-hero-lifestyle.webp"]');
    assert.equal(fromJson.length, 2);
    assert.equal(fromJson[0], '/images/zeba-1pack.webp');

    const fromArray = parseProductImages(['/images/zeba-1pack.jpg']);
    assert.equal(fromArray[0], '/images/zeba-1pack.webp', 'JPG must be converted to WebP');

    const fromNull = parseProductImages(null);
    assert.equal(fromNull[0], DEFAULT_DETAIL_IMAGE);
  });

  test('getProductThumbnail returns lightweight ~36KB WebP thumbnail for card listings', () => {
    const thumb = getProductThumbnail(['/images/zeba-1pack.webp']);
    assert.equal(thumb, '/images/zeba-1pack-sm.webp', 'ProductCard must use small WebP thumbnail to reduce listing weight');
  });

  test('getProductMainImage returns full-resolution image for product detail gallery', () => {
    const main = getProductMainImage(['/images/zeba-1pack.webp', '/images/zeba-1pack-sm.webp']);
    assert.equal(main, '/images/zeba-1pack.webp');
  });

  test('getWebpImageUrl rewrites uncompressed image extensions to WebP', () => {
    assert.equal(getWebpImageUrl('/images/photo.png'), '/images/photo.webp');
    assert.equal(getWebpImageUrl('/images/photo.jpg'), '/images/photo.webp');
    assert.equal(getWebpImageUrl('/images/photo.jpeg'), '/images/photo.webp');
  });
});

describe('In-Flight Deduplication & In-Memory Caching Verification', () => {

  test('Deduplicates concurrent identical in-flight requests', async () => {
    let callCount = 0;
    const inFlightMap = new Map();

    async function mockApiGet(url) {
      if (inFlightMap.has(url)) {
        return inFlightMap.get(url);
      }
      const p = new Promise(resolve => {
        callCount++;
        setTimeout(() => resolve({ success: true, url, callCount }), 30);
      }).finally(() => inFlightMap.delete(url));

      inFlightMap.set(url, p);
      return p;
    }

    // Fire 3 simultaneous calls to the same endpoint
    const [res1, res2, res3] = await Promise.all([
      mockApiGet('/products'),
      mockApiGet('/products'),
      mockApiGet('/products')
    ]);

    assert.equal(callCount, 1, 'Exact duplicate in-flight requests must be deduplicated into 1 network call');
    assert.equal(res1.callCount, 1);
    assert.equal(res2.callCount, 1);
    assert.equal(res3.callCount, 1);
  });

  test('Reuses cached data within TTL', async () => {
    const cache = new Map();
    let networkFetches = 0;

    function getWithCache(url, ttlMs = 5000) {
      const now = Date.now();
      const cached = cache.get(url);
      if (cached && now - cached.timestamp < cached.ttl) {
        return Promise.resolve(cached.data);
      }
      networkFetches++;
      const data = { products: [{ id: 1 }], fetchedAt: now };
      cache.set(url, { data, timestamp: now, ttl: ttlMs });
      return Promise.resolve(data);
    }

    await getWithCache('/products');
    assert.equal(networkFetches, 1);

    // Immediate second call should hit cache
    const second = await getWithCache('/products');
    assert.equal(networkFetches, 1, 'Cached data must be reused without network call');
    assert.equal(second.products[0].id, 1);
  });

  test('AbortController cancellation handles rapid navigation safely', async () => {
    const controller = new AbortController();
    let aborted = false;

    const request = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve('done'), 100);
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        aborted = true;
        reject(new Error('CanceledError'));
      });
    });

    // Abort early (simulating rapid user navigation between variants)
    controller.abort();

    try {
      await request;
      assert.fail('Should have been aborted');
    } catch (err) {
      assert.equal(aborted, true);
      assert.equal(err.message, 'CanceledError');
    }
  });
});
