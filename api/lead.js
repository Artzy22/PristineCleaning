// Vercel serverless function — receives lead JSON from /api/lead and appends a row to a Google Sheet.
// Required env vars (set in Vercel project settings):
//   GOOGLE_SHEET_ID                 - the spreadsheet ID from its URL
//   GOOGLE_SERVICE_ACCOUNT_EMAIL    - service account email (xxx@yyy.iam.gserviceaccount.com)
//   GOOGLE_PRIVATE_KEY              - the service account private key (paste full PEM; \n will be normalized)
//   GOOGLE_SHEET_TAB                - optional, defaults to "Leads"

import { google } from 'googleapis';

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
    console.error('Missing Google env vars');
    return res.status(500).json({ error: 'Server not configured' });
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

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Sheet append failed:', err.message);
    return res.status(500).json({ error: 'Failed to save lead' });
  }
}
