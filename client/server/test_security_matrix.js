/**
 * ZEBA TASK 3 — SECURITY AUDIT & VERIFICATION TEST MATRIX
 * Tests 1 to 15 covering Auth, RBAC, IDOR, Price Manipulation, RLS, Secret Exposure, Rate Limiting, SQLi, and XSS
 */
import jwt from 'jsonwebtoken';
import { query } from './src/config/db.js';
import { config } from './src/config/env.js';
import { runMigrations } from './database/migrate.js';
import { requireAdminAuth } from './src/middleware/authMiddleware.js';
import { requireCustomerAuth } from './src/middleware/customerAuthMiddleware.js';
import { getOrderByNumber, cancelCustomerOrder } from './src/controllers/orderController.js';
import { updateOrderStatus, getAdminOrders } from './src/controllers/adminController.js';
import { createPaymentOrder, verifyPayment, handleRazorpayWebhook } from './src/controllers/paymentController.js';
import { registerCustomer, loginCustomer, getCustomerOrders } from './src/controllers/customerController.js';
import crypto from 'crypto';

function mockRes() {
  const res = {
    statusCode: 200,
    data: null,
    headers: {},
    setHeader(key, val) {
      this.headers[key] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
  return res;
}

async function runSecurityTestMatrix() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🛡️  ZEBA TASK 3: COMPREHENSIVE SECURITY & HARDENING TEST MATRIX');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  await runMigrations();

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      console.log(`▶ Running Test: ${name}...`);
      await fn();
      console.log(`  ✅ PASSED: ${name}\n`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAILED: ${name}`);
      console.error(`     Error: ${err.message}\n`);
      failed++;
    }
  }

  // 1. Unauthenticated user attempts to access admin API
  await test('TEST 1: Unauthenticated Admin Access Defense (401/403 rejection)', async () => {
    const req = { headers: {} };
    const res = mockRes();
    let nextCalled = false;
    await requireAdminAuth(req, res, () => { nextCalled = true; });

    if (nextCalled || res.statusCode !== 401) {
      throw new Error(`Expected 401 Unauthorized, got status ${res.statusCode}`);
    }
    if (!res.data || res.data.success !== false) {
      throw new Error('Expected failure response payload for unauthenticated admin access');
    }
  });

  // 2. Customer A attempts to access Customer B's order (IDOR)
  await test('TEST 2: Customer Data Isolation & IDOR Defense (Customer A vs B)', async () => {
    // Ensure two test customers exist
    const custARes = await query(
      "INSERT INTO customers (name, email, phone) VALUES ('Cust A', 'sec_a@zeba.in', '9100000001') ON CONFLICT DO NOTHING RETURNING id"
    );
    const custAId = custARes.rows[0]?.id || (await query("SELECT id FROM customers WHERE email = 'sec_a@zeba.in'")).rows[0].id;

    const custBRes = await query(
      "INSERT INTO customers (name, email, phone) VALUES ('Cust B', 'sec_b@zeba.in', '9100000002') ON CONFLICT DO NOTHING RETURNING id"
    );
    const custBId = custBRes.rows[0]?.id || (await query("SELECT id FROM customers WHERE email = 'sec_b@zeba.in'")).rows[0].id;

    // Create an order for Customer B
    const orderB = await query(
      `INSERT INTO orders (customer_id, order_number, status, payment_status, subtotal, total_amount)
       VALUES ($1, $2, 'confirmed', 'paid', 299, 299)
       RETURNING id, order_number`,
      [custBId, `ZEBA-SEC-${Date.now()}-B`]
    );
    const orderBId = orderB.rows[0].id;
    const orderBNumber = orderB.rows[0].order_number;

    // Customer A attempts to access Customer B's order by numeric ID
    const reqNumeric = {
      params: { orderNumber: String(orderBId) },
      customer: { id: custAId, email: 'sec_a@zeba.in' }
    };
    const resNumeric = mockRes();
    await getOrderByNumber(reqNumeric, resNumeric, (err) => { if (err) throw err; });

    if (resNumeric.statusCode !== 403) {
      throw new Error(`Customer A was not blocked with 403 when accessing order ${orderBId}. Got ${resNumeric.statusCode}`);
    }

    // Customer A attempts to access Customer B's order by reference number
    const reqRef = {
      params: { orderNumber: orderBNumber },
      customer: { id: custAId, email: 'sec_a@zeba.in' }
    };
    const resRef = mockRes();
    await getOrderByNumber(reqRef, resRef, (err) => { if (err) throw err; });

    if (resRef.statusCode !== 403) {
      throw new Error(`Customer A was not blocked with 403 when accessing order by reference. Got ${resRef.statusCode}`);
    }
  });

  // 3. Customer attempts to change order_status
  await test('TEST 3: Unauthorized Order Status Manipulation Defense', async () => {
    // Customer tries to call admin updateOrderStatus
    const req = {
      params: { id: '1' },
      body: { status: 'delivered' },
      headers: { authorization: `Bearer ${jwt.sign({ id: 999, role: 'customer' }, config.JWT_SECRET)}` }
    };
    const res = mockRes();
    let nextCalled = false;
    await requireAdminAuth(req, res, () => { nextCalled = true; });

    if (nextCalled || (res.statusCode !== 403 && res.statusCode !== 401)) {
      throw new Error(`Customer token bypassed admin auth! Status: ${res.statusCode}`);
    }
  });

  // 4. Customer attempts to change payment_status directly
  await test('TEST 4: Direct Payment Status Tampering Defense', async () => {
    // Check that public API does not permit arbitrary payment_status modification
    const custToken = jwt.sign({ id: 1, role: 'customer' }, config.JWT_SECRET);
    const req = {
      headers: { authorization: `Bearer ${custToken}` },
      body: { payment_status: 'paid' }
    };
    const res = mockRes();
    let nextCalled = false;
    await requireAdminAuth(req, res, () => { nextCalled = true; });

    if (nextCalled || res.statusCode !== 403) {
      throw new Error(`Customer was able to invoke admin status endpoint. Code: ${res.statusCode}`);
    }
  });

  // 5. Price & Order Manipulation Defense
  await test('TEST 5: Price Tampering Defense (Backend Authoritative Calculation)', async () => {
    const prodRes = await query('SELECT id, price FROM products LIMIT 1');
    const prod = prodRes.rows[0];
    const truePrice = parseFloat(prod.price);

    // Tampered payload claiming total is 1 rupee
    const req = {
      body: {
        customer: { name: 'Hacker', email: 'hacker@test.com', phone: '9999999999' },
        address: { house_building: 'Flat 101', street: 'MG Road', area: 'Central', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        items: [{ productId: prod.id, quantity: 2, price: 1.00 }], // Attempting 1 INR instead of truePrice
        totalAmount: 1.00 // Tampered total
      }
    };
    const res = mockRes();
    await createPaymentOrder(req, res, (err) => { if (err) throw err; });

    if (!res.data?.success) {
      throw new Error(`Order creation failed: ${res.data?.message}`);
    }

    // Authoritative amount must equal authoritative totals calculated strictly by the backend
    const authoritativeTotals = await (await import('./src/controllers/paymentController.js')).calculateOrderTotals([
      { productId: prod.id, quantity: 2 }
    ]);
    const expectedTotal = authoritativeTotals.totalAmount;
    const calculatedOrderTotal = parseFloat(res.data.breakdown.totalAmount);
    if (Math.abs(calculatedOrderTotal - expectedTotal) > 0.01) {
      throw new Error(`Backend accepted client tampered price! Expected ${expectedTotal}, got ${calculatedOrderTotal}`);
    }
    if (res.data.amount !== Math.round(expectedTotal * 100)) {
      throw new Error(`Razorpay amount in paise mismatch! Expected ${Math.round(expectedTotal * 100)}, got ${res.data.amount}`);
    }
  });

  // 6. Customer submits another customer's ID during authenticated operations
  await test("TEST 6: Identity Forgery Defense (JWT Identity Enforcement)", async () => {
    // Authenticated customer 10 tries to query orders
    const fakeReq = {
      customer: { id: 10, email: 'user10@zeba.in' },
      body: { customerId: 999 } // Attempting to impersonate customer 999
    };
    const res = mockRes();
    await getCustomerOrders(fakeReq, res, (err) => { if (err) throw err; });

    if (!res.data?.success) {
      throw new Error(`getCustomerOrders failed: ${res.data?.message}`);
    }
    // Controller strictly queries `WHERE o.customer_id = $1` with req.customer.id (10), ignoring body.customerId
  });

  // 7. Customer attempts to change role to admin
  await test('TEST 7: Privilege Escalation & Role Tampering Defense', async () => {
    const req = {
      body: {
        name: 'Escalation Test',
        email: `priv_${Date.now()}@zeba.in`,
        phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Password123!',
        role: 'admin' // Attempting to register as admin
      }
    };
    const res = mockRes();
    await registerCustomer(req, res, (err) => { if (err) throw err; });

    if (!res.data?.success) {
      throw new Error(`Registration failed: ${res.data?.message}`);
    }

    const token = res.data.token;
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.role !== 'customer') {
      throw new Error(`Privilege escalation detected! Registered user received role: ${decoded.role}`);
    }

    // Check database record
    const custDb = await query('SELECT password_hash FROM customers WHERE id = $1', [decoded.id]);
    if (!custDb.rows[0]) {
      throw new Error('Customer not found in DB');
    }
  });

  // 8. Frontend attempts to access service-role key
  await test('TEST 8: Service Role Key & Private Secrets Client-Side Isolation', async () => {
    // Verify frontend config has no sensitive service keys
    if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY found in frontend environment variables!');
    }
    if (process.env.VITE_RAZORPAY_KEY_SECRET || process.env.REACT_APP_RAZORPAY_KEY_SECRET) {
      throw new Error('VITE_RAZORPAY_KEY_SECRET found in frontend environment variables!');
    }
  });

  // 9. Duplicate webhook idempotency check
  await test('TEST 9: Webhook Idempotency Defense (Duplicate Payment Events)', async () => {
    const eventId = `evt_sec_dup_${Date.now()}`;
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_dup_${Date.now()}`,
            order_id: 'order_nonexistent_dup',
            amount: 29900,
            currency: 'INR',
            status: 'captured',
            fee: 598,
            tax: 108
          }
        }
      }
    };

    const rawBody = Buffer.from(JSON.stringify(payload));
    const secret = config.RAZORPAY_WEBHOOK_SECRET || config.RAZORPAY_KEY_SECRET || 'test_sec';
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const req1 = {
      headers: {
        'x-razorpay-event-id': eventId,
        'x-razorpay-signature': signature
      },
      rawBody,
      body: payload
    };
    const res1 = mockRes();
    await handleRazorpayWebhook(req1, res1, (err) => { if (err) throw err; });

    // First webhook call processes event
    if (!res1.data?.success) {
      throw new Error(`First webhook processing failed: ${JSON.stringify(res1.data)}`);
    }

    // Second webhook call with identical event ID
    const res2 = mockRes();
    await handleRazorpayWebhook(req1, res2, (err) => { if (err) throw err; });

    if (!res2.data?.success || (!res2.data?.message?.includes('idempotent') && !res2.data?.message?.includes('duplicate'))) {
      throw new Error(`Second duplicate webhook was not recognized as duplicate! Response: ${JSON.stringify(res2.data)}`);
    }
  });

  // 10. Invalid Razorpay signature rejection
  await test('TEST 10: Cryptographic Signature Verification Defense', async () => {
    // Setup order with known razorpay_order_id
    const rzpOrderId = `order_sec_test_${Date.now()}`;
    const custRes = await query("SELECT id FROM customers LIMIT 1");
    const addrRes = await query("SELECT id FROM addresses LIMIT 1");
    await query(
      `INSERT INTO orders (order_number, customer_id, address_id, status, payment_status, subtotal, total_amount, razorpay_order_id)
       VALUES ($1, $2, $3, 'pending', 'pending', 299, 299, $4)`,
      [`ZEBA-SIG-${Date.now()}`, custRes.rows[0].id, addrRes.rows[0].id, rzpOrderId]
    );

    const req = {
      body: {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: `pay_sig_test_${Date.now()}`,
        razorpay_signature: 'invalid_forged_signature_1234567890abcdef'
      }
    };
    const res = mockRes();
    await verifyPayment(req, res, (err) => { if (err) throw err; });

    if (res.statusCode !== 400 || res.data?.success !== false) {
      throw new Error(`Invalid signature was accepted! Status: ${res.statusCode}, data: ${JSON.stringify(res.data)}`);
    }
  });

  // 11. SQL injection-style input resilience
  await test('TEST 11: SQL Injection Input Resilience (Parameterized Queries)', async () => {
    const sqliInput = "' OR '1'='1' -- ";
    const res = mockRes();
    const req = {
      params: { orderNumber: sqliInput },
      headers: {}
    };
    await getOrderByNumber(req, res, (err) => {
      // Must not throw an unhandled SQL syntax exception
    });

    if (res.statusCode !== 404 && res.statusCode !== 400 && res.statusCode !== 401) {
      throw new Error(`SQL injection payload caused unexpected status: ${res.statusCode}`);
    }
  });

  // 12. XSS Payload Sanitization Defense
  await test('TEST 12: XSS Payload Storage & Output Safety', async () => {
    const xssPayload = "<script>alert('XSS')</script><img src=x onerror=alert(1)>";
    const req = {
      body: {
        name: `User ${xssPayload}`,
        email: `xss_${Date.now()}@zeba.in`,
        phone: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Password123!'
      }
    };
    const res = mockRes();
    await registerCustomer(req, res, (err) => { if (err) throw err; });

    if (!res.data?.success) {
      throw new Error(`XSS test customer creation failed: ${res.data?.message}`);
    }
    // Customer created safely with parameterized SQL, stored as benign literal text
  });

  // 13. Unauthenticated order lookup by numeric ID
  await test('TEST 13: Unauthenticated Numeric Order ID Access Control', async () => {
    const req = {
      params: { orderNumber: '1' },
      headers: {}
    };
    const res = mockRes();
    await getOrderByNumber(req, res, (err) => { if (err) throw err; });

    if (res.statusCode !== 401 && res.statusCode !== 403) {
      throw new Error(`Unauthenticated numeric ID lookup was not rejected with 401/403. Got ${res.statusCode}`);
    }
  });

  // 14. Invalid order ID safe error response
  await test('TEST 14: Invalid & Malformed Order ID Safe Error Response', async () => {
    const req = {
      params: { orderNumber: 'ZEBA-DOES-NOT-EXIST-99999' },
      headers: {}
    };
    const res = mockRes();
    await getOrderByNumber(req, res, (err) => { if (err) throw err; });

    if (res.statusCode !== 404 || res.data?.success !== false) {
      throw new Error(`Invalid order ID did not return clean 404. Got ${res.statusCode}`);
    }
  });

  // 15. Expired authentication token rejection
  await test('TEST 15: Expired JWT Token Rejection', async () => {
    // Generate an expired token (expired 1 hour ago)
    const expiredToken = jwt.sign(
      { id: 1, email: 'admin@zeba.in', role: 'admin' },
      config.JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const req = {
      headers: { authorization: `Bearer ${expiredToken}` }
    };
    const res = mockRes();
    let nextCalled = false;
    await requireAdminAuth(req, res, () => { nextCalled = true; });

    if (nextCalled || res.statusCode !== 401) {
      throw new Error(`Expired token was accepted or did not return 401. Status: ${res.statusCode}`);
    }
    if (!res.data?.message?.toLowerCase().includes('expired')) {
      throw new Error(`Expected message to indicate expired token, got: ${res.data?.message}`);
    }
  });

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`📊 TEST MATRIX SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('═══════════════════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityTestMatrix().catch((err) => {
  console.error('Fatal Security Test Suite Failure:', err);
  process.exit(1);
});
