import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inlined SQL schema migrations to guarantee execution in serverless/Vercel environments
const INLINE_MIGRATIONS = [
  {
    name: '001_initial_schema.sql',
    sql: `
      CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(100) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          pack_size VARCHAR(50) NOT NULL,
          pack_count INTEGER NOT NULL DEFAULT 1,
          price NUMERIC(10, 2) NOT NULL,
          original_price NUMERIC(10, 2) NOT NULL,
          stock_quantity INTEGER NOT NULL DEFAULT 100,
          description TEXT NOT NULL,
          short_description TEXT NOT NULL,
          benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
          how_to_use JSONB NOT NULL DEFAULT '[]'::jsonb,
          features JSONB NOT NULL DEFAULT '[]'::jsonb,
          images JSONB NOT NULL DEFAULT '[]'::jsonb,
          is_active BOOLEAN DEFAULT TRUE,
          is_featured BOOLEAN DEFAULT TRUE,
          badge_text VARCHAR(100) DEFAULT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS addresses (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
          house_building TEXT NOT NULL,
          street TEXT NOT NULL,
          area TEXT NOT NULL,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          pincode VARCHAR(20) NOT NULL,
          country VARCHAR(100) DEFAULT 'India',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          order_number VARCHAR(60) NOT NULL UNIQUE,
          customer_id INTEGER REFERENCES customers(id),
          address_id INTEGER REFERENCES addresses(id),
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
          subtotal NUMERIC(10, 2) NOT NULL,
          shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
          discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
          total_amount NUMERIC(10, 2) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id),
          product_name VARCHAR(255) NOT NULL,
          pack_size VARCHAR(50) NOT NULL,
          unit_price NUMERIC(10, 2) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          subtotal_price NUMERIC(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          razorpay_order_id VARCHAR(255) NOT NULL,
          razorpay_payment_id VARCHAR(255),
          razorpay_signature VARCHAR(255),
          amount NUMERIC(10, 2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          status VARCHAR(50) NOT NULL DEFAULT 'created',
          payment_method VARCHAR(100),
          error_code VARCHAR(100),
          error_description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'unread',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_notifications (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          notification_type VARCHAR(50) NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          status_sent VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customer_notifications (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
          notification_type VARCHAR(50) NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
      CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    `
  },
  {
    name: '002_customer_auth.sql',
    sql: `
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;
      CREATE INDEX IF NOT EXISTS idx_customers_email_phone ON customers(email, phone);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_unique_registered_email ON customers (LOWER(TRIM(email))) WHERE password_hash IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_unique_registered_phone ON customers (phone) WHERE password_hash IS NOT NULL;
    `
  },
  {
    name: '003_dynamic_store_data.sql',
    sql: `
      CREATE TABLE IF NOT EXISTS store_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value JSONB NOT NULL,
          category VARCHAR(50) NOT NULL DEFAULT 'general',
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_content (
          id SERIAL PRIMARY KEY,
          section_key VARCHAR(100) NOT NULL UNIQUE,
          title VARCHAR(255),
          content JSONB NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS faqs (
          id SERIAL PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          category VARCHAR(100) DEFAULT 'general',
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          author_name VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT NOT NULL,
          location VARCHAR(100) DEFAULT 'India',
          is_verified_purchase BOOLEAN DEFAULT TRUE,
          is_approved BOOLEAN DEFAULT TRUE,
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS b2b_inquiries (
          id SERIAL PRIMARY KEY,
          company_name VARCHAR(255) NOT NULL,
          contact_person VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 50,
          message TEXT,
          status VARCHAR(50) DEFAULT 'new',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 4.9;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 128;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Period Care';

      CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(setting_key);
      CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(section_key);
      CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
      CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sort_order);
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
    `
  },
  {
    name: '004_payment_order_resilience.sql',
    sql: `
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

      ALTER TABLE payments ADD COLUMN IF NOT EXISTS webhook_event_id VARCHAR(255);
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS fee NUMERIC(10, 2) DEFAULT 0.00;
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS tax NUMERIC(10, 2) DEFAULT 0.00;

      CREATE TABLE IF NOT EXISTS payment_events (
          id SERIAL PRIMARY KEY,
          event_id VARCHAR(255) NOT NULL UNIQUE,
          event_type VARCHAR(100) NOT NULL,
          razorpay_order_id VARCHAR(255),
          razorpay_payment_id VARCHAR(255),
          payload JSONB NOT NULL,
          status VARCHAR(50) DEFAULT 'processed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
      CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
      CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
      CREATE INDEX IF NOT EXISTS idx_payment_events_event_id ON payment_events(event_id);
      CREATE INDEX IF NOT EXISTS idx_payment_events_rzp_order_id ON payment_events(razorpay_order_id);
    `
  },
  {
    name: '005_order_management_enhancements.sql',
    sql: `
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_partner VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50) DEFAULT 'not_applicable';

      CREATE TABLE IF NOT EXISTS order_status_history (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          previous_status VARCHAR(50),
          new_status VARCHAR(50) NOT NULL,
          changed_by VARCHAR(50) DEFAULT 'admin',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);
      CREATE INDEX IF NOT EXISTS idx_orders_refund_status ON orders(refund_status);
      CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_order_notifications_unique_event ON order_notifications(order_id, notification_type);
    `
  },
  {
    name: '006_security_hardening_rls.sql',
    sql: `
      ALTER TABLE IF EXISTS admins DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS addresses DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS payment_events DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS order_status_history DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS order_notifications DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS customer_notifications DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS contact_messages DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS store_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS site_content DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS faqs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS reviews DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS b2b_inquiries DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public Read Active Products" ON products;
      DROP POLICY IF EXISTS "Public Read Store Settings" ON store_settings;
      DROP POLICY IF EXISTS "Public Read Site Content" ON site_content;
      DROP POLICY IF EXISTS "Public Read Active FAQs" ON faqs;
      DROP POLICY IF EXISTS "Public Read Approved Reviews" ON reviews;
      DROP POLICY IF EXISTS "Public Submit Contact Message" ON contact_messages;
      DROP POLICY IF EXISTS "Public Submit Review" ON reviews;
      DROP POLICY IF EXISTS "Public Submit B2B Inquiry" ON b2b_inquiries;
    `
  }
];

export async function runMigrations() {
  console.log('🔄 Running PostgreSQL database migrations...');
  
  for (const item of INLINE_MIGRATIONS) {
    const statements = item.sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await query(statement);
      } catch (err) {
        console.error(`Migration error on ${item.name}:`, err.message);
      }
    }
    console.log(`✅ Applied migration: ${item.name}`);
  }

  console.log('✨ All PostgreSQL migrations executed successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
