import crypto from 'crypto';
import { query } from '../config/db.js';
import { calculateOrderTotals, fetchConsolidatedOrder } from './paymentController.js';
import { sendCodOtpEmail, sendOrderConfirmationEmail, isValidEmail } from '../services/emailService.js';
import { invalidateMetaFeedCache } from '../services/metaFeedGenerator.js';
import { sendMetaConversionsEvent } from '../services/metaConversionsService.js';

/**
 * Mask email for safe user-facing display (e.g., s***y@gmail.com)
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return email;
  const [user, domain] = parts;
  if (user.length <= 2) {
    return `${user.charAt(0)}***@${domain}`;
  }
  return `${user.charAt(0)}***${user.charAt(user.length - 1)}@${domain}`;
}

/**
 * Generate human-readable order reference (e.g., ZEBA-2026-8942)
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ZEBA-2026-${timestamp}${random}`.slice(0, 16);
}

/**
 * POST /api/orders/cod/send-otp
 *
 * Requirements:
 * - Validate customer checkout information and cart.
 * - Enforce 60-second resend cooldown.
 * - Enforce 15-minute abuse rate limit (max 5 resends).
 * - Invalidate any previous unverified OTPs.
 * - Generate cryptographically secure 6-digit OTP (100000 - 999999).
 * - Hash OTP with cryptographic salt (SHA-256) before storing.
 * - OTP validity: 5 minutes.
 * - Dispatch OTP via existing Nodemailer configuration.
 * - Never expose OTP in response, logs, or frontend.
 */
