import { query } from '../config/db.js';

export function formatProduct(prod) {
  if (!prod) return prod;
  return {
    ...prod,
    price: parseFloat(prod.price),
    original_price: parseFloat(prod.original_price),
    show_original_price: prod.show_original_price !== false,
    stock_quantity: prod.stock_quantity !== null && prod.stock_quantity !== undefined ? parseInt(prod.stock_quantity, 10) : null,
    pack_count: parseInt(prod.pack_count, 10) || 1,
    rating: prod.rating ? parseFloat(prod.rating) : 4.9,
    review_count: prod.review_count ? parseInt(prod.review_count, 10) : 0,
    images: Array.isArray(prod.images) ? prod.images : (typeof prod.images === 'string' ? JSON.parse(prod.images || '[]') : [])
  };
}

/**
 * GET /api/products
 * Optimized product listing with field selection, pagination, filtering, and sorting
 */
export async function getProducts(req, res, next) {
  try {
    const isFull = req.query.full === 'true';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || (req.query.page ? 20 : 50)));
    const offset = (page - 1) * limit;

    const conditions = ['is_active = true'];
    const params = [];

    // Search filter
    const search = (req.query.search || req.query.q || '').trim();
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR short_description ILIKE $${params.length} OR badge_text ILIKE $${params.length})`);
    }

    // Category filter
    const category = (req.query.category || '').trim();
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    // Price range filters
    if (req.query.min_price || req.query.minPrice) {
      const minPrice = parseFloat(req.query.min_price || req.query.minPrice);
      if (!isNaN(minPrice)) {
        params.push(minPrice);
        conditions.push(`price >= $${params.length}`);
      }
    }
    if (req.query.max_price || req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.max_price || req.query.maxPrice);
      if (!isNaN(maxPrice)) {
        params.push(maxPrice);
        conditions.push(`price <= $${params.length}`);
      }
    }

    // Sort order
    let orderBy = 'pack_count ASC, id ASC';
    const sort = req.query.sort;
    if (sort === 'price_asc') {
      orderBy = 'price ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'price DESC';
    } else if (sort === 'pack_count_desc') {
      orderBy = 'pack_count DESC';
    } else if (sort === 'popular') {
      orderBy = 'is_featured DESC, rating DESC, review_count DESC';
    } else if (sort === 'newest') {
      orderBy = 'created_at DESC';
    }

    const whereClause = conditions.join(' AND ');

    // Fast column projection: cards only load needed fields; full loads descriptions & JSONB
    const selectColumns = isFull
      ? `id, slug, name, pack_size, pack_count, price, original_price, show_original_price,
         stock_quantity, barcode, barcode_image, badge_text, short_description, description,
         benefits, how_to_use, features, images, rating, review_count, category,
         is_active, is_featured, created_at, updated_at`
      : `id, slug, name, pack_size, pack_count, price, original_price, show_original_price,
         stock_quantity, badge_text, short_description, images, rating, review_count,
         category, is_active, is_featured`;

    const countParams = [...params];
    const queryParams = [...params, limit, offset];

    const [countResult, productsResult] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM products WHERE ${whereClause}`, countParams),
      query(
        `SELECT ${selectColumns}
         FROM products
         WHERE ${whereClause}
         ORDER BY ${orderBy}
         LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
        queryParams
      )
    ]);

    const total = parseInt(countResult.rows[0]?.total || 0, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Cache header: Vercel Edge Cache + Browser Cache
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    res.json({
      success: true,
      count: productsResult.rows.length,
      total,
      page,
      totalPages,
      limit,
      hasMore: page < totalPages,
      products: productsResult.rows.map(formatProduct)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:slug
 * Direct single product fetch by slug including lightweight sibling variants for instant pack switching
 */
export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const [productResult, variantsResult] = await Promise.all([
      query(
        `SELECT id, slug, name, pack_size, pack_count, price, original_price, show_original_price,
                stock_quantity, barcode, barcode_image, badge_text, short_description, description,
                benefits, how_to_use, features, images, rating, review_count, category,
                is_active, is_featured, created_at, updated_at
         FROM products
         WHERE slug = $1 AND is_active = true`,
        [slug]
      ),
      query(
        `SELECT id, slug, name, pack_size, pack_count, price, original_price, show_original_price,
                badge_text, stock_quantity, images, is_active
         FROM products
         WHERE is_active = true
         ORDER BY pack_count ASC`
      )
    ]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product not found for slug: ${slug}`
      });
    }

    // Cache header: Vercel Edge Cache + Browser Cache
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    const formattedProduct = formatProduct(productResult.rows[0]);
    const formattedVariants = variantsResult.rows.map(formatProduct);

    res.json({
      success: true,
      product: {
        ...formattedProduct,
        variants: formattedVariants
      },
      variants: formattedVariants
    });
  } catch (err) {
    next(err);
  }
}
