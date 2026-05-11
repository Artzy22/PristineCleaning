// Vercel serverless function — receives lead JSON from /api/lead and appends a row to a Google Sheet.
// Also fires a server-side Meta Conversions API "Schedule" event (deduped with the browser pixel via event_id).
// Required env vars (set in Vercel project settings):
//   GOOGLE_SHEET_ID                 - the spreadsheet ID from its URL
//   GOOGLE_SERVICE_ACCOUNT_EMAIL    - service account email (xxx@yyy.iam.gserviceaccount.com)
//   GOOGLE_PRIVATE_KEY              - the service account private key (paste full PEM; \n will be normalized)
//   GOOGLE_SHEET_TAB                - optional, defaults to "Leads"
//   META_PIXEL_ID                   - Meta Pixel ID (e.g. 3963782680424186)
//   META_ACCESS_TOKEN               - Meta Conversions API access token
//   META_TEST_EVENT_CODE            - optional; set while testing in Events Manager → Test Events

import { google } from 'googleapis';
import crypto from 'crypto';

const sha256 = (v) => crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');

async function sendMetaCapiEvent({ body, req, eventId }) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const phoneDigits = (body.phone || '').replace(/\D/g, '');
  const userData = {
    em: body.email ? [sha256(body.email)] : undefined,
    ph: phoneDigits ? [sha256(phoneDigits)] : undefined,
    fn: body.firstName ? [sha256(body.firstName)] : undefined,
    ln: body.lastName ? [sha256(body.lastName)] : undefined,
    ct: body.city ? [sha256(body.city)] : undefined,
    st: body.state ? [sha256(body.state)] : undefined,
    zp: body.postalCode ? [sha256(body.postalCode)] : undefined,
    country: [sha256('us')],
    client_ip_address: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
    client_user_agent: req.headers['user-agent']
  };
  Object.keys(userData).forEach(k => userData[k] === undefined && delete userData[k]);

  const payload = {
    data: [{
      event_name: 'Schedule',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: body.pageUrl || undefined,
      user_data: userData,
      custom_data: {
        content_name: 'Pristine Quiz',
        home_type: body.homeType,
        bedrooms: body.bedrooms,
        frequency: body.frequency
      }
    }]
  };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    console.error('Meta CAPI error:', r.status, text);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const required = ['firstName', 'lastName', 'phone', 'email'];
  for (const k of required) {
    if (!body[k]) return res.status(400).json({ error: 'Missing field: ' + k });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const tab = process.env.GOOGLE_SHEET_TAB || 'Leads';

  if (!sheetId || !clientEmail || !privateKey) {
    const missing = [];
    if (!sheetId) missing.push('GOOGLE_SHEET_ID');
    if (!clientEmail) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    if (!privateKey) missing.push('GOOGLE_PRIVATE_KEY');
    console.error('Missing Google env vars:', missing);
    return res.status(500).json({ error: 'Server not configured', missing });
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const row = [
      body.submittedAt || new Date().toISOString(),
      body.firstName,
      body.lastName,
      body.phone,
      body.email,
      body.homeType || '',
      body.bedrooms || '',
      body.frequency || '',
      body.address1 || '',
      body.city || '',
      body.state || '',
      body.postalCode || '',
      body.consent ? 'yes' : 'no',
      body.pageUrl || '',
      body.referrer || '',
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
      req.headers['user-agent'] || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tab}!A:Q`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });

    const eventId = body.eventId || crypto.randomUUID();
    try { await sendMetaCapiEvent({ body, req, eventId }); }
    catch (e) { console.error('CAPI send failed:', e?.message); }

    return res.status(200).json({ ok: true, eventId });
  } catch (err) {
    console.error('Sheet append failed:', err);
    return res.status(500).json({
      error: 'Failed to save lead',
      detail: err?.message || String(err),
      code: err?.code || null
    });
  }
}
