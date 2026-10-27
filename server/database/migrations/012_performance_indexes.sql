-- ZEBA Performance Indexes Migration
-- 012_performance_indexes.sql

-- Index for active product queries ordered by pack_count (storefront listings & variant resolution)
CREATE INDEX IF NOT EXISTS idx_products_active_pack ON products (is_active, pack_count);

-- Composite index for reviews filtered by approval and ordered by featured & recency
CREATE INDEX IF NOT EXISTS idx_reviews_approved_featured_created ON reviews (is_approved, is_featured DESC, created_at DESC);

-- Composite index for FAQs filtered by active status and ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_faqs_active_sort ON faqs (is_active, sort_order ASC, id ASC);
