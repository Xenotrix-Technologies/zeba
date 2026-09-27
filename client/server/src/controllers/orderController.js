import { query } from '../config/db.js';

export async function getOrderByNumber(req, res, next) {
  try {
    const { orderNumber } = req.params;

    const orderRes = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status, o.subtotal,
              o.shipping_fee, o.total_amount, o.notes, o.created_at,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              a.house_building, a.street, a.area, a.city, a.state, a.pincode, a.country,
              p.razorpay_order_id, p.razorpay_payment_id, p.payment_method
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       LEFT JOIN addresses a ON o.address_id = a.id
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.order_number = $1`,
      [orderNumber]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderRes.rows[0];

    const itemsRes = await query(
      `SELECT oi.id, oi.product_id, oi.product_name, oi.pack_size,
              oi.unit_price, oi.quantity, oi.subtotal_price,
              p.images
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: parseFloat(order.subtotal),
        shippingFee: parseFloat(order.shipping_fee),
        totalAmount: parseFloat(order.total_amount),
        notes: order.notes,
        createdAt: order.created_at,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone
        },
        address: {
          houseBuilding: order.house_building,
          street: order.street,
          area: order.area,
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          country: order.country
        },
        payment: {
          razorpayOrderId: order.razorpay_order_id,
          razorpayPaymentId: order.razorpay_payment_id,
          method: order.payment_method
        },
        items: itemsRes.rows.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          packSize: item.pack_size,
          unitPrice: parseFloat(item.unit_price),
          quantity: item.quantity,
          subtotalPrice: parseFloat(item.subtotal_price),
          image: item.images && item.images.length > 0 ? item.images[0] : '/images/zeba-1pack.jpg'
        }))
      }
    });
  } catch (err) {
    next(err);
  }
}
