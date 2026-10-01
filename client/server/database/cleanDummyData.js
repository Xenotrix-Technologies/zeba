import { query } from '../src/config/db.js';

export async function clearDummyData() {
  console.log('🧹 Clearing all dummy and test data from PostgreSQL database...');

  try {
    // Delete payments
    await query('DELETE FROM payments');
    console.log('✅ Cleared payments table');

    // Delete order notifications if table exists
    try {
      await query('DELETE FROM order_notifications');
      console.log('✅ Cleared order_notifications table');
    } catch (e) {
      // Table might not exist in all schemas
    }

    // Delete order items
    await query('DELETE FROM order_items');
    console.log('✅ Cleared order_items table');

    // Delete orders
    await query('DELETE FROM orders');
    console.log('✅ Cleared orders table');

    // Delete addresses
    await query('DELETE FROM addresses');
    console.log('✅ Cleared addresses table');

    // Delete customers
    await query('DELETE FROM customers');
    console.log('✅ Cleared customers table');

    // Delete contact messages
    await query('DELETE FROM contact_messages');
    console.log('✅ Cleared contact_messages table');

    // Reset serial sequences to 1 if available
    try {
      await query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE order_items_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE customers_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE addresses_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE payments_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE contact_messages_id_seq RESTART WITH 1');
    } catch (seqErr) {
      // Sequence restart might differ on some engines
    }

    console.log('✨ All dummy test data successfully wiped. Database is clean and ready for real orders!');
  } catch (err) {
    console.error('❌ Error clearing dummy data:', err);
    throw err;
  }
}

clearDummyData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
