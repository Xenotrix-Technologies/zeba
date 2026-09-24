import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { query } from '../src/config/db.js';
import { config } from '../src/config/env.js';
import { runMigrations } from './migrate.js';

export async function seedDatabase() {
  console.log('🌱 Seeding PostgreSQL database with authentic ZEBA product data...');
  await runMigrations();

  // 1. Seed Admin
  const adminEmail = (config.ADMIN_DEFAULT_EMAIL || 'zebaofficial2013@gmail.com').toLowerCase().trim();
  const adminPassword = config.ADMIN_DEFAULT_PASSWORD || 'ZebaMundath#2026!';
  const adminUsername = 'zeba_admin';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const existingAdmin = await query('SELECT id FROM admins WHERE email = $1 OR username = $2 LIMIT 1', [adminEmail, adminUsername]);
  if (existingAdmin.rows.length === 0) {
    await query(
      `INSERT INTO admins (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [adminUsername, adminEmail, passwordHash, 'superadmin']
    );
    console.log(`✅ Default admin created: ${adminEmail}`);
  } else {
    await query(
      `UPDATE admins SET email = $1, password_hash = $2, username = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
      [adminEmail, passwordHash, adminUsername, existingAdmin.rows[0].id]
    );
    console.log(`🔄 Default admin credentials synchronized: ${adminEmail}`);
  }

  // 2. Seed / Upsert the exact authentic ZEBA Products
  const products = [
    {
      slug: 'zeba-heating-pad-1-pack',
      name: 'ZEBA Periods Pain Relief Heating Pad – 1 Pack',
      pack_size: '1 Single Pad',
      pack_count: 1,
      price: 299.00,
      original_price: 399.00,
      stock_quantity: 200,
      badge_text: 'Starter Pack',
      short_description: 'Fast-acting, soothing heat therapy for menstrual cramps. Ultra-thin, air-activated natural warmth lasting up to 8 hours with 100% safe ingredients.',
      description: 'Experience discreet, on-the-go menstrual comfort with the authentic ZEBA Periods Pain Relief Heating Pad. Crafted for life on the go, our ultra-thin air-activated patch heats up within 5-6 minutes of exposure to air, providing gentle therapeutic heat to ease period cramps naturally without heavy hot water bags or cords. Sticks securely to your underwear for worry-free all-day comfort.',
      benefits: JSON.stringify([
        'Up to 8 Hours continuous soothing heat therapy',
        'Air-activated natural warming technology within 5-6 minutes',
        'Ultra-thin, soft waffle-textured lavender patch for discreet fit',
        'Safe 100% ingredients & skin-safe underwear adhesive',
        'Designed for life on the go - work, travel, gym, and sleep'
      ]),
      how_to_use: JSON.stringify([
        'Remove from packaging: The pad heats up within 5-6 minutes when exposed to air. It will feel soft and warm as it activates.',
        'Stick it on: Stick the adhesive backing securely to the OUTSIDE of your underwear over your lower abdomen or lower back.',
        'Go forth, worry-free: Enjoy discreet, soothing cramp relief throughout your day.'
      ]),
      features: JSON.stringify([
        'Targeted menstrual cramp relief',
        'Soothing 50°C - 55°C natural thermal output',
        'Compact pocket-size protective foil pack',
        '100% non-medicated, odourless comfort'
      ]),
      images: JSON.stringify([
        '/images/zeba-real-packaging-1.jpg',
        '/images/zeba-real-packaging-2.jpg',
        '/images/zeba-pad-detail.jpg',
        '/images/zeba-hero-lifestyle.jpg'
      ]),
      is_active: true,
      is_featured: true
    },
    {
      slug: 'zeba-heating-pad-3-pack',
      name: 'ZEBA Periods Pain Relief Heating Pad – 3 Pack',
      pack_size: '3 Pads (Value Pack)',
      pack_count: 3,
      price: 749.00,
      original_price: 1197.00,
      stock_quantity: 350,
      badge_text: 'Best Value • Save 37%',
      short_description: 'Complete multi-cycle period pain relief bundle. Contains 3 individually sealed heating pads with up to 8 hours of soothing heat each.',
      description: 'Never let period cramps interrupt your schedule. The ZEBA 3-Pack Value Box gives you 3 individually sealed heating pads, providing multi-day coverage for your entire cycle at our best value pricing. Keep one at your office desk, one in your travel bag, and one at home.',
      benefits: JSON.stringify([
        '3 Individually sealed pads for complete cycle relief',
        'Best Value Bundle - Save over 37% off individual pack price',
        'Up to 8 hours continuous soothing warmth per pad',
        'Air-activated within 5-6 minutes of opening',
        'Ultra-thin and completely discreet under any outfit'
      ]),
      how_to_use: JSON.stringify([
        'Remove one pad from sealed packaging when cramp symptoms begin.',
        'Peel the protective backing tape and stick firmly onto the outside of your underwear.',
        'Carry on with your day in complete, uninterrupted comfort.'
      ]),
      features: JSON.stringify([
        '3x Air-Activated Heating Pads',
        'Individually foil-sealed for maximum shelf freshness',
        'Steady therapeutic muscle relaxation',
        'Travel-ready & discreet to carry'
      ]),
      images: JSON.stringify([
        '/images/zeba-real-packaging-2.jpg',
        '/images/zeba-real-packaging-1.jpg',
        '/images/zeba-pad-detail.jpg',
        '/images/zeba-hero-lifestyle.jpg'
      ]),
      is_active: true,
      is_featured: true
    }
  ];

  for (const prod of products) {
    const existing = await query('SELECT id FROM products WHERE slug = $1', [prod.slug]);
    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO products (
          slug, name, pack_size, pack_count, price, original_price,
          stock_quantity, badge_text, short_description, description,
          benefits, how_to_use, features, images, is_active, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          prod.slug,
          prod.name,
          prod.pack_size,
          prod.pack_count,
          prod.price,
          prod.original_price,
          prod.stock_quantity,
          prod.badge_text,
          prod.short_description,
          prod.description,
          prod.benefits,
          prod.how_to_use,
          prod.features,
          prod.images,
          prod.is_active,
          prod.is_featured
        ]
      );
      console.log(`✅ Seeded Product: ${prod.name}`);
    } else {
      await query(
        `UPDATE products SET
          name = $1, pack_size = $2, pack_count = $3, price = $4, original_price = $5,
          stock_quantity = $6, badge_text = $7, short_description = $8, description = $9,
          benefits = $10, how_to_use = $11, features = $12, images = $13, updated_at = CURRENT_TIMESTAMP
         WHERE slug = $14`,
        [
          prod.name,
          prod.pack_size,
          prod.pack_count,
          prod.price,
          prod.original_price,
          prod.stock_quantity,
          prod.badge_text,
          prod.short_description,
          prod.description,
          prod.benefits,
          prod.how_to_use,
          prod.features,
          prod.images,
          prod.slug
        ]
      );
      console.log(`🔄 Updated Product: ${prod.name}`);
    }
  }

  console.log('✨ PostgreSQL database updated with authentic packaging data.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
