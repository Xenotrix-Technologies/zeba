/**
 * ZEBA Meta Product Catalog Feed Generator
 * Generates automated, real-time product feeds strictly compliant with:
 * - Meta Commerce Manager Data Feed Specification
 * - Google Merchant Center RSS 2.0 (xmlns:g="http://base.google.com/ns/1.0")
 * - Meta CSV Catalog Feed Specification
 * 
 * Target Website: https://www.zebaofficial.in
 */

const DEFAULT_BASE_URL = 'https://www.zebaofficial.in';
const FEED_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

// In-memory feed cache for performance and high crawler traffic resilience
let feedCache = {
  xml: null,
  csv: null,
  productsCount: 0,
  generatedAt: 0,
  etag: null
};

/**
 * Manually invalidate cached feed (triggered on product or inventory updates)
 */
export function invalidateMetaFeedCache() {
  feedCache = {
    xml: null,
    csv: null,
    productsCount: 0,
    generatedAt: 0,
    etag: null
  };
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wrap text in CDATA safely
 */
function cdata(text) {
  if (!text) return '<![CDATA[]]>';
  const clean = String(text).replace(/]]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${clean}]]>`;
}

/**
 * Escape field for CSV adhering to RFC 4180
 */
function escapeCsv(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Resolve absolute, publicly accessible HTTPS image URL
 */
export function resolveImageUrl(img, baseUrl = DEFAULT_BASE_URL) {
  const base = baseUrl.replace(/\/+$/, '');
  if (!img) return `${base}/images/zeba-1pack.webp`;
  const clean = String(img).trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.startsWith('/')) {
    return `${base}${clean}`;
  }
  return `${base}/${clean}`;
}

/**
 * Parse images array safely from various DB representation (array, JSON string, null)
 */
export function extractProductImages(images) {
  if (!images) return ['/images/zeba-1pack.webp'];
  if (Array.isArray(images)) {
    const valid = images.filter(img => typeof img === 'string' && img.trim().length > 0);
    return valid.length > 0 ? valid : ['/images/zeba-1pack.webp'];
  }
  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(img => typeof img === 'string' && img.trim().length > 0);
        }
      } catch {
        // ignore
      }
    }
    if (trimmed.length > 0) {
      return [trimmed];
    }
  }
  return ['/images/zeba-1pack.webp'];
}

/**
 * Sanitize product text description (strip any accidental HTML tags and normalize whitespace)
 */
function sanitizeDescription(desc, fallback) {
  const raw = desc || fallback || '';
  const text = String(raw).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text || 'ZEBA Periods Pain Relief Heating Pad - Natural soothing air-activated heat therapy for menstrual cramps.';
}

/**
 * Normalize and validate product fields for Meta Product Catalog
 */
export function normalizeProductForMeta(prod, baseUrl = DEFAULT_BASE_URL) {
  if (!prod || !prod.id || !prod.slug) {
    return null;
  }

  // Only eligible, active products are included in catalog
  if (prod.is_active === false) {
    return null;
  }

  const base = baseUrl.replace(/\/+$/, '');
  const id = String(prod.id);
  const title = (prod.name || 'ZEBA Periods Pain Relief Heating Pad').trim();
  const description = sanitizeDescription(prod.description, prod.short_description);
  const link = `${base}/products/${prod.slug}`;

  // Image handling
  const rawImages = extractProductImages(prod.images);
  const primaryImage = resolveImageUrl(rawImages[0], base);
  const additionalImages = rawImages.slice(1, 10).map(img => resolveImageUrl(img, base));

  // Pricing & Sale Price
  const priceNum = parseFloat(prod.price) || 0;
  const origPriceNum = parseFloat(prod.original_price);
  const hasOriginalPrice = !isNaN(origPriceNum) && origPriceNum > priceNum;
  const showOriginalPrice = prod.show_original_price !== false;

  let catalogPrice;
  let salePrice = null;

  if (hasOriginalPrice && showOriginalPrice) {
    catalogPrice = `${origPriceNum.toFixed(2)} INR`;
    salePrice = `${priceNum.toFixed(2)} INR`;
  } else {
    catalogPrice = `${priceNum.toFixed(2)} INR`;
  }

  // Stock / Availability
  const isOutOfStock = prod.stock_quantity !== null && prod.stock_quantity !== undefined && parseInt(prod.stock_quantity, 10) <= 0;
  const availability = isOutOfStock ? 'out of stock' : 'in stock';

  // Barcode / GTIN
  const barcode = prod.barcode ? String(prod.barcode).trim() : null;
  const identifierExists = barcode ? 'yes' : 'no';

  // Pack / Size mapping
  const size = prod.pack_size || (prod.pack_count ? `${prod.pack_count} Pack` : '1 Pack');

  return {
    id,
    title,
    description,
    link,
    primaryImage,
    additionalImages,
    brand: 'ZEBA',
    condition: 'new',
    availability,
    price: catalogPrice,
    salePrice,
    googleProductCategory: '543666', // Health & Beauty > Personal Care > Feminine Care
    productType: 'Period Care > Heating Pads',
    itemGroupId: 'zeba-heating-pads',
    size,
    color: 'Lavender',
    gender: 'female',
    ageGroup: 'adult',
    barcode,
    identifierExists,
    stockQuantity: prod.stock_quantity !== null && prod.stock_quantity !== undefined ? parseInt(prod.stock_quantity, 10) : null
  };
}

/**
 * Generate XML RSS 2.0 Feed compatible with Meta Commerce Manager
 */
export function generateMetaXmlFeed(products, baseUrl = DEFAULT_BASE_URL) {
  const base = baseUrl.replace(/\/+$/, '');
  const normalized = products
    .map(p => normalizeProductForMeta(p, base))
    .filter(Boolean);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>Zeba Official Product Feed</title>\n`;
  xml += `    <link>${base}</link>\n`;
  xml += `    <description>Authentic real-time product catalog feed for ZEBA Period Pain Relief Heating Pads</description>\n`;
  xml += `    <atom:link href="${base}/api/meta-product-feed" rel="self" type="application/rss+xml" />\n`;
  xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;

  for (const item of normalized) {
    xml += `    <item>\n`;
    xml += `      <g:id>${escapeXml(item.id)}</g:id>\n`;
    xml += `      <g:title>${cdata(item.title)}</g:title>\n`;
    xml += `      <g:description>${cdata(item.description)}</g:description>\n`;
    xml += `      <g:link>${escapeXml(item.link)}</g:link>\n`;
    xml += `      <g:image_link>${escapeXml(item.primaryImage)}</g:image_link>\n`;

    for (const addImg of item.additionalImages) {
      xml += `      <g:additional_image_link>${escapeXml(addImg)}</g:additional_image_link>\n`;
    }

    xml += `      <g:brand>${escapeXml(item.brand)}</g:brand>\n`;
    xml += `      <g:condition>${escapeXml(item.condition)}</g:condition>\n`;
    xml += `      <g:availability>${escapeXml(item.availability)}</g:availability>\n`;
    xml += `      <g:price>${escapeXml(item.price)}</g:price>\n`;

    if (item.salePrice) {
      xml += `      <g:sale_price>${escapeXml(item.salePrice)}</g:sale_price>\n`;
    }

    xml += `      <g:google_product_category>${escapeXml(item.googleProductCategory)}</g:google_product_category>\n`;
    xml += `      <g:product_type>${escapeXml(item.productType)}</g:product_type>\n`;
    xml += `      <g:item_group_id>${escapeXml(item.itemGroupId)}</g:item_group_id>\n`;
    xml += `      <g:size>${escapeXml(item.size)}</g:size>\n`;
    xml += `      <g:color>${escapeXml(item.color)}</g:color>\n`;
    xml += `      <g:gender>${escapeXml(item.gender)}</g:gender>\n`;
    xml += `      <g:age_group>${escapeXml(item.ageGroup)}</g:age_group>\n`;

    if (item.barcode) {
      xml += `      <g:gtin>${escapeXml(item.barcode)}</g:gtin>\n`;
    }
    xml += `      <g:identifier_exists>${escapeXml(item.identifierExists)}</g:identifier_exists>\n`;

    xml += `      <g:shipping>\n`;
    xml += `        <g:country>IN</g:country>\n`;
    xml += `        <g:service>Standard Shipping</g:service>\n`;
    xml += `        <g:price>0.00 INR</g:price>\n`;
    xml += `      </g:shipping>\n`;

    xml += `    </item>\n`;
  }

  xml += `  </channel>\n`;
  xml += `</rss>\n`;

  return { xml, count: normalized.length };
}

