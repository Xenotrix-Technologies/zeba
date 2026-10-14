-- Purpose: Add barcode_image column to products table for storing barcode image uploads/URLs
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode_image TEXT DEFAULT NULL;
