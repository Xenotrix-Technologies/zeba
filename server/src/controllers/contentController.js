import { query } from '../config/db.js';

/**
 * GET /api/content
 * Returns all active homepage and site content sections from database
 */
export async function getSiteContent(req, res, next) {
  try {
    const result = await query(
      `SELECT section_key, title, content
       FROM site_content
       WHERE is_active = true`
    );

    const contentMap = {};
    for (const row of result.rows) {
      contentMap[row.section_key] = {
        title: row.title,
        items: row.content
      };
    }

    res.json({
      success: true,
      content: contentMap
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/faqs
 * Returns active FAQs sorted by sort_order
 */
export async function getFaqs(req, res, next) {
  try {
    const result = await query(
      `SELECT id, question, answer, category, sort_order
       FROM faqs
       WHERE is_active = true
       ORDER BY sort_order ASC, id ASC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      faqs: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reviews
 * Returns approved reviews for storefront
 */
export async function getReviews(req, res, next) {
  try {
    const { productId, featured } = req.query;
    const conditions = ['is_approved = true'];
    const params = [];

    if (productId) {
      params.push(parseInt(productId, 10));
      conditions.push(`product_id = $${params.length}`);
    }

    if (featured === 'true') {
      conditions.push('is_featured = true');
    }

    const result = await query(
      `SELECT r.id, r.product_id, r.author_name, r.rating, r.title, r.comment,
              r.location, r.is_verified_purchase, r.is_featured, r.created_at,
              p.name AS product_name
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY r.is_featured DESC, r.created_at DESC`,
      params
    );

    // Calculate rating aggregation
    const aggResult = await query(
      `SELECT 
         COUNT(*) AS total_reviews,
         COALESCE(AVG(rating), 5.0) AS average_rating
       FROM reviews
       WHERE is_approved = true`
    );

    res.json({
      success: true,
      count: result.rows.length,
      averageRating: parseFloat(aggResult.rows[0]?.average_rating || 5.0).toFixed(1),
      totalReviews: parseInt(aggResult.rows[0]?.total_reviews || 0, 10),
      reviews: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reviews
 * Customer review submission
 */
export async function submitReview(req, res, next) {
  try {
    const { author_name, rating, title, comment, location, product_id } = req.body;

    if (!author_name || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Name, rating, and review comment are required.'
      });
    }

    const numRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

    const result = await query(
      `INSERT INTO reviews (
        product_id, author_name, rating, title, comment, location,
        is_verified_purchase, is_approved, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, true, true, false)
      RETURNING *`,
      [
        product_id ? parseInt(product_id, 10) : null,
        author_name.trim(),
        numRating,
        title ? title.trim() : null,
        comment.trim(),
        location ? location.trim() : 'India'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your review! It has been published.',
      review: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: FAQs CRUD
 */
export async function createFaq(req, res, next) {
  try {
    const { question, answer, category = 'general', sort_order = 0 } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const result = await query(
      `INSERT INTO faqs (question, answer, category, sort_order, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [question, answer, category, sort_order]
    );

    res.status(201).json({ success: true, faq: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateFaq(req, res, next) {
  try {
    const { id } = req.params;
    const { question, answer, category, sort_order, is_active } = req.body;

    const result = await query(
      `UPDATE faqs
       SET question = COALESCE($1, question),
           answer = COALESCE($2, answer),
           category = COALESCE($3, category),
           sort_order = COALESCE($4, sort_order),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [question, answer, category, sort_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    res.json({ success: true, faq: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteFaq(req, res, next) {
  try {
    const { id } = req.params;
    await query('DELETE FROM faqs WHERE id = $1', [id]);
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (err) {
    next(err);
  }
}