/**
 * Generate CSV Feed compatible with Meta Commerce Manager
 */
export function generateMetaCsvFeed(products, baseUrl = DEFAULT_BASE_URL) {
  const base = baseUrl.replace(/\/+$/, '');
  const normalized = products
    .map(p => normalizeProductForMeta(p, base))
    .filter(Boolean);

  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'sale_price',
    'link',
    'image_link',
    'additional_image_link',
    'brand',
    'google_product_category',
    'product_type',
    'item_group_id',
    'size',
    'color',
    'gender',
    'age_group',
    'gtin',
    'identifier_exists'
  ];

  const rows = [headers.join(',')];

  for (const item of normalized) {
    const row = [
      escapeCsv(item.id),
      escapeCsv(item.title),
      escapeCsv(item.description),
      escapeCsv(item.availability),
      escapeCsv(item.condition),
      escapeCsv(item.price),
      item.salePrice ? escapeCsv(item.salePrice) : '""',
      escapeCsv(item.link),
      escapeCsv(item.primaryImage),
      item.additionalImages.length > 0 ? escapeCsv(item.additionalImages.join(',')) : '""',
      escapeCsv(item.brand),
      escapeCsv(item.googleProductCategory),
      escapeCsv(item.productType),
      escapeCsv(item.itemGroupId),
      escapeCsv(item.size),
      escapeCsv(item.color),
      escapeCsv(item.gender),
      escapeCsv(item.ageGroup),
      item.barcode ? escapeCsv(item.barcode) : '""',
      escapeCsv(item.identifierExists)
    ];
    rows.push(row.join(','));
  }

  return { csv: rows.join('\r\n'), count: normalized.length };
}

/**
 * Get or compute cached Meta Product Feed
 */
export async function getCachedMetaFeed({ format = 'xml', baseUrl = DEFAULT_BASE_URL, fetchProductsFn, forceRefresh = false }) {
  const now = Date.now();
  const isCacheValid = !forceRefresh && (now - feedCache.generatedAt < FEED_CACHE_TTL_MS);

  if (isCacheValid) {
    if (format === 'csv' && feedCache.csv) {
      return { data: feedCache.csv, count: feedCache.productsCount, fromCache: true, etag: feedCache.etag };
    }
    if (format === 'xml' && feedCache.xml) {
      return { data: feedCache.xml, count: feedCache.productsCount, fromCache: true, etag: feedCache.etag };
    }
  }

  // Fetch real data from database function
  const products = await fetchProductsFn();

  const { xml, count } = generateMetaXmlFeed(products, baseUrl);
  const { csv } = generateMetaCsvFeed(products, baseUrl);

  const etag = `"meta-feed-${count}-${now}"`;

  feedCache = {
    xml,
    csv,
    productsCount: count,
    generatedAt: now,
    etag
  };

  return {
    data: format === 'csv' ? csv : xml,
    count,
    fromCache: false,
    etag
  };
}

