-- Migration: 009_product_original_price_toggle.sql
-- Purpose: Add show_original_price toggle column to products table to allow enabling/disabling strikethrough compare-at price

ALTER TABLE products ADD COLUMN IF NOT EXISTS show_original_price BOOLEAN DEFAULT TRUE;
UPDATE products SET show_original_price = TRUE WHERE show_original_price IS NULL;
