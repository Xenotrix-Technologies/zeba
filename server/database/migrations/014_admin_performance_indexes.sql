-- ZEBA Performance Indexes for Admin Operations & Dashboard
-- 014_admin_performance_indexes.sql

-- Fast lookup for recent orders and date-based sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON orders (created_at DESC);

-- Composite index for status filtering and timeline ordering
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);

-- Composite index for payment status filtering and revenue aggregation
CREATE INDEX IF NOT EXISTS idx_orders_payment_created ON orders (payment_status, created_at DESC);

-- Composite index for customer order history and spend aggregation
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders (customer_id, created_at DESC);

-- Index for payment method subquery on order listings
CREATE INDEX IF NOT EXISTS idx_payments_order_id_desc ON payments (order_id, id DESC);

-- Index for customer addresses subquery on customer listings
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id_desc ON addresses (customer_id, id DESC);

-- Index for unread messages count and recent messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages (status, created_at DESC);

-- Composite index for item quantities and product summary lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_qty ON order_items (order_id, quantity);
