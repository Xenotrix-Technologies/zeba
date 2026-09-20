-- 002_customer_auth.sql
-- Add password_hash and auth columns to customers table if not exist

ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_customers_email_phone ON customers(email, phone);
