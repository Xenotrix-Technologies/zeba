-- Migration: 013_customer_google_auth.sql
-- Purpose: Add google_id and avatar_url columns to customers table and make phone nullable for Google SSO

ALTER TABLE customers ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_google_id ON customers(google_id) WHERE google_id IS NOT NULL;

