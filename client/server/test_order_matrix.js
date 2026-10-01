/**
 * ZEBA TASK 2 — Order System Comprehensive Verification Matrix
 * Executes Tests 1 through 11 against the live database and API endpoints
 */
import { query } from './src/config/db.js';
import { runMigrations } from './database/migrate.js';
import {
  calculateOrderTotals,
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure
} from './src/controllers/paymentController.js';
import {
  updateOrderStatus,
  validateStatusTransition,
  getAdminOrders,
  getAdminOrderDetail
} from './src/controllers/adminController.js';
import {
  getOrderByNumber,
  trackOrder,
  cancelCustomerOrder
} from './src/controllers/orderController.js';
import { getCustomerOrders } from './src/controllers/customerController.js';

function mockRes() {
  const res = {
    statusCode: 200,
    data: null,
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

async function runTestMatrix() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🧪 ZEBA TASK 2: ORDER MANAGEMENT & LIFECYCLE TEST MATRIX');
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

  // Get active product for testing
  const prodRes = await query('SELECT * FROM products WHERE is_active = true LIMIT 1');
  if (prodRes.rows.length === 0) {
    throw new Error('No active products found in DB for testing.');
  }
  const testProduct = prodRes.rows[0];

  let testOrderId = null;
  let testOrderNumber = null;
  let testRzpOrderId = null;
  let testRzpPaymentId = null;

  // -------------------------------------------------------------
  // Test 1: New Paid Order Creation & Verification
  // -------------------------------------------------------------
  await test('Test 1 — New paid order creation & verification', async () => {
    const reqCreate = {
      body: {
        items: [{ id: testProduct.id, quantity: 2 }],
        customer: {
          name: 'Zeba Test Buyer',
          email: `zeba_buyer_${Date.now()}@example.com`,
          phone: '9876543210'
        },
        address: {
          house_building: 'Flat 402, Lotus Tower',
          street: 'MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001'
        }
      }
    };
    const resCreate = mockRes();
    await createPaymentOrder(reqCreate, resCreate, (err) => { throw err; });

    if (!resCreate.data.success || !resCreate.data.orderId) {
      throw new Error('Order creation failed.');
    }

    testOrderId = resCreate.data.orderId;
    testOrderNumber = resCreate.data.orderNumber;
    testRzpOrderId = resCreate.data.razorpayOrderId;
    testRzpPaymentId = `pay_test_${Date.now()}`;

    // Verify order in pending state and frozen prices in order_items
    const orderCheck = await query('SELECT * FROM orders WHERE id = $1', [testOrderId]);
    if (orderCheck.rows[0].status !== 'pending' || orderCheck.rows[0].payment_status !== 'pending') {
      throw new Error(`Initial status mismatch. Status: ${orderCheck.rows[0].status}, Payment: ${orderCheck.rows[0].payment_status}`);
    }

    const itemCheck = await query('SELECT * FROM order_items WHERE order_id = $1', [testOrderId]);
    if (itemCheck.rows.length === 0 || parseFloat(itemCheck.rows[0].unit_price) !== parseFloat(testProduct.price)) {
      throw new Error('Historical frozen price in order_items mismatch.');
    }

    // Now Verify Payment
    const reqVerify = {
      body: {
        razorpay_order_id: testRzpOrderId,
        razorpay_payment_id: testRzpPaymentId,
        is_test_mode: true
      }
    };
    const resVerify = mockRes();
    await verifyPayment(reqVerify, resVerify, (err) => { throw err; });

    if (!resVerify.data.success || resVerify.data.order.paymentStatus !== 'paid') {
      throw new Error('Payment verification failed.');
    }

    // Check status history recorded
    const histCheck = await query('SELECT * FROM order_status_history WHERE order_id = $1', [testOrderId]);
    if (histCheck.rows.length < 2) {
      throw new Error(`Expected at least 2 status history entries (pending, confirmed), found: ${histCheck.rows.length}`);
    }
  });

  // -------------------------------------------------------------
  // Test 2: Payment Failure
  // -------------------------------------------------------------
  await test('Test 2 — Payment failure handling', async () => {
    const reqCreate = {
      body: {
        items: [{ id: testProduct.id, quantity: 1 }],
        customer: {
          name: 'Zeba Fail Buyer',
          email: `fail_${Date.now()}@example.com`,
          phone: '9876543211'
        },
        address: {
          house_building: 'House 1',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        }
      }
    };
    const resCreate = mockRes();
    await createPaymentOrder(reqCreate, resCreate, (err) => { throw err; });

    const failedOrderId = resCreate.data.orderId;
    const failedRzpOrderId = resCreate.data.razorpayOrderId;

    const reqFail = {
      body: {
        razorpay_order_id: failedRzpOrderId,
        error_code: 'BAD_REQUEST_ERROR',
        error_description: 'Payment was declined by bank'
      }
    };
    const resFail = mockRes();
    await recordPaymentFailure(reqFail, resFail, (err) => { throw err; });

    const checkFail = await query('SELECT * FROM orders WHERE id = $1', [failedOrderId]);
    if (checkFail.rows[0].payment_status !== 'failed' || checkFail.rows[0].status === 'confirmed') {
      throw new Error(`Order improperly marked. Payment status: ${checkFail.rows[0].payment_status}, Status: ${checkFail.rows[0].status}`);
    }
  });

  // -------------------------------------------------------------
  // Test 3: Admin Confirmation Transition
  // -------------------------------------------------------------
  await test('Test 3 — Admin order status update (PENDING -> CONFIRMED)', async () => {
    // Create a pending order
    const reqCreate = {
      body: {
        items: [{ id: testProduct.id, quantity: 1 }],
        customer: {
          name: 'Admin Confirm Buyer',
          email: `admin_conf_${Date.now()}@example.com`,
          phone: '9876543212'
        },
        address: {
          house_building: 'Apt 12',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        }
      }
    };
    const resCreate = mockRes();
    await createPaymentOrder(reqCreate, resCreate, (err) => { throw err; });
    const pendingOrdId = resCreate.data.orderId;

    const reqAdminUpdate = {
      params: { id: pendingOrdId },
      body: {
        status: 'confirmed',
        payment_status: 'paid',
        notes: 'Confirmed by store manager'
      },
      admin: { username: 'superadmin' }
    };
    const resAdminUpdate = mockRes();
    await updateOrderStatus(reqAdminUpdate, resAdminUpdate, (err) => { throw err; });

    if (!resAdminUpdate.data.success || resAdminUpdate.data.order.status !== 'confirmed') {
      throw new Error('Admin confirmation update failed.');
    }
  });

  // -------------------------------------------------------------
  // Test 4: Processing State Transition
  // -------------------------------------------------------------
  await test('Test 4 — Transition to PROCESSING (CONFIRMED -> PROCESSING)', async () => {
    const reqAdmin = {
      params: { id: testOrderId },
      body: {
        status: 'processing',
        notes: 'Order dispatched to packaging team'
      },
      admin: { username: 'fulfillment_lead' }
    };
    const resAdmin = mockRes();
    await updateOrderStatus(reqAdmin, resAdmin, (err) => { throw err; });

    if (!resAdmin.data.success || resAdmin.data.order.status !== 'processing') {
      throw new Error(`Expected status processing, got: ${resAdmin.data.order?.status}`);
    }

    const hist = await query(
      'SELECT * FROM order_status_history WHERE order_id = $1 AND new_status = $2',
      [testOrderId, 'processing']
    );
    if (hist.rows.length === 0) {
      throw new Error('Order status history entry for processing missing.');
    }
  });

  // -------------------------------------------------------------
  // Test 5: Shipped State Transition with Tracking
  // -------------------------------------------------------------
  await test('Test 5 — Transition to SHIPPED (PROCESSING -> SHIPPED with tracking)', async () => {
    const reqAdmin = {
      params: { id: testOrderId },
      body: {
        status: 'shipped',
        courier_partner: 'Blue Dart Express',
        tracking_number: 'BD-889920119',
        estimated_delivery_date: '2026-10-05',
        notes: 'Dispatched in discreet plain packaging'
      },
      admin: { username: 'shipping_desk' }
    };
    const resAdmin = mockRes();
    await updateOrderStatus(reqAdmin, resAdmin, (err) => { throw err; });

    if (!resAdmin.data.success || resAdmin.data.order.status !== 'shipped') {
      throw new Error(`Expected status shipped, got: ${resAdmin.data.order?.status}`);
    }

    const check = await query('SELECT * FROM orders WHERE id = $1', [testOrderId]);
    if (check.rows[0].tracking_number !== 'BD-889920119' || check.rows[0].courier_partner !== 'Blue Dart Express') {
      throw new Error('Courier tracking details not saved in orders table.');
    }
  });

  // -------------------------------------------------------------
  // Test 6: Delivered State Transition
  // -------------------------------------------------------------
  await test('Test 6 — Transition to DELIVERED (SHIPPED -> DELIVERED)', async () => {
    const reqAdmin = {
      params: { id: testOrderId },
      body: {
        status: 'delivered',
        notes: 'Delivered and signed by recipient'
      },
      admin: { username: 'courier_webhook' }
    };
    const resAdmin = mockRes();
    await updateOrderStatus(reqAdmin, resAdmin, (err) => { throw err; });

    if (!resAdmin.data.success || resAdmin.data.order.status !== 'delivered') {
      throw new Error(`Expected status delivered, got: ${resAdmin.data.order?.status}`);
    }

    const check = await query('SELECT * FROM orders WHERE id = $1', [testOrderId]);
    if (!check.rows[0].delivered_at) {
      throw new Error('delivered_at timestamp was not populated.');
    }
  });

  // -------------------------------------------------------------
  // Test 7: Order Cancellation & Inventory Stock Restoration
  // -------------------------------------------------------------
  await test('Test 7 — Eligible order cancellation & stock restoration', async () => {
    // 1. Get initial stock
    const initialProductRes = await query('SELECT stock_quantity FROM products WHERE id = $1', [testProduct.id]);
    const initialStock = parseInt(initialProductRes.rows[0].stock_quantity, 10);

    // 2. Create and confirm order (which deducts 3 units)
    const reqCreate = {
      body: {
        items: [{ id: testProduct.id, quantity: 3 }],
        customer: {
          name: 'Cancel Test Buyer',
          email: `cancel_buyer_${Date.now()}@example.com`,
          phone: '9876543213'
        },
        address: {
          house_building: 'Villa 5',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001'
        }
      }
    };
    const resCreate = mockRes();
    await createPaymentOrder(reqCreate, resCreate, (err) => { throw err; });
    const cancelOrderId = resCreate.data.orderId;
    const cancelOrderNum = resCreate.data.orderNumber;

    // Verify payment to deduct stock
    const reqVerify = {
      body: {
        razorpay_order_id: resCreate.data.razorpayOrderId,
        razorpay_payment_id: `pay_cancel_${Date.now()}`,
        is_test_mode: true
      }
    };
    const resVerify = mockRes();
    await verifyPayment(reqVerify, resVerify, (err) => { throw err; });

    const postDeductRes = await query('SELECT stock_quantity FROM products WHERE id = $1', [testProduct.id]);
    const stockAfterDeduct = parseInt(postDeductRes.rows[0].stock_quantity, 10);
    if (stockAfterDeduct !== initialStock - 3) {
      throw new Error(`Stock was not deducted correctly. Expected ${initialStock - 3}, got ${stockAfterDeduct}`);
    }

    // 3. Customer cancels order
    const reqCancel = {
      params: { orderNumber: cancelOrderNum },
      body: {
        phone: '9876543213',
        reason: 'Customer placed duplicate order by mistake'
      }
    };
    const resCancel = mockRes();
    await cancelCustomerOrder(reqCancel, resCancel, (err) => { throw err; });

    if (!resCancel.data.success || resCancel.data.order.status !== 'cancelled') {
      throw new Error('Order status was not updated to cancelled.');
    }

    // 4. Verify Stock was restored
    const restoredRes = await query('SELECT stock_quantity FROM products WHERE id = $1', [testProduct.id]);
    const stockAfterRestore = parseInt(restoredRes.rows[0].stock_quantity, 10);
    if (stockAfterRestore !== initialStock) {
      throw new Error(`Stock restoration failed. Expected ${initialStock}, got ${stockAfterRestore}`);
    }

    // 5. Verify payment status is still PAID and refund status is REQUESTED
    const finalOrderRes = await query('SELECT * FROM orders WHERE id = $1', [cancelOrderId]);
    if (finalOrderRes.rows[0].payment_status !== 'paid' || finalOrderRes.rows[0].refund_status !== 'requested') {
      throw new Error(`Payment/Refund status mismatch on cancelled paid order. Payment: ${finalOrderRes.rows[0].payment_status}, Refund: ${finalOrderRes.rows[0].refund_status}`);
    }
  });

  // -------------------------------------------------------------
  // Test 8: Duplicate Status Update (Idempotency)
  // -------------------------------------------------------------
  await test('Test 8 — Duplicate status update idempotency', async () => {
    const reqAdmin = {
      params: { id: testOrderId },
      body: {
        status: 'delivered', // Already delivered
        notes: 'Duplicate delivered trigger'
      },
      admin: { username: 'admin' }
    };
    const resAdmin = mockRes();
    await updateOrderStatus(reqAdmin, resAdmin, (err) => { throw err; });

    if (!resAdmin.data.success) {
      throw new Error('Idempotent status update failed.');
    }

    // Count notifications for delivered
    const notifs = await query(
      "SELECT COUNT(*) AS count FROM order_notifications WHERE order_id = $1 AND notification_type = 'email_status_delivered'",
      [testOrderId]
    );
    if (parseInt(notifs.rows[0].count, 10) > 1) {
      throw new Error(`Duplicate notification sent! Count: ${notifs.rows[0].count}`);
    }
  });

  // -------------------------------------------------------------
  // Test 9: Unauthorized Customer Order Access
  // -------------------------------------------------------------
  await test('Test 9 — Unauthorized customer cancellation rejection', async () => {
    // Attempt to cancel with wrong phone/email
    const reqUnauthorized = {
      params: { orderNumber: testOrderNumber },
      body: {
        phone: '0000000000',
        email: 'attacker@evil.com'
      }
    };
    const resUnauthorized = mockRes();
    await cancelCustomerOrder(reqUnauthorized, resUnauthorized, (err) => { throw err; });

    if (resUnauthorized.statusCode !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for unauthorized access, received ${resUnauthorized.statusCode}`);
    }
  });

  // -------------------------------------------------------------
  // Test 10: Invalid Status Transition Rejection
  // -------------------------------------------------------------
  await test('Test 10 — Invalid status transition rejection (DELIVERED -> PROCESSING)', async () => {
    const invalidCheck = validateStatusTransition('delivered', 'processing');
    if (invalidCheck.valid) {
      throw new Error('Validation allowed illegal transition from delivered to processing.');
    }

    const reqIllegal = {
      params: { id: testOrderId },
      body: { status: 'processing' },
      admin: { username: 'admin' }
    };
    const resIllegal = mockRes();
    await updateOrderStatus(reqIllegal, resIllegal, (err) => { throw err; });

    if (resIllegal.statusCode !== 400) {
      throw new Error(`Expected HTTP 400 Bad Request for illegal transition, received ${resIllegal.statusCode}`);
    }
  });

  // -------------------------------------------------------------
  // Test 11: Public Tracking Endpoint & Consolidated Details
  // -------------------------------------------------------------
  await test('Test 11 — Public tracking & consolidated order lookup', async () => {
    const reqTrack = { params: { orderNumber: testOrderNumber } };
    const resTrack = mockRes();
    await trackOrder(reqTrack, resTrack, (err) => { throw err; });

    if (!resTrack.data.success || !resTrack.data.tracking) {
      throw new Error('Public tracking lookup failed.');
    }
    const tracking = resTrack.data.tracking;
    if (tracking.orderNumber !== testOrderNumber || !tracking.timeline || tracking.timeline.length === 0) {
      throw new Error('Tracking timeline missing or orderNumber mismatch.');
    }

    const reqLookup = { params: { orderNumber: testOrderNumber } };
    const resLookup = mockRes();
    await getOrderByNumber(reqLookup, resLookup, (err) => { throw err; });

    if (!resLookup.data.success || !resLookup.data.order) {
      throw new Error('Order lookup by number failed.');
    }
    if (resLookup.data.order.orderNumber !== testOrderNumber) {
      throw new Error('Order lookup reference mismatch.');
    }
  });

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`📊 TEST MATRIX RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestMatrix().catch((err) => {
  console.error('Fatal error in test matrix:', err);
  process.exit(1);
});
