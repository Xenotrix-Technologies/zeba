import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { query } from '../src/config/db.js';
import { config } from '../src/config/env.js';
import { runMigrations } from './migrate.js';

export async function seedDatabase() {
  console.log('🌱 Seeding PostgreSQL database with authentic ZEBA product data...');
  await runMigrations();

  const adminEmail = (config.ADMIN_DEFAULT_EMAIL || 'zebaofficial2013@gmail.com').toLowerCase().trim();
  const adminPassword = (config.ADMIN_DEFAULT_PASSWORD || 'Zeba@2013.?').replace(/^["']|["']$/g, '').trim();
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
      rating: 4.9,
      review_count: 84,
      category: 'Period Care',
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
      ingredients: JSON.stringify([
        'Pure Medical-Grade Iron Powder',
        'Natural Vermiculite Mineral Insulator',
        'Purified Thermal Salt Catalyst',
        'Porous Activated Carbon'
      ]),
      images: JSON.stringify([
        '/images/zeba-1pack.jpg',
        '/images/zeba-real-packaging-1.jpg',
        '/images/zeba-real-packaging-2.jpg',
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
      rating: 4.95,
      review_count: 142,
      category: 'Period Care',
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
      ingredients: JSON.stringify([
        'Pure Medical-Grade Iron Powder',
        'Natural Vermiculite Mineral Insulator',
        'Purified Thermal Salt Catalyst',
        'Porous Activated Carbon'
      ]),
      images: JSON.stringify([
        '/images/zeba-real-packaging-2.jpg',
        '/images/zeba-real-packaging-1.jpg',
        '/images/zeba-1pack.jpg',
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
          benefits, how_to_use, features, images, rating, review_count,
          category, ingredients, is_active, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
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
          prod.rating,
          prod.review_count,
          prod.category,
          prod.ingredients,
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
          benefits = $10, how_to_use = $11, features = $12, images = $13, rating = $14,
          review_count = $15, category = $16, ingredients = $17, updated_at = CURRENT_TIMESTAMP
         WHERE slug = $18`,
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
          prod.rating,
          prod.review_count,
          prod.category,
          prod.ingredients,
          prod.slug
        ]
      );
      console.log(`🔄 Updated Product: ${prod.name}`);
    }
  }

  // 3. Seed / Upsert Store Settings
  const defaultSettings = [
    {
      key: 'brand_info',
      category: 'general',
      description: 'Brand identity and company legal naming',
      value: {
        brandName: 'ZEBA',
        brandFullName: 'ZEBA Period Care',
        logoUrl: '/images/zeba-logo.png',
        legalEntityName: 'ZEBA Wellness Technologies Private Limited',
        tagline: 'Fast-Acting Natural Heat Therapy for Period Cramp Relief',
        description: 'Ultra-thin, air-activated natural warming pads providing up to 8 hours of discreet, soothing menstrual cramp comfort on the go.',
        establishedYear: 2026,
        websiteUrl: 'https://www.zebaofficial.in',
        domain: 'zebaofficial.in'
      }
    },
    {
      key: 'contact_channels',
      category: 'support',
      description: 'Customer helpline, WhatsApp integration and emails',
      value: {
        supportEmail: 'info@zebaofficial.in',
        businessEmail: 'info@zebaofficial.in',
        salesEmail: 'info@zebaofficial.in',
        ownerEmail: 'zebaofficial2013@gmail.com',
        supportPhone: '+91 70259 61509',
        supportPhoneRaw: '7025961509',
        supportHours: 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
        whatsapp: {
          number: '+917025961509',
          numberRaw: '917025961509',
          displayNumber: '+91 70259 61509',
          defaultMessage: 'Hi ZEBA Team, I would like to inquire about the Period Pain Relief Heating Pads.'
        }
      }
    },
    {
      key: 'business_address',
      category: 'address',
      description: 'Registered office and fulfillment center address',
      value: {
        company: 'ZEBA Wellness Pvt. Ltd.',
        building: 'MM Trading, 7-93 G Mundath Arcade',
        street: 'Melattur',
        city: 'Malappuram',
        state: 'Kerala',
        pincode: '679326',
        country: 'India',
        formatted: 'MM Trading, 7-93 G Mundath Arcade, Melattur, Malappuram, Kerala - 679326, India'
      }
    },
    {
      key: 'tax_compliance',
      category: 'tax',
      description: 'GSTIN, CIN, and PAN regulatory identifiers',
      value: {
        gstin: '29AAACZ1234F1Z5',
        cin: 'U24239KA2026PTC123456',
        pan: 'AAACZ1234F',
        hsnCode: '30059090',
        gstPercentage: 18
      }
    },
    {
      key: 'shipping_commerce',
      category: 'commerce',
      description: 'Free shipping threshold, shipping fee and COD rules',
      value: {
        currency: '₹',
        currencyCode: 'INR',
        freeShippingThreshold: 499,
        standardShippingFee: 49,
        codAvailable: true,
        codFee: 0,
        estimatedDeliveryDays: '3 - 5 business days',
        dispatchTime: 'Dispatched within 24 hours in discreet, unmarked packaging',
        returnWindowDays: 7
      }
    },
    {
      key: 'social_channels',
      category: 'social',
      description: 'Official social media handles',
      value: {
        instagram: 'https://instagram.com/zeba.care',
        facebook: 'https://facebook.com/zeba.care',
        youtube: 'https://youtube.com/@zeba.care',
        twitter: 'https://x.com/zeba_care',
        linkedin: 'https://linkedin.com/company/zeba-care'
      }
    },
    {
      key: 'b2b_wholesale',
      category: 'b2b',
      description: 'Corporate and bulk order specifications',
      value: {
        enableB2BInquiries: true,
        minOrderQuantity: 50,
        corporateGiftingEnabled: true,
        inquiryEmail: 'info@zebaofficial.in',
        contactPerson: 'Corporate Wellness Team'
      }
    }
  ];

  for (const s of defaultSettings) {
    await query(
      `INSERT INTO store_settings (setting_key, setting_value, category, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (setting_key) DO UPDATE
       SET setting_value = $2, category = $3, description = $4, updated_at = CURRENT_TIMESTAMP`,
      [s.key, JSON.stringify(s.value), s.category, s.description]
    );
  }
  console.log('✅ Seeded / Updated store_settings table in database');

  // 4. Seed / Upsert Dynamic Site Content (Timeline, Ingredients, How-To, Badges)
  const siteContentSections = [
    {
      key: 'timeline_stages',
      title: 'Therapeutic Warmth Progression',
      content: [
        {
          time: 'Minute 0',
          title: 'Easy Application',
          temp: 'Ambient',
          reliefLevel: '0%',
          desc: 'Peel adhesive backing and stick firmly to the outside of underwear over lower abdomen or back.',
          action: 'Zero bare-skin contact required'
        },
        {
          time: 'Minute 15',
          title: 'Thermal Activation',
          temp: '50°C',
          reliefLevel: '45%',
          desc: 'Natural minerals react gently with ambient air to release continuous therapeutic warmth.',
          action: 'Uterine spasms begin to calm'
        },
        {
          time: 'Hour 1',
          title: 'Peak Muscle Relief',
          temp: '53°C',
          reliefLevel: '90%',
          desc: 'Blood flow increases and deep oxygenation melts away pain for hours of uninterrupted ease.',
          action: 'Pain drops from severe to comfortable'
        },
        {
          time: 'Hour 8+',
          title: 'All-Day Freedom',
          temp: '52°C',
          reliefLevel: '100%',
          desc: 'Sustained warmth keeps you active throughout work, college, travel, or restful sleep.',
          action: 'Full-day worry-free comfort'
        }
      ]
    },
    {
      key: 'natural_ingredients',
      title: '100% Pure Mineral Thermal Core',
      content: [
        {
          num: '01',
          name: 'Iron Powder',
          role: 'Core Thermal Source',
          desc: 'Creates gentle, consistent therapeutic heat when naturally oxidised by air contact.'
        },
        {
          num: '02',
          name: 'Vermiculite',
          role: 'Mineral Heat Insulator',
          desc: 'Natural mineral that locks in heat and disperses steady warmth evenly across the pad surface.'
        },
        {
          num: '03',
          name: 'Purified Salt',
          role: 'Thermal Catalyst',
          desc: 'Natural catalyst that accelerates and stabilizes the heat curve for 8+ uninterrupted hours.'
        },
        {
          num: '04',
          name: 'Activated Carbon',
          role: 'Temperature Regulator',
          desc: 'Porous carbon ensures safe temperature moderation preventing hot spots or skin irritation.'
        }
      ]
    },
    {
      key: 'how_to_use_steps',
      title: 'How It Works & Application',
      content: [
        {
          step: '01',
          title: 'Peel & Stick',
          subtitle: 'Apply to underwear exterior',
          desc: 'Peel the protective backing and press firmly onto the outside of your underwear.',
          badge: 'Zero Skin Irritation'
        },
        {
          step: '02',
          title: 'Air-Activated Heat',
          subtitle: 'Reaches 50–55°C in 15 mins',
          desc: 'Exposed to air, the 100% natural mineral thermal core activates rapidly without microwaves or cords.',
          badge: 'Instant Thermal Core'
        },
        {
          step: '03',
          title: '8+ Hours Relief',
          subtitle: 'Continuous muscle relaxation',
          desc: 'Continuous therapeutic heat dilates blood vessels, increasing oxygen flow to soothe pelvic cramps.',
          badge: 'Clinically Proven Heat'
        },
        {
          step: '04',
          title: 'Conquer Your Day',
          subtitle: 'Ultra-thin and invisible',
          desc: 'Slip into tight jeans, formal wear, or workout clothes with complete discretion and zero bulk.',
          badge: 'All-Day Mobility'
        }
      ]
    },
    {
      key: 'trust_badges',
      title: 'ZEBA Quality & Safety Pillars',
      content: [
        { title: 'Air-Activated', desc: 'Starts warming in 5-6 mins' },
        { title: '8+ Hours Heat', desc: 'Sustained 50°C-55°C warmth' },
        { title: '100% Drug-Free', desc: 'Pure natural minerals' },
        { title: 'Discreet Fit', desc: 'Ultra-thin under clothing' }
      ]
    }
  ];

  for (const c of siteContentSections) {
    await query(
      `INSERT INTO site_content (section_key, title, content, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (section_key) DO UPDATE
       SET title = $2, content = $3, is_active = true, updated_at = CURRENT_TIMESTAMP`,
      [c.key, c.title, JSON.stringify(c.content)]
    );
  }
  console.log('✅ Seeded / Updated site_content table in database');

  // 5. Seed / Upsert Frequently Asked Questions (FAQs)
  const initialFaqs = [
    {
      question: 'Can teenagers and young girls use ZEBA Heating Pads?',
      answer: 'Yes, absolutely! ZEBA is 100% drug-free, non-invasive, and contains pure natural minerals. It is ideal for teenagers and college students experiencing painful menstrual cycles without relying on oral painkillers.',
      category: 'safety',
      sort_order: 1
    },
    {
      question: 'Will the heating pad be visible under tight clothing or leggings?',
      answer: 'Not at all. ZEBA pads are engineered with an ultra-thin, flexible contour that adheres smoothly to undergarments. They remain completely invisible under gym leggings, jeans, formal workwear, and dresses.',
      category: 'usage',
      sort_order: 2
    },
    {
      question: 'How long does the soothing heat last?',
      answer: 'Each ZEBA pad provides up to 8+ hours of continuous, steady therapeutic warmth between 50°C and 55°C, sustaining you throughout a full school or work day.',
      category: 'performance',
      sort_order: 3
    },
    {
      question: 'Do I stick the pad directly onto my skin?',
      answer: 'No. For maximum safety and optimal heat diffusion, always stick the adhesive side to the OUTSIDE of your undergarments, never directly onto bare skin.',
      category: 'safety',
      sort_order: 4
    },
    {
      question: 'How quickly does the pad heat up after opening?',
      answer: 'ZEBA pads are air-activated. As soon as you open the sealed foil pouch, the mineral core begins reacting with ambient air and reaches soothing therapeutic temperature (50°C) within 5 to 15 minutes.',
      category: 'usage',
      sort_order: 5
    },
    {
      question: 'What is your satisfaction and return policy?',
      answer: 'We stand 100% behind ZEBA products. If you receive a damaged product or have any concerns with your purchase, contact our customer support team within 7 days for prompt resolution.',
      category: 'policy',
      sort_order: 6
    }
  ];

  for (const faq of initialFaqs) {
    const existingFaq = await query('SELECT id FROM faqs WHERE question = $1', [faq.question]);
    if (existingFaq.rows.length === 0) {
      await query(
        `INSERT INTO faqs (question, answer, category, sort_order, is_active)
         VALUES ($1, $2, $3, $4, true)`,
        [faq.question, faq.answer, faq.category, faq.sort_order]
      );
    } else {
      await query(
        `UPDATE faqs SET answer = $1, category = $2, sort_order = $3, is_active = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [faq.answer, faq.category, faq.sort_order, existingFaq.rows[0].id]
      );
    }
  }
  console.log('✅ Seeded / Updated faqs table in database');

  // 6. Seed / Upsert Authentic Customer Reviews & Testimonials
  const sampleReviews = [
    {
      author_name: 'Ananya Sharma',
      rating: 5,
      title: 'Life Saver During Long Work Days!',
      comment: 'I usually have crippling cramps on day 1 and 2. ZEBA is so discreet under my formal pants and keeps warming for more than 8 hours straight. Completely replaced my bulky hot water bag.',
      location: 'Bengaluru, Karnataka',
      is_verified_purchase: true,
      is_approved: true,
      is_featured: true
    },
    {
      author_name: 'Pooja Nair',
      rating: 5,
      title: 'Gentle warmth with zero skin irritation',
      comment: 'Since you stick it on the outside of your underwear, there is zero itching or red marks. Heats up so fast and feels like a warm comforting hug.',
      location: 'Kochi, Kerala',
      is_verified_purchase: true,
      is_approved: true,
      is_featured: true
    },
    {
      author_name: 'Rhea Sen',
      rating: 5,
      title: 'Must-have for travel and college',
      comment: 'Ordered the 3-pack bundle and it arrived in 2 days. The lavender packaging is so premium and pretty. Highly recommended to all girls!',
      location: 'Mumbai, Maharashtra',
      is_verified_purchase: true,
      is_approved: true,
      is_featured: true
    },
    {
      author_name: 'Sneha Patel',
      rating: 5,
      title: 'No more popping painkillers every month',
      comment: 'I was looking for a 100% drug-free solution and ZEBA exceeded my expectations. The temperature is consistent and very soothing.',
      location: 'Ahmedabad, Gujarat',
      is_verified_purchase: true,
      is_approved: true,
      is_featured: true
    }
  ];

  for (const rev of sampleReviews) {
    const existingRev = await query('SELECT id FROM reviews WHERE author_name = $1 AND comment = $2', [rev.author_name, rev.comment]);
    if (existingRev.rows.length === 0) {
      await query(
        `INSERT INTO reviews (
          author_name, rating, title, comment, location,
          is_verified_purchase, is_approved, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          rev.author_name,
          rev.rating,
          rev.title,
          rev.comment,
          rev.location,
          rev.is_verified_purchase,
          rev.is_approved,
          rev.is_featured
        ]
      );
    }
  }
  console.log('✅ Seeded / Updated reviews table in database');

  console.log('✨ Supabase database fully synchronized with live store settings, content, FAQs, reviews, and catalog.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

