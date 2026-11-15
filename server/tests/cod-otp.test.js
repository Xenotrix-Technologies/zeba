process.env.NODE_ENV = 'test';

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import crypto from 'crypto';
import app from '../../api/index.js';
import { query, closeDb } from '../src/config/db.js';
import { closeEmailTransporter } from '../src/services/emailService.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  closeEmailTransporter();
  await closeDb();
});

describe('Cash on Delivery (COD) Email OTP Verification & Security Tests', () => {
  const testEmail = 'codtest_' + Date.now() + '@example.com';
  const testItems = [{ productId: 1, quantity: 1 }];
  const testCustomer = {
    name: 'Sanjay Test User',
    email: testEmail,
    phone: '9876543210'
  };
  const testAddress = {
    houseBuilding: 'Flat 402, Lotus Heights',
    street: 'MG Road',
    area: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038'
  };

  test('1. Direct unverified COD order creation on /api/payments/create-order is strictly blocked', async () => {
    const res = await fetch(`${baseUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        paymentMethod: 'cod',
        items: testItems,
        customer: testCustomer,
        address: testAddress
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /OTP verification/i);
  });

  test('2. POST /api/orders/cod/send-otp generates secure OTP record and enforces 5-min expiry', async () => {
    const res = await fetch(`${baseUrl}/api/orders/cod/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        items: testItems,
        customer: testCustomer,
        address: testAddress
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.cooldownSeconds, 60);
    assert.ok(data.emailMasked);
    assert.equal(data.otp, undefined, 'OTP must never be exposed in client response');

    // Verify record in database
    const dbRecord = await query(
      `SELECT * FROM cod_otp_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
      [testEmail]
    );

    assert.equal(dbRecord.rows.length, 1);
    const record = dbRecord.rows[0];
    assert.equal(record.verified, false);
    assert.equal(record.attempts, 0);
    assert.ok(record.otp_hash, 'OTP must be stored as cryptographic hash');
    assert.ok(record.salt, 'Salt must be present');
    assert.ok(new Date(record.expires_at) > new Date());
  });

  test('3. Enforces 60-second resend cooldown on immediate subsequent OTP requests', async () => {
    const res = await fetch(`${baseUrl}/api/orders/cod/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        items: testItems,
        customer: testCustomer,
        address: testAddress
      })
    });

    assert.equal(res.status, 429);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.cooldownSeconds > 0 && data.cooldownSeconds <= 60);
  });

  test('4. Incorrect OTP increments failed attempts and returns remaining count', async () => {
    const res = await fetch(`${baseUrl}/api/orders/cod/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        email: testEmail,
        otp: '000000'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.attemptsRemaining, 4);

    // Verify database attempts count updated
    const dbRecord = await query(
      `SELECT attempts FROM cod_otp_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
      [testEmail]
    );
    assert.equal(dbRecord.rows[0].attempts, 1);
  });

  test('5. Blocks verification after 5 failed attempts', async () => {
    // Submit 4 more wrong attempts
    for (let i = 0; i < 4; i++) {
      await fetch(`${baseUrl}/api/orders/cod/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
        body: JSON.stringify({
          email: testEmail,
          otp: '111111'
        })
      });
    }

    // 6th attempt should be blocked with 429
    const blockedRes = await fetch(`${baseUrl}/api/orders/cod/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        email: testEmail,
        otp: '111111'
      })
    });

    assert.equal(blockedRes.status, 429);
    const data = await blockedRes.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Maximum verification attempts/i);
  });

  test('6. Expired OTP fails verification', async () => {
    const expiredEmail = 'expired_' + Date.now() + '@example.com';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update('123456' + salt).digest('hex');

    // Insert an expired record
    await query(
      `INSERT INTO cod_otp_verifications (email, otp_hash, salt, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() - INTERVAL '10 seconds', NOW() - INTERVAL '6 minutes')`,
      [expiredEmail, hash, salt]
    );

    const res = await fetch(`${baseUrl}/api/orders/cod/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        email: expiredEmail,
        otp: '123456'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /expired/i);
  });

  test('7. Valid OTP succeeds, generates single-use verification token', async () => {
    const validEmail = 'valid_' + Date.now() + '@example.com';
    const rawOtp = '789123';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(rawOtp + salt).digest('hex');

    await query(
      `INSERT INTO cod_otp_verifications (email, otp_hash, salt, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`,
      [validEmail, hash, salt]
    );

    const res = await fetch(`${baseUrl}/api/orders/cod/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        email: validEmail,
        otp: rawOtp
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.verificationToken);
    assert.equal(typeof data.verificationToken, 'string');

    // Confirm that DB marked it verified
    const dbRecord = await query(
      `SELECT * FROM cod_otp_verifications WHERE verification_token = $1`,
      [data.verificationToken]
    );
    assert.equal(dbRecord.rows.length, 1);
    assert.equal(dbRecord.rows[0].verified, true);
    assert.equal(dbRecord.rows[0].used, false);
  });

  test('8. Full COD Order Confirmation: Calculates ₹20 COD fee and creates order successfully', async () => {
    const orderEmail = 'order_' + Date.now() + '@example.com';
    const rawOtp = '456789';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(rawOtp + salt).digest('hex');

    await query(
      `INSERT INTO cod_otp_verifications (email, otp_hash, salt, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`,
      [orderEmail, hash, salt]
    );

    // Verify OTP
    const verifyRes = await fetch(`${baseUrl}/api/orders/cod/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({ email: orderEmail, otp: rawOtp })
    });
    const { verificationToken } = await verifyRes.json();
    assert.ok(verificationToken);

    // Confirm COD order
    const confirmRes = await fetch(`${baseUrl}/api/orders/cod/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        verificationToken,
        items: [{ productId: 1, quantity: 1 }],
        customer: {
          name: 'Sanjay Customer',
          email: orderEmail,
          phone: '9876543210'
        },
        address: testAddress,
        notes: 'Please call before delivery'
      })
    });

    assert.equal(confirmRes.status, 201);
    const orderData = await confirmRes.json();
    assert.equal(orderData.success, true);
    assert.equal(orderData.isCod, true);
    assert.ok(orderData.orderNumber);

    // Authoritative calculation check: ₹20 COD fee must be included
    assert.equal(orderData.breakdown.codHandlingFee, 20.00);
    assert.equal(
      orderData.breakdown.totalAmount,
      orderData.breakdown.subtotal + orderData.breakdown.shippingFee + 20.00
    );

    // Database verification
    const orderInDb = await query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderData.orderId]
    );
    assert.equal(orderInDb.rows.length, 1);
    const ord = orderInDb.rows[0];
    assert.equal(ord.payment_method, 'Cash on Delivery');
    assert.equal(ord.payment_status, 'pending');
    assert.equal(ord.status, 'confirmed');
    assert.equal(parseFloat(ord.cod_handling_fee), 20.00);
    assert.ok(ord.email_verified_at);

    // Verify that the token is now marked used (Single-use enforcement)
    const tokenRecord = await query(
      `SELECT used FROM cod_otp_verifications WHERE verification_token = $1`,
      [verificationToken]
    );
    assert.equal(tokenRecord.rows[0].used, true);
  });

  test('9. Reusing an already-used verification token fails (Duplicate order prevention)', async () => {
    // Create and consume a token
    const reuseEmail = 'reuse_' + Date.now() + '@example.com';
    const token = 'token_already_used_' + Date.now();

    await query(
      `INSERT INTO cod_otp_verifications (email, otp_hash, salt, expires_at, verified, verified_at, verification_token, used)
       VALUES ($1, 'dummy_hash', 'dummy_salt', NOW() + INTERVAL '10 minutes', true, NOW(), $2, true)`,
      [reuseEmail, token]
    );

    const res = await fetch(`${baseUrl}/api/orders/cod/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        verificationToken: token,
        items: [{ productId: 1, quantity: 1 }],
        customer: { name: 'Reuser', email: reuseEmail, phone: '9876543210' },
        address: testAddress
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /already been used/i);
  });

  test('10. Order lookup GET /api/orders/:orderNumber reflects COD handling fee and payment method', async () => {
    const lookupEmail = 'lookup_' + Date.now() + '@example.com';
    const token = 'token_lookup_' + Date.now();

    await query(
      `INSERT INTO cod_otp_verifications (email, otp_hash, salt, expires_at, verified, verified_at, verification_token, token_expires_at, used)
       VALUES ($1, 'hash', 'salt', NOW() + INTERVAL '10 minutes', true, NOW(), $2, NOW() + INTERVAL '10 minutes', false)`,
      [lookupEmail, token]
    );

    const confirmRes = await fetch(`${baseUrl}/api/orders/cod/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' },
      body: JSON.stringify({
        verificationToken: token,
        items: [{ productId: 1, quantity: 1 }],
        customer: { name: 'Lookup User', email: lookupEmail, phone: '9123456789' },
        address: testAddress
      })
    });

    const { orderNumber } = await confirmRes.json();

    const getRes = await fetch(`${baseUrl}/api/orders/${orderNumber}`);
    assert.equal(getRes.status, 200);
    const data = await getRes.json();
    assert.equal(data.success, true);
    assert.equal(data.order.paymentMethod, 'Cash on Delivery');
    assert.equal(data.order.paymentStatus, 'pending');
    assert.equal(data.order.codHandlingFee, 20.00);
  });
});
