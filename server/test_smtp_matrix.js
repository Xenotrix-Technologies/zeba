import { query } from './src/config/db.js';
import { runMigrations } from './database/migrate.js';
import { seedDatabase } from './database/seed.js';
import {
  isValidEmail,
  getSenderAddress,
  verifySmtpConnection,
  sendEmail,
  sendOrderReceivedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendOrderStatusEmail,
  sendCancellationEmail,
  sendRefundEmail,
  sendAdminNewOrderEmail,
  sendCustomerWelcomeEmail,
  retryFailedEmails,
  getEmailEvents
} from './src/services/emailService.js';
import {
  renderOrderReceivedEmail,
  renderPaymentSuccessEmail,
  renderPaymentFailedEmail,
  renderOrderStatusEmail,
  renderRefundEmail,
  renderAdminNewOrderEmail,
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

async function runSmtpTestSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING ZEBA SMTP NOTIFICATION SYSTEM VERIFICATION MATRIX');
  console.log('================================================================\n');

  // 0. Initialize DB & Migrations
  console.log('📦 Phase 0: Database & Schema Verification');
  await seedDatabase();

  const tableCheck = await query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name = 'email_events'
  `);
  assert(tableCheck.rows.length > 0, 'email_events table exists in PostgreSQL');

  const indexCheck = await query(`
    SELECT indexname FROM pg_indexes 
    WHERE tablename = 'email_events' AND indexname = 'idx_email_events_order_event'
  `);
  assert(indexCheck.rows.length > 0, 'Unique index idx_email_events_order_event exists for idempotency');

  // 1. Email Address Validation & Security
  console.log('\n🔒 Phase 1: Security & Email Validation Tests');
  assert(isValidEmail('customer@example.com') === true, 'Valid standard email passes validation');
  assert(isValidEmail('care+zeba@zebaofficial.in') === true, 'Valid tagged email passes validation');
  assert(isValidEmail('invalid-email') === false, 'Malformed email rejected');
  assert(isValidEmail('user@.com') === false, 'Invalid domain rejected');
  assert(isValidEmail('') === false, 'Empty email string rejected');
  assert(isValidEmail(null) === false, 'Null email rejected');

  const senderAddr = getSenderAddress();
  assert(senderAddr.includes('ZEBA') && senderAddr.includes('@'), `Sender formatted properly: ${senderAddr}`);

  // 2. Template Rendering Tests for all 11 event types
  console.log('\n🎨 Phase 2: HTML Email Templates Rendering Tests');

  const mockOrder = {
    id: 99991,
    orderNumber: 'ZEBA-2026-TEST01',
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
        productId: 1,
        productName: 'ZEBA Periods Pain Relief Heating Pad – 3 Pack',
        packSize: '3 Single Pads',
        unitPrice: 699,
        quantity: 1,
        subtotalPrice: 699
      }
    ],
    subtotal: 699.00,
    shippingFee: 0.00,
    discountAmount: 0.00,
    totalAmount: 699.00,
    paymentStatus: 'paid',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  // 2A: Order Received
  const tplReceived = renderOrderReceivedEmail({ order: mockOrder });
  assert(tplReceived.subject.includes('ZEBA-2026-TEST01'), 'Order Received subject has order number');
  assert(tplReceived.html.includes('Priya Sharma'), 'Order Received HTML contains customer name');
  assert(tplReceived.html.includes('₹699.00') || tplReceived.html.includes('699'), 'Order Received HTML contains total amount');

  // 2B: Payment Success
  const tplPaySuccess = renderPaymentSuccessEmail({
    order: mockOrder,
    razorpayPaymentId: 'pay_test_rzp123456'
  });
  assert(tplPaySuccess.subject.includes('Payment Successful'), 'Payment Success subject is accurate');
  assert(tplPaySuccess.html.includes('pay_test_rzp123456'), 'Payment Success HTML includes Razorpay Payment ID');

  // 2C: Payment Failed
  const tplPayFailed = renderPaymentFailedEmail({
    order: mockOrder,
    errorMessage: 'Bank declined transaction (insufficient balance)'
  });
  assert(tplPayFailed.subject.includes('Payment Incomplete'), 'Payment Failed subject is accurate');
  assert(tplPayFailed.html.includes('Bank declined transaction'), 'Payment Failed HTML includes safe error notice');

  // 2D: Order Confirmed
  const tplConfirmed = renderOrderStatusEmail({ order: mockOrder, newStatus: 'confirmed' });
  assert(tplConfirmed.subject.includes('Confirmed'), 'Order Confirmed subject is accurate');

  // 2E: Order Processing
  const tplProcessing = renderOrderStatusEmail({ order: mockOrder, newStatus: 'processing' });
  assert(tplProcessing.subject.includes('Being Packed') || tplProcessing.subject.includes('Processing') || tplProcessing.html.includes('prepared for dispatch'), 'Order Processing template is accurate');

  // 2F: Order Shipped
  const tplShipped = renderOrderStatusEmail({
    order: mockOrder,
    newStatus: 'shipped',
    courierPartner: 'BlueDart Express',
    trackingNumber: 'BD987654321IN'
  });
  assert(tplShipped.subject.includes('Dispatched') || tplShipped.html.includes('BlueDart Express'), 'Order Shipped includes courier details');
  assert(tplShipped.html.includes('BD987654321IN'), 'Order Shipped includes AWB tracking number');

  // 2G: Out for Delivery
  const tplOutDelivery = renderOrderStatusEmail({ order: mockOrder, newStatus: 'out_for_delivery' });
  assert(tplOutDelivery.subject.includes('Out for Delivery') || tplOutDelivery.html.includes('out for delivery today'), 'Out for Delivery template rendered');

  // 2H: Delivered
  const tplDelivered = renderOrderStatusEmail({ order: mockOrder, newStatus: 'delivered' });
  assert(tplDelivered.subject.includes('Delivered') || tplDelivered.html.includes('successfully delivered'), 'Delivered template rendered');

  // 2I: Order Cancelled
  const tplCancelled = renderOrderStatusEmail({
    order: mockOrder,
    newStatus: 'cancelled',
    cancellationReason: 'Customer requested change of address'
  });
  assert(tplCancelled.subject.includes('Cancelled'), 'Cancelled subject is accurate');
  assert(tplCancelled.html.includes('Customer requested change of address'), 'Cancellation reason rendered');

  // 2J: Refund (Initiated, Completed, Failed)
  const tplRefundInit = renderRefundEmail({ order: mockOrder, refundStatus: 'initiated', refundAmount: 699 });
  assert(tplRefundInit.subject.includes('Refund Initiated'), 'Refund Initiated template rendered');

  const tplRefundComp = renderRefundEmail({ order: mockOrder, refundStatus: 'completed', refundAmount: 699, transactionId: 'rfnd_98765' });
  assert(tplRefundComp.subject.includes('Refund Processed') || tplRefundComp.subject.includes('Completed'), 'Refund Completed template rendered');
  assert(tplRefundComp.html.includes('rfnd_98765'), 'Refund ID rendered');

  const tplRefundFail = renderRefundEmail({ order: mockOrder, refundStatus: 'failed', refundAmount: 699 });
  assert(tplRefundFail.subject.includes('Refund Notice') || tplRefundFail.subject.includes('Delay'), 'Refund Failed template rendered');

  // 2K: Admin New Order Alert
  const tplAdmin = renderAdminNewOrderEmail({
    order: mockOrder,
    razorpayPaymentId: 'pay_rzp_admin99'
  });
  assert(tplAdmin.subject.includes('New ZEBA Order') && tplAdmin.subject.includes('ZEBA-2026-TEST01'), 'Admin New Order alert contains order number');
  assert(tplAdmin.html.includes('Priya Sharma') && tplAdmin.html.includes('98765 43210'), 'Admin alert contains customer contact details');

  // 2L: Customer Welcome
  const tplWelcome = renderWelcomeEmail({ name: 'Priya Sharma', email: 'priya.test@example.com' });
  assert(tplWelcome.subject.includes('Welcome to ZEBA'), 'Welcome template rendered');

  // 3. Database Real End-to-End Order Creation & Notification Dispatch
  console.log('\n⚡ Phase 3: Real Database Order & Idempotent Email Event Tests');

  // Create real test customer, address, and order in DB
  const custRes = await query(
    `INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id`,
    ['Ananya Verma', 'ananya.matrix@example.com', '+91 9988776655']
  );
  const testCustId = custRes.rows[0].id;

  const addrRes = await query(
    `INSERT INTO addresses (customer_id, house_building, street, area, city, state, pincode, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [testCustId, 'Villa 12, Palm Meadows', 'Whitefield Main Rd', 'Whitefield', 'Bengaluru', 'Karnataka', '560066', 'India']
  );
  const testAddrId = addrRes.rows[0].id;

  const orderNum = `ZEBA-TEST-${Date.now().toString().slice(-6)}`;
  const orderDbRes = await query(
    `INSERT INTO orders (order_number, customer_id, address_id, status, payment_status, subtotal, shipping_fee, total_amount, currency)
     VALUES ($1, $2, $3, 'pending', 'pending', 699.00, 0.00, 699.00, 'INR') RETURNING id`,
    [orderNum, testCustId, testAddrId]
  );
  const testOrderId = orderDbRes.rows[0].id;

  const realOrder = {
    id: testOrderId,
    orderNumber: orderNum,
    customer: { name: 'Ananya Verma', email: 'ananya.matrix@example.com', phone: '+91 9988776655' },
    address: {
      houseBuilding: 'Villa 12, Palm Meadows',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066'
    },
    items: [
      { productName: 'ZEBA Heating Pad – 3 Pack', packSize: '3 Pack', quantity: 1, subtotalPrice: 699 }
    ],
    subtotal: 699.00,
    shippingFee: 0.00,
    totalAmount: 699.00,
    status: 'pending'
  };

  // Test 3A: Send Order Received Email
  const resOrderReceived = await sendOrderReceivedEmail({ order: realOrder });
  assert(resOrderReceived.success === true, 'Order Received email logged/sent successfully');

  // Verify DB record in email_events
  const dbEvt1 = await query('SELECT * FROM email_events WHERE order_id = $1 AND event_type = $2', [testOrderId, 'order_received']);
  assert(dbEvt1.rows.length === 1, 'email_events recorded order_received event');
  assert(dbEvt1.rows[0].recipient === 'ananya.matrix@example.com', 'email_events recipient saved');

  // Test 3B: Idempotency - Trigger Order Received Again!
  const resDuplicate = await sendOrderReceivedEmail({ order: realOrder });
  assert(resDuplicate.success === true && resDuplicate.alreadySent === true, 'Idempotency test: duplicate email skipped cleanly');

  // Test 3C: Payment Success Dispatch
  const resPaySuccess = await sendPaymentSuccessEmail({
    order: realOrder,
    razorpayPaymentId: 'pay_test_live_verify_001'
  });
  assert(resPaySuccess.success === true, 'Payment Success email logged/sent');

  // Test 3D: Admin Alert Dispatch
  const resAdminAlert = await sendAdminNewOrderEmail({
    order: realOrder,
    razorpayPaymentId: 'pay_test_live_verify_001'
  });
  assert(resAdminAlert.success === true, 'Admin New Order alert logged/sent');

  // Test 3E: Order Status Transitions (Shipped with tracking)
  const resShipped = await sendOrderStatusEmail({
    order: realOrder,
    newStatus: 'shipped',
    courierPartner: 'Delhivery',
    trackingNumber: 'DEL9988771122'
  });
  assert(resShipped.success === true, 'Order Shipped notification recorded');

  // Test 3F: Order Delivered
  const resDelivered = await sendOrderStatusEmail({
    order: realOrder,
    newStatus: 'delivered'
  });
  assert(resDelivered.success === true, 'Order Delivered notification recorded');

  // Test 3G: Customer Welcome Email
  const resWelcome = await sendCustomerWelcomeEmail({
    customerId: testCustId,
    name: 'Ananya Verma',
    email: 'ananya.matrix@example.com',
    phone: '+91 9988776655'
  });
  assert(resWelcome.success === true, 'Customer Welcome email dispatched');

  // 4. Admin Email Event Logs Query API
  console.log('\n📊 Phase 4: Admin Email Logs & Query API Tests');
  const logsRes = await getEmailEvents({ orderId: testOrderId });
  assert(logsRes.success === true, 'getEmailEvents query succeeds');
  assert(logsRes.events.length >= 4, `Found ${logsRes.events.length} email events for test order (expected >= 4)`);

  // 5. Retry Mechanism Test
  console.log('\n🔄 Phase 5: Email Retry System Test');
  // Inject a mock failed email event
  await query(
    `INSERT INTO email_events (order_id, event_type, recipient, status, error_message, retry_count)
     VALUES ($1, 'payment_failed', 'ananya.matrix@example.com', 'failed', 'Temporary SMTP Network Timeout', 0)
     ON CONFLICT (order_id, event_type) DO UPDATE SET status = 'failed', retry_count = 0`,
    [testOrderId]
  );

  const retryRes = await retryFailedEmails({ maxRetries: 3, limit: 5 });
  assert(retryRes.success === true, 'retryFailedEmails executes cleanly');
  assert(retryRes.processedCount >= 1, `retryFailedEmails processed ${retryRes.processedCount} failed events`);

  // 6. SMTP Diagnostic Connection Check
  console.log('\n🔌 Phase 6: SMTP Connection Diagnostics');
  const smtpCheck = await verifySmtpConnection();
  console.log(`  ℹ️ SMTP Status: configured=${smtpCheck.configured}, connected=${smtpCheck.connected}, message="${smtpCheck.message}"`);
  assert(typeof smtpCheck.configured === 'boolean', 'verifySmtpConnection returns structured diagnostic object');

  // Summary
  console.log('\n================================================================');
  console.log(`🏁 TEST SUITE FINISHED: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSmtpTestSuite().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
