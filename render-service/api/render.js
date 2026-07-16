// Free, unlimited HTML -> PNG renderer (real Chromium) that hosts the image
// and returns { url }, exactly like HCTI — so the n8n flow needs no other change.
//
// POST /api/render  { html, width?, height?, scale? }  -> 200 { url }
// GET  /api/render  -> 200 { ok: true }  (health check)

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, service: 'fateen-html-renderer' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const html = body.html;
  const width = Number(body.width) || 1080;
  const height = Number(body.height) || 1350;
  const scale = Number(body.scale) || 2;

  if (!html || typeof html !== 'string') {
    res.status(400).json({ error: 'Field "html" (string) is required' });
    return;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: { width, height, deviceScaleFactor: scale }
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    // make sure embedded fonts are fully ready before the screenshot
    try { await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch (e) {}
    await new Promise(r => setTimeout(r, 300));

    const png = await page.screenshot({ type: 'png' });
    await browser.close();
    browser = null;

    const key = 'carousel/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.png';
    const blob = await put(key, png, { access: 'public', contentType: 'image/png' });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    if (browser) { try { await browser.close(); } catch (e) {} }
    res.status(500).json({ error: String((err && err.message) || err) });
  }
};
