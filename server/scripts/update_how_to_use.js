import { query } from '../src/config/db.js';

async function updateHowToUse() {
  try {
    const steps = [
      {
        step: '01',
        title: 'Remove from packaging',
        subtitle: 'Heats up within 5 mins',
        desc: 'Simple and convenient to use, the ZEBA Pain Relief Heating Pad heats up within 5 minutes when exposed to air. The pad should feel soft when it is working.',
        badge: 'Zero Skin Irritation'
      },
      {
        step: '02',
        title: 'Stick it on',
        subtitle: 'Apply to underwear exterior',
        desc: 'Stick the pad securely to your underwear and enjoy soothing warmth and relief. Every hour, remove it for 5 minutes to give your skin a short break, then reattach it.',
        badge: 'Instant Thermal Core'
      },
      {
        step: '03',
        title: 'Go forth, worry-free',
        subtitle: 'Continuous muscle relaxation',
        desc: 'Designed for life on the go, the ZEBA Period Pain Relief Heating Pad provides discreet, soothing relief from cramps, so you can stay comfortable and carry on with your day.',
        badge: 'Clinically Proven Heat'
      }
    ];

    await query(
      `INSERT INTO site_content (section_key, title, content, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (section_key) DO UPDATE SET content = EXCLUDED.content, title = EXCLUDED.title`,
      ['how_to_use_steps', 'How It Works & Application', JSON.stringify(steps)]
    );

    console.log('✅ Successfully updated how_to_use_steps in site_content database table.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating site_content:', err);
    process.exit(1);
  }
}

updateHowToUse();