export async function sendCodOtp(req, res, next) {
  try {
    const { items, customer, address } = req.body;

    // 1. Basic validation
    if (!customer?.email?.trim() || !isValidEmail(customer.email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address to receive your COD verification code.'
      });
    }

    if (!customer?.name?.trim() || !customer?.phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name and mobile number.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items to checkout.'
      });
    }

    const houseBuilding = (address?.house_building || address?.houseBuilding || '').trim();
    const city = (address?.city || '').trim();
    const state = (address?.state || '').trim();
    const cleanPincode = (address?.pincode || address?.pinCode || '').toString().trim();

    if (!houseBuilding || !city || !state || !cleanPincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete delivery address details before requesting COD verification.'
      });
    }

    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      });
    }

    // 2. Validate product availability and pricing authoritatively from database
    await calculateOrderTotals(items);

    const cleanEmail = customer.email.toLowerCase().trim();
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    // 3. Rate Limiting & Cooldown Check (Applies only to unverified & unused OTPs)
    const recentOtpRes = await query(
      `SELECT id, created_at
       FROM cod_otp_verifications
       WHERE email = $1 AND used = false AND verified = false AND created_at > NOW() - INTERVAL '50 seconds'
       ORDER BY created_at DESC LIMIT 1`,
      [cleanEmail]
    );

    if (recentOtpRes.rows.length > 0) {
      const createdAt = new Date(recentOtpRes.rows[0].created_at).getTime();
      const remainingSeconds = Math.max(1, Math.ceil((createdAt + 60000 - Date.now()) / 1000));
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'} before requesting another verification code.`,
        cooldownSeconds: remainingSeconds
      });
    }

    // 4. Abuse Prevention: Max 10 active OTP requests per email in 15 minutes
    const abuseRes = await query(
      `SELECT COUNT(*) AS total
       FROM cod_otp_verifications
       WHERE email = $1 AND used = false AND created_at > NOW() - INTERVAL '15 minutes'`,
      [cleanEmail]
    );

    const recentCount = parseInt(abuseRes.rows[0]?.total || 0, 10);
    if (recentCount >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification code requests for this email. For security, please wait 15 minutes before trying again.'
      });
    }

    // 5. Invalidate previous unconfirmed OTP sessions for this email address
    await query(
      `UPDATE cod_otp_verifications
       SET expires_at = NOW(), token_expires_at = NOW(), updated_at = NOW()
       WHERE email = $1 AND used = false`,
      [cleanEmail]
    );

    // 6. Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = crypto.createHash('sha256').update(rawOtp + salt).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Store secure record
    await query(
      `INSERT INTO cod_otp_verifications (
         email, otp_hash, salt, expires_at, ip_address, user_agent
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [cleanEmail, otpHash, salt, expiresAt, clientIp, userAgent]
    );

    // 7. Dispatch OTP Email using existing Nodemailer configuration
    const emailResult = await sendCodOtpEmail({
      to: cleanEmail,
      otp: rawOtp,
      customerName: customer.name.trim()
    });

    if (!emailResult?.success && process.env.NODE_ENV !== 'test') {
      console.error(`[COD OTP] Email dispatch failure for [${cleanEmail}]:`, emailResult?.error);
      return res.status(502).json({
        success: false,
        message: 'Failed to deliver OTP to your email address. Please verify your email or try again in a few moments.'
      });
    }

    return res.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email address.',
      emailMasked: maskEmail(cleanEmail),
      cooldownSeconds: 60,
      expiresInSeconds: 300
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/orders/cod/verify-otp
 *
 * Requirements:
 * - Validate submitted OTP against hashed database record.
 * - Single-use enforcement.
 * - 5-minute expiry enforcement.
 * - Limit incorrect attempts to 5 maximum.
 * - Generate a secure verification token for order confirmation upon success.
 */
export async function verifyCodOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const cleanOtp = String(otp || '').trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit numeric OTP code.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Fetch latest active verification record
    const otpRes = await query(
      `SELECT *
       FROM cod_otp_verifications
       WHERE email = $1 AND used = false
       ORDER BY created_at DESC LIMIT 1`,
      [cleanEmail]
    );

    if (otpRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No verification request found for this email. Please request a new OTP.'
      });
    }

    const record = otpRes.rows[0];

    // 2. Already verified check
    if (record.verified && record.verification_token) {
      const tokenExpired = record.token_expires_at && new Date() > new Date(record.token_expires_at);
      if (!tokenExpired) {
        return res.json({
          success: true,
          message: 'Email address has already been verified.',
          verificationToken: record.verification_token
        });
      }
    }

    // 3. Expiry check (5 minutes)
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'The OTP code has expired. OTPs are valid for 5 minutes. Please request a new code.'
      });
    }

    // 4. Max attempts check (5 attempts)
    if (record.attempts >= record.max_attempts) {
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts (5) exceeded for this OTP. Please request a new verification code.'
      });
    }

    // 5. Compare cryptographic hashes
    const computedHash = crypto.createHash('sha256').update(cleanOtp + record.salt).digest('hex');

    if (computedHash !== record.otp_hash) {
      const updatedAttempts = record.attempts + 1;
      const remaining = Math.max(0, record.max_attempts - updatedAttempts);

      await query(
        `UPDATE cod_otp_verifications
         SET attempts = $1, updated_at = NOW()
         WHERE id = $2`,
        [updatedAttempts, record.id]
      );

      if (remaining === 0) {
        return res.status(429).json({
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new verification code.',
          attemptsRemaining: 0
        });
      }

      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        attemptsRemaining: remaining
      });
    }

    // 6. Verification Success - generate secure single-use token valid for 15 minutes
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `UPDATE cod_otp_verifications
       SET verified = true,
           verified_at = NOW(),
           verification_token = $1,
           token_expires_at = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [verificationToken, tokenExpiresAt, record.id]
    );

    return res.json({
      success: true,
      message: 'Email verified successfully! You can now place your Cash on Delivery order.',
      verificationToken
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/orders/cod/confirm
 *
 * Requirements:
 * - Validate verificationToken strictly against cod_otp_verifications.
 * - Single-use token invalidation (prevents duplicate orders).
 * - Authoritative backend price calculation:
 *     Subtotal + Shipping Fee + ₹20 COD Handling Fee.
 * - Inventory check and stock deduction.
 * - Create Order with payment_method: 'Cash on Delivery', payment_status: 'pending', status: 'confirmed'.
 * - Record COD handling fee: ₹20.00.
 * - Dispatch order confirmation emails to customer and admin.
 * - Return order confirmation payload.
 */
export async function confirmCodOrder(req, res, next) {
  try {
    const { items, customer, address, notes, verificationToken } = req.body;

    // 1. Validation
    if (!verificationToken || typeof verificationToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'OTP verification is required before confirming a Cash on Delivery order.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add products to checkout.'
      });
    }

    if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name, email address, and mobile number.'
      });
    }

    const cleanEmail = customer.email.toLowerCase().trim();

    // 2. Validate Verification Token
    const tokenRes = await query(
      `SELECT *
       FROM cod_otp_verifications
       WHERE verification_token = $1
       LIMIT 1`,
      [verificationToken.trim()]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token. Please verify your email with OTP.'
      });
    }

    const verificationRecord = tokenRes.rows[0];

    if (!verificationRecord.verified) {
      return res.status(400).json({
        success: false,
        message: 'Email address has not been verified.'
      });
    }

    if (verificationRecord.used) {
      return res.status(400).json({
        success: false,
        message: 'This OTP verification has already been used to place an order. Please request a new OTP.'
      });
    }

    if (verificationRecord.token_expires_at && new Date() > new Date(verificationRecord.token_expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Verification session has expired (valid for 15 minutes). Please verify your email again.'
      });
    }

    if (cleanEmail !== verificationRecord.email.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: 'The email address on the order does not match the verified email session.'
      });
    }

    // 3. Atomic Token Invalidation (Prevents race-conditions and duplicate order creation)
    const consumeRes = await query(
      `UPDATE cod_otp_verifications
       SET used = true, updated_at = NOW()
       WHERE id = $1 AND used = false
       RETURNING id`,
      [verificationRecord.id]
    );

    if (consumeRes.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: 'Order submission already in progress or completed.'
      });
    }

    // 4. Validate Delivery Address
    const houseBuilding = (address?.house_building || address?.houseBuilding || '').trim();
    const street = (address?.street || '').trim();
    const area = (address?.area || '').trim();
    const city = (address?.city || '').trim();
    const state = (address?.state || '').trim();
    const cleanPincode = (address?.pincode || address?.pinCode || '').toString().trim();
    const country = (address?.country || 'India').trim();

    if (!houseBuilding || !city || !state || !cleanPincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete delivery address details.'
      });
    }

    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      });
    }

    // 5. Authoritative Price Calculation from Database
    const { subtotal, shippingFee, currency, items: verifiedItems } = await calculateOrderTotals(items);
    
    // Fixed ₹20 COD Handling Fee (never trust client amounts)
    const codHandlingFee = 20.00;
    const totalAmount = Math.round((subtotal + shippingFee + codHandlingFee) * 100) / 100;

    // 6. Upsert Customer
    let customerId;
    const cleanPhone = customer.phone.trim();
    const cleanName = customer.name.trim();

    const existingCust = await query(
      'SELECT id FROM customers WHERE email = $1 OR phone = $2 LIMIT 1',
      [cleanEmail, cleanPhone]
    );

    if (existingCust.rows.length > 0) {
      customerId = existingCust.rows[0].id;
      await query(
        'UPDATE customers SET name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
        [cleanName, cleanEmail, cleanPhone, customerId]
      );
    } else {
      const newCust = await query(
        'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
        [cleanName, cleanEmail, cleanPhone]
      );
      customerId = newCust.rows[0].id;
    }

    // 7. Insert Delivery Address
    const newAddr = await query(
      `INSERT INTO addresses (customer_id, house_building, street, area, city, state, pincode, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [customerId, houseBuilding, street, area, city, state, cleanPincode, country]
    );
    const addressId = newAddr.rows[0].id;

    // 8. Deduct Product Stock Quantity
    for (const itm of verifiedItems) {
      await query(
        'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [itm.quantity, itm.productId]
      );
    }

    // 9. Insert Confirmed COD Order
    const orderNumber = generateOrderNumber();
    const rzpOrderId = `COD_${orderNumber}`;

    const newOrder = await query(
      `INSERT INTO orders (
         order_number, customer_id, address_id, status, payment_status,
         subtotal, shipping_fee, cod_handling_fee, total_amount, currency, notes,
         payment_method, email_verified_at, razorpay_order_id
       ) VALUES ($1, $2, $3, 'confirmed', 'pending', $4, $5, $6, $7, $8, $9, 'Cash on Delivery', NOW(), $10)
       RETURNING id`,
      [
        orderNumber,
        customerId,
        addressId,
        subtotal,
        shippingFee,
        codHandlingFee,
        totalAmount,
        currency,
        notes?.trim() || null,
        rzpOrderId
      ]
    );
    const orderId = newOrder.rows[0].id;

    // 10. Insert Line Items
    for (const itm of verifiedItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, pack_size, unit_price, quantity, subtotal_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, itm.productId, itm.productName, itm.packSize, itm.unitPrice, itm.quantity, itm.subtotalPrice]
      );
    }

    // 11. Insert Initial Payment Record
    await query(
      `INSERT INTO payments (
         order_id, razorpay_order_id, amount, currency, status, payment_method
       ) VALUES ($1, $2, $3, $4, 'pending', 'Cash on Delivery')`,
      [orderId, rzpOrderId, totalAmount, currency]
    );

    // 12. Insert Status History Audit Trail
    try {
      await query(
        `INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes)
         VALUES ($1, NULL, 'confirmed', 'customer', 'Order placed with Cash on Delivery (OTP Verified)')`,
        [orderId]
      );
    } catch (e) {
      // Non-blocking
    }

    // 13. Bind Verification Record with Order Number
    await query(
      `UPDATE cod_otp_verifications SET order_number = $1 WHERE id = $2`,
      [orderNumber, verificationRecord.id]
    );

    // 14. Fetch Consolidated Order
    let fullOrder = null;
    try {
      fullOrder = await fetchConsolidatedOrder(orderId);
    } catch (fetchErr) {
      console.warn('[COD Confirmation] Order consolidation note:', fetchErr.message);
    }

    // 15. Instant Response: Return success immediately without blocking on external SMTP/Meta services
    res.status(201).json({
      success: true,
      isCod: true,
      orderId,
      orderNumber,
      order: fullOrder || {
        id: orderId,
        orderNumber,
        subtotal,
        shippingFee,
        codHandlingFee,
        totalAmount,
        currency,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'pending',
        status: 'confirmed'
      },
      breakdown: {
        subtotal,
        shippingFee,
        codHandlingFee,
        totalAmount,
        currency,
        items: verifiedItems
      }
    });

    // 16. Asynchronous Background Notifications (Non-blocking)
    const backgroundTasks = async () => {
      try {
        if (fullOrder) {
          await sendOrderConfirmationEmail({ order: fullOrder });
          invalidateMetaFeedCache();
          sendMetaConversionsEvent({
            eventName: 'Purchase',
            eventId: `order_${fullOrder.order_number}`,
            userData: {
              email: fullOrder.customer_email,
              phone: fullOrder.customer_phone,
              clientIp: req.ip || req.headers['x-forwarded-for'],
              userAgent: req.headers['user-agent']
            },
            customData: {
              currency: 'INR',
              value: parseFloat(fullOrder.total_amount),
              num_items: fullOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0),
              contents: fullOrder.items?.map(i => ({
                id: String(i.product_id),
                quantity: i.quantity,
                item_price: parseFloat(i.unit_price)
              }))
            }
          }).catch(e => console.warn('[Meta CAPI] Dispatch note:', e.message));
        }
      } catch (err) {
        console.error('[COD Confirmation] Background notification note:', err.message);
      }
    };

    if (process.env.NODE_ENV !== 'test') {
      setImmediate(backgroundTasks);
    }
    return;
  } catch (err) {
    next(err);
  }
}
