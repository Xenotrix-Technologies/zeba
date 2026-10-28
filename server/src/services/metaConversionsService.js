import crypto from 'crypto';

const DEFAULT_PIXEL_ID = '1770041220950860';
const GRAPH_API_VERSION = 'v19.0';

/**
 * Hash string using SHA-256 (Meta CAPI requirement for PII: email, phone)
 */
function hashSha256(val) {
  if (!val) return undefined;
  const clean = String(val).trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * Format phone number to E.164 without symbols before hashing
 */
function normalizePhone(phone) {
  if (!phone) return undefined;
  let digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`; // Default to India (+91)
  }
  return digits;
}

/**
 * Send server-side conversion event to Meta Conversions API
 * @param {Object} params
 * @param {string} params.eventName - e.g. 'Purchase'
 * @param {string} params.eventId - Unique ID matching client-side Pixel event for deduplication (e.g. `order_${orderNumber}`)
 * @param {Object} params.userData - { email, phone, clientIp, userAgent }
 * @param {Object} params.customData - { value, currency, content_type, contents }
 */
export async function sendMetaConversionsEvent({
  eventName = 'Purchase',
  eventId,
  userData = {},
  customData = {}
}) {
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  // If token is not yet configured, gracefully skip without error
  if (!accessToken) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Meta CAPI] Event skipped: META_ACCESS_TOKEN is not configured in environment.');
    }
    return { success: false, reason: 'META_ACCESS_TOKEN not configured' };
  }

  try {
    const hashedEmail = hashSha256(userData.email);
    const normalizedPhone = normalizePhone(userData.phone);
    const hashedPhone = hashSha256(normalizedPhone);

    const eventPayload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      event_source_url: userData.sourceUrl || 'https://www.zebaofficial.in',
      action_source: 'website',
      user_data: {
        ...(hashedEmail ? { em: [hashedEmail] } : {}),
        ...(hashedPhone ? { ph: [hashedPhone] } : {}),
        ...(userData.clientIp ? { client_ip_address: userData.clientIp } : {}),
        ...(userData.userAgent ? { client_user_agent: userData.userAgent } : {})
      },
      custom_data: {
        currency: customData.currency || 'INR',
        value: typeof customData.value === 'number' ? customData.value : parseFloat(customData.value || 0),
        content_type: 'product',
        ...(customData.contents ? { contents: customData.contents } : {}),
        ...(customData.num_items ? { num_items: customData.num_items } : {})
      }
    };

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [eventPayload]
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.warn('[Meta CAPI] Server API warning:', result.error?.message || result);
      return { success: false, error: result.error };
    }

    console.log(`✅ [Meta CAPI] ${eventName} event recorded (events_received: ${result.events_received})`);
    return { success: true, result };
  } catch (err) {
    console.warn('[Meta CAPI] Network error while sending event:', err.message);
    return { success: false, error: err.message };
  }
}

