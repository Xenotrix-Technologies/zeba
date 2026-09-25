import { query } from '../config/db.js';

function formatProduct(prod) {
  if (!prod) return prod;
  return {
    ...prod,
    price: parseFloat(prod.price),
    original_price: parseFloat(prod.original_price),
    stock_quantity: parseInt(prod.stock_quantity, 10),
    pack_count: parseInt(prod.pack_count, 10),
    images: Array.isArray(prod.images) ? prod.images : (typeof prod.images === 'string' ? JSON.parse(prod.images || '[]') : [])
  };
}

export async function getProducts(req, res, next) {
  try {
    const result = await query(
      `SELECT id, slug, name, pack_size, pack_count, price, original_price,
              stock_quantity, badge_text, short_description, description,
              benefits, how_to_use, features, images, is_active, is_featured,
              created_at, updated_at
       FROM products
       WHERE is_active = true
       ORDER BY pack_count ASC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows.map(formatProduct)
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const result = await query(
      `SELECT id, slug, name, pack_size, pack_count, price, original_price,
              stock_quantity, badge_text, short_description, description,
              benefits, how_to_use, features, images, is_active, is_featured,
              created_at, updated_at
       FROM products
       WHERE slug = $1 AND is_active = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.json({
      success: true,
      product: formatProduct(result.rows[0])
    });
  } catch (err) {
    next(err);
  }
}
