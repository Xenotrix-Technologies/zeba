-- Purpose: Add barcode column to products table for inventory management, courier labels, and product scanning
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) DEFAULT NULL;
