-- ==============================================================================
-- Migration: 015_cod_otp_verifications.sql
-- Description: Cash on Delivery (COD) Email OTP Verification & Handling Fee
-- ==============================================================================

-- 1. Ensure orders table has payment_method, cod_handling_fee, and email_verified_at
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'Razorpay Online';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cod_handling_fee NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

-- 2. Create COD OTP Verifications table for secure, hashed, single-use email verification
CREATE TABLE IF NOT EXISTS cod_otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_token VARCHAR(255) UNIQUE,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    order_number VARCHAR(100),
    cart_hash VARCHAR(100),
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cod_otp_email ON cod_otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_cod_otp_token ON cod_otp_verifications(verification_token);
CREATE INDEX IF NOT EXISTS idx_cod_otp_expires ON cod_otp_verifications(expires_at);
