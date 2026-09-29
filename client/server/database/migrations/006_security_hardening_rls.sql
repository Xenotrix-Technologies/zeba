-- Migration: 006_security_hardening_rls.sql
-- Purpose: Enable Row Level Security (RLS) on all production tables and create public read/write policies

ALTER TABLE IF EXISTS admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS b2b_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Active Products" ON products;
CREATE POLICY "Public Read Active Products" ON products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Store Settings" ON store_settings;
CREATE POLICY "Public Read Store Settings" ON store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Site Content" ON site_content;
CREATE POLICY "Public Read Site Content" ON site_content FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Active FAQs" ON faqs;
CREATE POLICY "Public Read Active FAQs" ON faqs FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Approved Reviews" ON reviews;
CREATE POLICY "Public Read Approved Reviews" ON reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Public Submit Contact Message" ON contact_messages;
CREATE POLICY "Public Submit Contact Message" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Submit Review" ON reviews;
CREATE POLICY "Public Submit Review" ON reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Submit B2B Inquiry" ON b2b_inquiries;
CREATE POLICY "Public Submit B2B Inquiry" ON b2b_inquiries FOR INSERT WITH CHECK (true);
