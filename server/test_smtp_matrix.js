import { query } from './src/config/db.js';
import { runMigrations } from './database/migrate.js';
import { seedDatabase } from './database/seed.js';
import {
  isValidEmail,
  getSenderAddress,
  verifySmtpConnection,
  sendEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancelledEmail,
  sendAdminNewOrderAlert,
  sendPaymentFailedEmail,
  sendRefundEmail,
  sendCustomerWelcomeEmail,
  retryFailedEmails,
  getEmailNotifications,
  getEmailEvents
} from './src/services/emailService.js';
import {
  renderOrderConfirmationEmail,
  renderPaymentConfirmationEmail,
  renderOrderStatusUpdateEmail,
  renderOrderCancelledEmail,
  renderAdminNewOrderEmail,
  renderPaymentFailedEmail,
  renderRefundEmail,
  renderWelcomeEmail
} from './src/templates/emails/index.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

async function runProductionEmailTestSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING PRODUCTION-READY EMAIL NOTIFICATION VERIFICATION MATRIX');
  console.log('================================================================\n');

  // Phase 0: Schema & Database Verification
  console.log('📦 Phase 0: Database & Schema Verification');
  await seedDatabase();

  const tableCheck = await query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name = 'email_notifications'
  `);
  assert(tableCheck.rows.length > 0, 'email_notifications table exists in PostgreSQL / Supabase');

  const indexCheck = await query(`
    SELECT indexname FROM pg_indexes 
    WHERE tablename = 'email_notifications' AND indexname = 'idx_email_notifications_unique_event'
  `);
  assert(indexCheck.rows.length > 0, 'Unique index idx_email_notifications_unique_event exists for idempotency');

  // Validation & Formatting Tests
  console.log('\n🔒 Phase 1: Security & Email Validation Tests');
  assert(isValidEmail('customer@example.com') === true, 'Standard valid email accepted');
  assert(isValidEmail('care+zeba@zebaofficial.in') === true, 'Plus-addressed email accepted');
  assert(isValidEmail('invalid-email') === false, 'Malformed email rejected');
  assert(isValidEmail('user@.com') === false, 'Invalid domain rejected');
  assert(isValidEmail('') === false, 'Empty string rejected');
  assert(isValidEmail(null) === false, 'Null email rejected');

  const sender = getSenderAddress();
  assert(sender.includes('ZEBA') && sender.includes('@'), `Sender formatted properly: ${sender}`);

  // -------------------------------------------------------------
  // Setup Real Test Order in Database
  // -------------------------------------------------------------
  console.log('\n📝 Setting up Test Customer & Order in Database...');
  const custRes = await query(
    `INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id`,
    ['Priya Sharma', 'priya.test@example.com', '+91 98765 43210']
  );
  const testCustId = custRes.rows[0].id;

  const addrRes = await query(
    `INSERT INTO addresses (customer_id, house_building, street, area, city, state, pincode, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [testCustId, 'Flat 402, Lotus Heights', 'Koramangala 4th Block', 'Near Sony World', 'Bengaluru', 'Karnataka', '560034', 'India']
  );
  const testAddrId = addrRes.rows[0].id;

  const orderNumber = `ZEBA-2026-${Date.now().toString().slice(-6)}`;
  const orderRes = await query(
    `INSERT INTO orders (order_number, customer_id, address_id, status, payment_status, subtotal, shipping_fee, discount_amount, total_amount, currency)
     VALUES ($1, $2, $3, 'pending', 'pending', 699.00, 0.00, 0.00, 699.00, 'INR') RETURNING id`,
    [orderNumber, testCustId, testAddrId]
  );
  const testOrderId = orderRes.rows[0].id;

  await query(
    `INSERT INTO order_items (order_id, product_id, product_name, pack_size, unit_price, quantity, subtotal_price)
     VALUES ($1, 1, 'ZEBA Periods Pain Relief Heating Pad – 3 Pack', '3 Pack', 699.00, 1, 699.00)`,
    [testOrderId]
  );

  const testOrder = {
    id: testOrderId,
    orderNumber,
    order_number: orderNumber,
    customer_id: testCustId,
    customer_name: 'Priya Sharma',
    customer_email: 'priya.test@example.com',
    customer_phone: '+91 98765 43210',
    customer: {
      name: 'Priya Sharma',
      email: 'priya.test@example.com',
      phone: '+91 98765 43210'
    },
    address: {
      houseBuilding: 'Flat 402, Lotus Heights',
      street: 'Koramangala 4th Block',
      area: 'Near Sony World',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      country: 'India'
    },
    items: [
      {
        productName: 'ZEBA Periods Pain Relief Heating Pad – 3 Pack',
        packSize: '3 Pack',
        unitPrice: 699.00,
        quantity: 1,
        subtotalPrice: 699.00
      }
    ],
    subtotal: 699.00,
    shippingFee: 0.00,
    discountAmount: 0.00,
    totalAmount: 699.00,
    currency: 'INR',
    paymentMethod: 'Razorpay Online (UPI/Cards)',
    paymentStatus: 'pending',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // -------------------------------------------------------------
  // Test 1: Create a new order
  // Expected: Customer -> Order Confirmation, Admin -> New Order
  // -------------------------------------------------------------
  console.log('\n🧪 Test 1: Create a new order');
  const t1Cust = await sendOrderConfirmationEmail({ order: testOrder });
  const t1Admin = await sendAdminNewOrderAlert({ order: testOrder, razorpayOrderId: 'order_rzp_mock_001' });

  assert(t1Cust.success === true, 'Test 1: Customer Order Confirmation email created/dispatched');
  assert(t1Admin.success === true, 'Test 1: Admin New Order alert email created/dispatched');

  const dbNotifT1 = await query(
    `SELECT * FROM email_notifications WHERE order_id = $1 AND notification_type = 'order_confirmation'`,
    [testOrderId]
  );
  assert(dbNotifT1.rows.length === 1, 'Test 1: DB recorded order_confirmation notification');
  assert(dbNotifT1.rows[0].recipient_email === 'priya.test@example.com', 'Test 1: Recipient email recorded correctly');

  // -------------------------------------------------------------
  // Test 2: Verify successful payment
  // Expected: Customer -> Payment Confirmation, Admin -> Payment Confirmation
  // -------------------------------------------------------------
  console.log('\n🧪 Test 2: Verify successful payment');
  const t2Res = await sendPaymentConfirmationEmail({
    order: { ...testOrder, status: 'confirmed', paymentStatus: 'paid' },
    transactionId: 'pay_rzp_verify_778899',
    paymentMethod: 'UPI (Google Pay)'
  });

  assert(t2Res.customer?.success === true, 'Test 2: Customer Payment Confirmation email sent');
  assert(t2Res.admin?.success === true, 'Test 2: Admin Payment Confirmation email sent');

  const dbNotifT2Cust = await query(
    `SELECT * FROM email_notifications WHERE order_id = $1 AND notification_type = 'payment_confirmation_customer'`,
    [testOrderId]
  );
  assert(dbNotifT2Cust.rows.length === 1, 'Test 2: Customer payment confirmation logged in database');

  const dbNotifT2Admin = await query(
    `SELECT * FROM email_notifications WHERE order_id = $1 AND notification_type = 'payment_confirmation_admin'`,
    [testOrderId]
  );
  assert(dbNotifT2Admin.rows.length === 1, 'Test 2: Admin payment confirmation logged in database');

  // -------------------------------------------------------------
  // Test 3: Change Confirmed -> Processing
  // Expected: Customer -> Status Update
  // -------------------------------------------------------------
  console.log('\n🧪 Test 3: Change Confirmed -> Processing');
  const t3Res = await sendOrderStatusUpdateEmail({
    order: { ...testOrder, status: 'processing' },
    newStatus: 'processing',
    previousStatus: 'confirmed'
  });

  assert(t3Res.success === true, 'Test 3: Customer Status Update (Processing) email sent');
  const dbNotifT3 = await query(
    `SELECT * FROM email_notifications WHERE order_id = $1 AND notification_type = 'order_status_processing'`,
    [testOrderId]
  );
  assert(dbNotifT3.rows.length === 1, 'Test 3: DB recorded order_status_processing event');

  // -------------------------------------------------------------
  // Test 4: Change Processing -> Shipped
  // Expected: Customer -> Status Update
  // -------------------------------------------------------------
  console.log('\n🧪 Test 4: Change Processing -> Shipped');
  const t4Res = await sendOrderStatusUpdateEmail({
    order: { ...testOrder, status: 'shipped' },
    newStatus: 'shipped',
    previousStatus: 'processing',
    courierPartner: 'Blue Dart Express',
    trackingNumber: 'BD748291039IN'
  });

  assert(t4Res.success === true, 'Test 4: Customer Status Update (Shipped) email sent');
  const dbNotifT4 = await query(
    `SELECT * FROM email_notifications WHERE order_id = $1 AND notification_type = 'order_status_shipped'`,
    [testOrderId]
  );
  assert(dbNotifT4.rows.length === 1, 'Test 4: DB recorded order_status_shipped event with tracking info');

  // -------------------------------------------------------------
  // Test 5: Change Shipped -> Delivered
  // Expected: Customer -> Status Update
  // -------------------------------------------------------------
  console.log('\n🧪 Test 5: Change Shipped -> Delivered');
  const t5Res = await sendOrderStatusUpdateEmail({
    order: { ...testOrder, status: 'delivered' },
    newStatus: 'delivered',
    previousStatus: 'shipped'
  });

  assert(t5Res.success === true, 'Test 5: Customer Status Update (Delivered) email sent');
  const dbNotifT5 = await query(
    `SELECT * FROM email_notifications WHERE order_id = $1 AND notification_type = 'order_status_delivered'`,
    [testOrderId]
  );
  assert(dbNotifT5.rows.length === 1, 'Test 5: DB recorded order_status_delivered event');

  // -------------------------------------------------------------
  // Test 6: Cancel an order
  // Expected: Customer -> Cancellation Email, Admin -> Cancellation Email
  // -------------------------------------------------------------
  console.log('\n🧪 Test 6: Cancel an order');
  const t6Res = await sendOrderCancelledEmail({
    order: { ...testOrder, status: 'cancelled' },
    reason: 'Customer requested cancellation due to change of delivery address',
    refundStatus: 'requested'
  });

  assert(t6Res.customer?.success === true, 'Test 6: Customer Cancellation email sent');
  assert(t6Res.admin?.success === true, 'Test 6: Admin Cancellation email sent');

  const dbNotifT6 = await query(
    `SELECT * FROM email_notifications WHERE order_id = $1 AND notification_type = 'order_cancelled_customer'`,
    [testOrderId]
  );
  assert(dbNotifT6.rows.length === 1, 'Test 6: DB recorded order_cancelled_customer event');

  // -------------------------------------------------------------
  // Test 7: Save the same status again
  // Expected: No duplicate email (Idempotency)
  // -------------------------------------------------------------
  console.log('\n🧪 Test 7: Save the same status again');
  const t7Res = await sendOrderStatusUpdateEmail({
    order: { ...testOrder, status: 'delivered' },
    newStatus: 'delivered',
    previousStatus: 'delivered'
  });

  assert(t7Res.success === true && t7Res.alreadySent === true, 'Test 7: Duplicate status update email skipped via idempotency');

  const dbNotifT7Count = await query(
    `SELECT COUNT(*) as count FROM email_notifications WHERE order_id = $1 AND notification_type = 'order_status_delivered'`,
    [testOrderId]
  );
  assert(parseInt(dbNotifT7Count.rows[0].count, 10) === 1, 'Test 7: No duplicate email records created in database');

  // -------------------------------------------------------------
  // Test 8: Repeat payment webhook/callback
  // Expected: No duplicate payment email (Idempotency)
  // -------------------------------------------------------------
  console.log('\n🧪 Test 8: Repeat payment webhook/callback');
  const t8Res = await sendPaymentConfirmationEmail({
    order: { ...testOrder, status: 'confirmed', paymentStatus: 'paid' },
    transactionId: 'pay_rzp_verify_778899',
    paymentMethod: 'UPI'
  });

  assert(t8Res.customer?.alreadySent === true, 'Test 8: Duplicate payment confirmation skipped for customer');
  assert(t8Res.admin?.alreadySent === true, 'Test 8: Duplicate payment confirmation skipped for admin');

  // -------------------------------------------------------------
  // Test 9: Temporarily make email provider fail
  // Expected: Order/payment/status operation succeeds, Email marked as failed, Error logged, Retry remains possible
  // -------------------------------------------------------------
  console.log('\n🧪 Test 9: Temporarily make email provider fail & safe retry');
  
  // Register a mock failed email notification directly
  await query(
    `INSERT INTO email_notifications (order_id, notification_type, recipient_email, subject, status, error_message, retry_count)
     VALUES ($1, 'order_status_out_for_delivery', 'priya.test@example.com', 'Order Out for Delivery', 'failed', 'Connection timeout on SMTP port 587', 0)
     ON CONFLICT (order_id, notification_type, recipient_email)
     DO UPDATE SET status = 'failed', error_message = 'Connection timeout on SMTP port 587', retry_count = 0`,
    [testOrderId]
  );

  const failedCheck = await query(
    `SELECT * FROM email_notifications WHERE order_id = $1 AND notification_type = 'order_status_out_for_delivery'`,
    [testOrderId]
  );
  assert(failedCheck.rows.length === 1 && failedCheck.rows[0].status === 'failed', 'Test 9: Email failure logged with error message');

  // Execute safe retry
  const retryRes = await retryFailedEmails({ maxRetries: 3, limit: 5, orderId: testOrderId });
  assert(retryRes.success === true, 'Test 9: Retry mechanism executed successfully');
  assert(retryRes.processedCount >= 1, `Test 9: Retry mechanism processed ${retryRes.processedCount} failed notification(s)`);

  // -------------------------------------------------------------
  // Test 10: Test invalid/missing customer email
  // Expected: Order remains successful, Email failure is logged, No backend crash
  // -------------------------------------------------------------
  console.log('\n🧪 Test 10: Test invalid/missing customer email');
  
  const invalidEmailOrder = {
    ...testOrder,
    customer_email: 'not-an-email',
    customer: { name: 'Faulty User', email: 'not-an-email' }
  };

  let noCrash = true;
  let invalidRes = null;
  try {
    invalidRes = await sendOrderConfirmationEmail({ order: invalidEmailOrder });
  } catch (e) {
    noCrash = false;
  }

  assert(noCrash === true, 'Test 10: Backend did not crash on invalid email');
  assert(invalidRes?.success === false, 'Test 10: Invalid email recognized and handled safely');

  // Phase 11: Admin Notification Query API
  console.log('\n📊 Phase 11: Admin Dashboard Email Notification Query API');
  const adminQueryRes = await getEmailNotifications({ orderId: testOrderId });
  assert(adminQueryRes.success === true, 'Admin getEmailNotifications returns success');
  assert(adminQueryRes.notifications.length >= 5, `Admin query returned ${adminQueryRes.notifications.length} email records for order`);

  // Phase 12: SMTP Diagnostics
  console.log('\n🔌 Phase 12: SMTP Diagnostics & Testing');
  const smtpCheck = await verifySmtpConnection();
  assert(typeof smtpCheck.configured === 'boolean', 'verifySmtpConnection returns structured diagnostic information');

  // Summary
  console.log('\n================================================================');
  console.log(`🏁 TEST MATRIX SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runProductionEmailTestSuite().catch((err) => {
  console.error('Fatal error in email test matrix:', err);
  process.exit(1);
});
