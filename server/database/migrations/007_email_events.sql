-- Migration 007: Email Events Tracking & Idempotency System
CREATE TABLE IF NOT EXISTS email_events (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    provider_message_id VARCHAR(255),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_order_event ON email_events(order_id, event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_recipient ON email_events(recipient);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);
