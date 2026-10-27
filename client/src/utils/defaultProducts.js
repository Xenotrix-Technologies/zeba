/**
 * Authentic ZEBA Fallback Products & Variants
 * Guarantees zero blank screens or blocking network error states when API is cold-starting or offline.
 */

export const DEFAULT_PRODUCTS = [
  {
    id: 1,
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
    benefits: [
      'Up to 8 Hours continuous soothing heat therapy',
      'Air-activated natural warming technology within 5-6 minutes',
      'Ultra-thin, soft waffle-textured lavender patch for discreet fit',
      'Safe 100% ingredients & skin-safe underwear adhesive',
      'Designed for life on the go - work, travel, gym, and sleep'
    ],
    how_to_use: [
      'Remove from packaging: The pad heats up within 5-6 minutes when exposed to air. It will feel soft and warm as it activates.',
      'Stick it on: Stick the adhesive backing securely to the OUTSIDE of your underwear over your lower abdomen or lower back.',
      'Go forth, worry-free: Enjoy discreet, soothing cramp relief throughout your day.'
    ],
    features: [
      'Targeted menstrual cramp relief',
      'Soothing 50°C - 55°C natural thermal output',
      'Compact pocket-size protective foil pack',
      '100% non-medicated, odourless comfort'
    ],
    ingredients: [
      'Pure Medical-Grade Iron Powder',
      'Natural Vermiculite Mineral Insulator',
      'Purified Thermal Salt Catalyst',
      'Porous Activated Carbon'
    ],
    images: [
      '/images/zeba-1pack.webp',
      '/images/zeba-hero-lifestyle.webp'
    ],
    is_active: true,
    is_featured: false,
    show_original_price: true
  },
  {
    id: 2,
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
    benefits: [
      '3 Individually sealed pads for complete cycle relief',
      'Best Value Bundle - Save over 37% off individual pack price',
      'Up to 8 hours continuous soothing warmth per pad',
      'Air-activated within 5-6 minutes of opening',
      'Ultra-thin and completely discreet under any outfit'
    ],
    how_to_use: [
      'Remove one pad from sealed packaging when cramp symptoms begin.',
      'Peel the protective backing tape and stick firmly onto the outside of your underwear.',
      'Carry on with your day in complete, uninterrupted comfort.'
    ],
    features: [
      '3x Air-Activated Heating Pads',
      'Individually foil-sealed for maximum shelf freshness',
      'Steady therapeutic muscle relaxation',
      'Travel-ready & discreet to carry'
    ],
    ingredients: [
      'Pure Medical-Grade Iron Powder',
      'Natural Vermiculite Mineral Insulator',
      'Purified Thermal Salt Catalyst',
      'Porous Activated Carbon'
    ],
    images: [
      '/images/zeba-1pack.webp',
      '/images/zeba-hero-lifestyle.webp'
    ],
    is_active: true,
    is_featured: true,
    show_original_price: true
  }
];

export const DEFAULT_PRODUCT_REVIEWS = [
  {
    id: 1,
    author_name: 'Fathima Noureen',
    rating: 5,
    title: 'No more popping painkillers every month',
    comment: 'I was looking for a 100% drug-free solution and ZEBA exceeded my expectations. The temperature is consistent and very soothing.',
    location: 'Calicut, Kerala',
    is_verified_purchase: true
  },
  {
    id: 2,
    author_name: 'Drishya K.',
    rating: 5,
    title: 'Must-have for travel and college',
    comment: 'Ordered the 3-pack bundle and it arrived in 2 days. The lavender packaging is so premium and pretty. Highly recommended to all girls!',
    location: 'Malappuram, Kerala',
    is_verified_purchase: true
  },
  {
    id: 3,
    author_name: 'Pooja Nair',
    rating: 5,
    title: 'Gentle warmth with zero skin irritation',
    comment: 'Since you stick it on the outside of your underwear, there is zero itching or red marks. Heats up so fast and feels like a warm comforting hug.',
    location: 'Kochi, Kerala',
    is_verified_purchase: true
  },
  {
    id: 4,
    author_name: 'Ananya',
    rating: 5,
    title: 'Life Saver During Long Work Days!',
    comment: 'I usually have crippling cramps on day 1 and 2. ZEBA is so discreet under my formal pants and keeps warming for more than 8 hours straight. Completely replaced my bulky hot water bag.',
    location: 'Bengaluru, Karnataka',
    is_verified_purchase: true
  }
];

export const DEFAULT_PRODUCT_FAQS = [
  {
    id: 1,
    question: 'What is ZEBA Periods Pain Relief Pad?',
    answer: 'ZEBA is a convenient, air-activated heating pad designed to provide soothing warmth during your period. It is designed to fit into your daily routine, helping you stay comfortable at home, at college, at work, or while travelling.',
    category: 'About ZEBA',
    badge: 'Everyday Comfort'
  },
  {
    id: 2,
    question: 'How does ZEBA Heating Pad work?',
    answer: 'ZEBA uses an air-activated mineral heating technology. Once you open the sealed pouch, the ingredients react with oxygen in the air to generate warmth. Follow the instructions on the product packaging for proper use.',
    category: 'Heat & Performance',
    badge: 'Air-Activated'
  },
  {
    id: 3,
    question: 'How do I use the ZEBA pad correctly?',
    answer: 'Open the sealed pouch when you are ready to use the pad. Remove the protective liner and attach the adhesive side to the OUTSIDE of your underwear or another suitable garment, following the product instructions. The pad should not be stuck directly onto your skin or placed inside the underwear against your body.',
    category: 'How to Use',
    badge: 'Easy Application'
  },
  {
    id: 4,
    question: 'Can I use ZEBA directly on my skin?',
    answer: 'No. Do not apply the ZEBA heating pad directly to bare skin. Attach it to the outside of a suitable garment and follow all safety instructions on the packaging. If you experience excessive heat, discomfort, redness, or irritation, remove the pad immediately.',
    category: 'Safety & Usage',
    badge: 'Skin Contact Safety'
  },
  {
    id: 5,
    question: 'How long does the ZEBA pad provide warmth?',
    answer: 'The duration of warmth depends on the product specifications and usage conditions. Please check the product packaging for the stated heating duration and temperature. Always follow the recommended usage time and never use the pad longer than instructed.',
    category: 'Heat & Performance',
    badge: 'Soothing Warmth'
  },
  {
    id: 6,
    question: 'How long does ZEBA take to heat up?',
    answer: 'ZEBA begins generating heat after the sealed pouch is opened and the heating ingredients are exposed to air. The time needed to reach the intended temperature may vary. Refer to the packaging for the expected activation and heating time.',
    category: 'Heat & Performance',
    badge: 'Quick Activation'
  }
];
