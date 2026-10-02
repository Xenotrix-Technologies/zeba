export { renderEmailLayout } from './baseLayout.js';

// Specific Section 1 & 2 Named Templates
export { renderOrderConfirmationEmail } from './orderConfirmation.js';
export { renderPaymentConfirmationEmail } from './paymentConfirmation.js';
export { renderOrderStatusUpdateEmail } from './orderStatusUpdate.js';
export { renderOrderCancelledEmail } from './orderCancelled.js';

// Backward compatibility aliases & additional templates
export { renderOrderConfirmationEmail as renderOrderReceivedEmail } from './orderConfirmation.js';
export { renderPaymentConfirmationEmail as renderPaymentSuccessEmail } from './paymentConfirmation.js';
export { renderOrderStatusUpdateEmail as renderOrderStatusEmail } from './orderStatusUpdate.js';
export { renderOrderCancelledEmail as renderCancellationEmail } from './orderCancelled.js';

export { renderPaymentFailedEmail } from './paymentFailed.js';
export { renderRefundEmail } from './refund.js';
export { renderAdminNewOrderEmail } from './adminNewOrder.js';
export { renderWelcomeEmail } from './welcome.js';
