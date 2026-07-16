// Fateen renderer — free unlimited HTML->PNG (carousel) and animated MP4 (reel).
// Uploads to Cloudinary and returns { url }. Drop-in for HCTI on /render.
//
//   POST /render  { html, width?, height?, scale? }       -> { url }  (PNG)
//   POST /reel    { content, perSlide?, fps? }             -> { url }  (MP4)
//   GET  /                                                 -> health

const express = require('express');
const puppeteer = require('puppeteer');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const os = require('os');
const path = require('path');
const design = require('./lib/design.js');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const app = express();
app.use(express.json({ limit: '20mb' }));

let _browser;
async function getBrowser() {
  if (!_browser || !_browser.connected) {
    _browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars']
    });
  }
  return _browser;
}

function uploadBuffer(buffer, resource_type, format) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type, format, folder: 'fateen' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpegPath, args);
    let err = '';
    p.stderr.on('data', d => { err += d; });
    p.on('close', code => code === 0 ? resolve() : reject(new Error('ffmpeg exit ' + code + ': ' + err.slice(-500))));
  });
}

function encodeMp4(dir, fps, out) {
  return runFfmpeg(['-y', '-framerate', String(fps), '-i', path.join(dir, 'f%05d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
}

// Mux a (royalty-free) audio track over the video: loop audio, cut to video length.
function muxAudio(video, audio, out) {
  return runFfmpeg(['-y', '-i', video, '-stream_loop', '-1', '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
    '-shortest', '-movflags', '+faststart', out]);
}

async function downloadTo(url, file) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('audio download failed: ' + resp.status);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(file, buf);
}

app.get('/', (req, res) => res.json({ ok: true, service: 'fateen-renderer', endpoints: ['/render', '/reel'] }));

// ---- carousel image ----
app.post('/render', async (req, res) => {
  const { html, width = 1080, height = 1350, scale = 2 } = req.body || {};
  if (!html) return res.status(400).json({ error: 'html required' });
  let page;
  try {
    page = await (await getBrowser()).newPage();
    await page.setViewport({ width, height, deviceScaleFactor: scale });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 });
    try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch (e) {}
    await new Promise(r => setTimeout(r, 250));
    const png = await page.screenshot({ type: 'png' });
    await page.close();
    res.json({ url: await uploadBuffer(png, 'image', 'png') });
  } catch (e) {
    if (page) try { await page.close(); } catch (_) {}
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ---- animated reel (mp4) ----
app.post('/reel', async (req, res) => {
  // `audio` (optional): a public URL to a ROYALTY-FREE track (Pixabay/Mixkit/etc).
  // Do NOT use audio copied from other creators' posts — Instagram will mute/flag it.
  // `targetDuration` (default 30s): total reel length; per-slide time is derived from it.
  const { content, targetDuration = 30, fps = 24, audio } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content required' });
  let data;
  try {
    const s = content.indexOf('{'), e = content.lastIndexOf('}');
    data = JSON.parse(content.substring(s, e + 1));
  } catch (e) { return res.status(400).json({ error: 'invalid content json' }); }
  const slides = Array.isArray(data.slides) ? data.slides : [];
  if (!slides.length) return res.status(400).json({ error: 'no slides' });

  const N = slides.length;
  // ~30s total, spread evenly across slides (min 2.5s each for readability)
  const perSlide = Math.max(2.5, (Number(targetDuration) || 30) / N);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-'));
  let page;
  try {
    page = await (await getBrowser()).newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await page.setContent(design.buildReelDoc(slides, data, perSlide), { waitUntil: 'networkidle0', timeout: 45000 });
    try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch (e) {}
    const totalFrames = Math.round(N * perSlide * fps);
    const advanced = new Set();
    for (let f = 0; f < totalFrames; f++) {
      const t = f / fps, si = Math.floor(t / perSlide);
      if (si > 0 && !advanced.has(si)) { advanced.add(si); await page.evaluate('window.__advance && window.__advance()'); }
      await page.screenshot({ path: path.join(dir, 'f' + String(f).padStart(5, '0') + '.png') });
      await new Promise(r => setTimeout(r, 1000 / fps));
    }
    await page.close(); page = null;
    let mp4 = path.join(dir, 'out.mp4');
    await encodeMp4(dir, fps, mp4);
    if (audio) {
      try {
        const aFile = path.join(dir, 'audio_src');
        await downloadTo(audio, aFile);
        const withAudio = path.join(dir, 'final.mp4');
        await muxAudio(mp4, aFile, withAudio);
        mp4 = withAudio;
      } catch (e) { /* if audio fails, fall back to silent video */ }
    }
    const url = await uploadBuffer(fs.readFileSync(mp4), 'video', 'mp4');
    res.json({ url });
  } catch (e) {
    if (page) try { await page.close(); } catch (_) {}
    res.status(500).json({ error: String(e.message || e) });
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('fateen renderer listening on ' + PORT));
