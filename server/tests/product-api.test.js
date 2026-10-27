import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../api/index.js';
import { closeDb } from '../src/config/db.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDb();
});

describe('Product API Performance & Optimization Tests', () => {

  test('GET /api/products returns lightweight card projection by default', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /json/);

    // Verify Cache-Control header for Edge & browser caching
    const cacheControl = res.headers.get('cache-control');
    assert.ok(cacheControl, 'Cache-Control header must be set');
    assert.match(cacheControl, /public/);
    assert.match(cacheControl, /max-age=60/);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.products));
    assert.ok(data.products.length > 0);
    assert.ok(data.total >= data.products.length);

    // Verify card projection: heavy description and JSONB arrays omitted in listing
    const firstProduct = data.products[0];
    assert.ok(firstProduct.id);
    assert.ok(firstProduct.slug);
    assert.ok(firstProduct.name);
    assert.ok(firstProduct.price);
    assert.ok(firstProduct.pack_size);
    assert.ok(firstProduct.pack_count);
    assert.equal(firstProduct.description, undefined, 'Full description should be omitted in card projection');
    assert.equal(firstProduct.benefits, undefined, 'Full benefits JSON should be omitted in card projection');
    assert.equal(firstProduct.how_to_use, undefined, 'Full how_to_use JSON should be omitted in card projection');
  });

  test('GET /api/products?full=true returns complete product data for fallback detail view', async () => {
    const res = await fetch(`${baseUrl}/api/products?full=true`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.products.length > 0);

    const firstProduct = data.products[0];
    assert.ok(firstProduct.description, 'Full description must be present when full=true');
    assert.ok(firstProduct.benefits, 'Benefits must be present when full=true');
    assert.ok(firstProduct.how_to_use, 'how_to_use must be present when full=true');
  });

  test('GET /api/products supports pagination parameters', async () => {
    const res = await fetch(`${baseUrl}/api/products?page=1&limit=1`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.page, 1);
    assert.equal(data.limit, 1);
    assert.equal(data.products.length, 1);
    assert.ok(data.total >= 1);
    assert.ok(data.totalPages >= 1);
  });

  test('GET /api/products supports sorting by price and pack_count', async () => {
    const resAsc = await fetch(`${baseUrl}/api/products?sort=price_asc`);
    const dataAsc = await resAsc.json();
    assert.equal(dataAsc.success, true);

    if (dataAsc.products.length >= 2) {
      assert.ok(dataAsc.products[0].price <= dataAsc.products[1].price, 'price_asc should order lowest to highest');
    }

    const resDesc = await fetch(`${baseUrl}/api/products?sort=price_desc`);
    const dataDesc = await resDesc.json();
    assert.equal(dataDesc.success, true);

    if (dataDesc.products.length >= 2) {
      assert.ok(dataDesc.products[0].price >= dataDesc.products[1].price, 'price_desc should order highest to lowest');
    }
  });

  test('GET /api/products/:slug returns direct single product and sibling variants in 1 request', async () => {
    const res = await fetch(`${baseUrl}/api/products/zeba-heating-pad-1-pack`);
    assert.equal(res.status, 200);

    // Verify Edge cache header
    const cacheControl = res.headers.get('cache-control');
    assert.ok(cacheControl);
    assert.match(cacheControl, /public/);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.product);
    assert.equal(data.product.slug, 'zeba-heating-pad-1-pack');
    assert.ok(data.product.description, 'Direct slug fetch must include full description');
    assert.ok(data.product.how_to_use, 'Direct slug fetch must include how_to_use');

    // Sibling variants included so pack buttons render immediately
    assert.ok(Array.isArray(data.variants), 'Sibling variants must be provided');
    assert.ok(data.variants.length >= 1);
    assert.ok(data.variants.some(v => v.slug === 'zeba-heating-pad-1-pack'));
  });

  test('GET /api/products/:slug returns 404 for invalid/nonexistent slug', async () => {
    const res = await fetch(`${baseUrl}/api/products/non-existent-heating-pad-xyz-999`);
    assert.equal(res.status, 404);

    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /not found/i);
  });

  test('GET /api/reviews returns approved reviews and aggregated stats', async () => {
    const res = await fetch(`${baseUrl}/api/reviews`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.reviews));
    assert.ok(data.averageRating);
    assert.ok(typeof data.totalReviews === 'number');
  });

  test('GET /api/faqs returns active FAQs ordered by sort_order', async () => {
    const res = await fetch(`${baseUrl}/api/faqs`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.faqs));
    assert.ok(data.faqs.length > 0);
  });
});
