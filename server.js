const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const KEY_SERVICE_URL = process.env.KEY_SERVICE_URL || 'https://key.bnpanel.top/connect';

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false }));

function allowUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && u.hostname === 'draw.ar-lottery01.com';
  } catch { return false; }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'goku-backend' }));

// Server-side bridge for the existing key-validation service.
// The external service URL is configurable through KEY_SERVICE_URL.
app.post('/api/auth/connect', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const upstream = await fetch(KEY_SERVICE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(req.body || {}),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const text = await upstream.text();
    res.status(upstream.status).type('application/json').send(text);
  } catch (err) {
    res.status(502).json({ success: false, error: 'Authentication service unavailable' });
  }
});

// Server-side bridge for the game's public history endpoints.
app.get('/api/history', async (req, res) => {
  const target = req.query.url;
  if (!target || !allowUrl(target)) return res.status(400).json({ error: 'Invalid history URL' });
  try {
    const upstream = await fetch(target, { headers: { accept: 'application/json' } });
    const text = await upstream.text();
    res.status(upstream.status).type('application/json').send(text);
  } catch {
    res.status(502).json({ error: 'History service unavailable' });
  }
});

// Serve the existing frontend without changing its page structure.
app.use(express.static(__dirname, { extensions: ['html'] }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

app.listen(PORT, () => console.log(`GOKU backend listening on :${PORT}`));
