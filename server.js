// Caption Board — local prototype server
// ----------------------------------------
// What this file does, in plain terms:
//  1. Serves the built React dashboard (dist/, produced by `npm run build`
//     in client/) in your browser.
//  2. Gives every visitor a random ID (stored in a cookie) so we can track
//     their usage — this stands in for "user accounts" until you add real
//     login later.
//  3. Keeps a tiny local "database" (usage-db.json) of how many captions
//     each ID has generated this month, and which plan (free/pro) they're
//     simulating. This is shared by every tool in the suite, not just
//     Captions, so a future tool can reuse the same tier/usage check.
//  4. Calls Claude's API (with YOUR secret key, kept only on the server —
//     never sent to the browser) to actually generate the captions.
//
// Nothing here talks to the internet except the one call to Anthropic/Groq.

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const GROQ_MODEL = 'openai/gpt-oss-120b';

// Which provider to actually call. You can set LLM_PROVIDER explicitly in
// .env, or just leave it out — it auto-picks Groq if you only have a Groq
// key, so testing works with zero cost and zero card on file. When you add
// real Claude billing later, set ANTHROPIC_API_KEY (and optionally
// LLM_PROVIDER=anthropic) and nothing else in this file needs to change.
const PROVIDER = process.env.LLM_PROVIDER || (GROQ_KEY ? 'groq' : 'anthropic');

if (PROVIDER === 'anthropic' && !ANTHROPIC_KEY) {
  console.warn('\n⚠️  No ANTHROPIC_API_KEY found. Copy .env.example to .env and add a key (Anthropic or Groq).\n');
}
if (PROVIDER === 'groq' && !GROQ_KEY) {
  console.warn('\n⚠️  No GROQ_API_KEY found. Copy .env.example to .env and add a key (Anthropic or Groq).\n');
}
console.log(`Using LLM provider: ${PROVIDER}`);

// One function, two backends. Both are asked for the same JSON-array shape,
// so the rest of the server doesn't care which one answered.
async function callLLM(prompt) {
  if (PROVIDER === 'groq') {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) throw new Error(`Groq API error ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return data.choices?.[0]?.message?.content || '';
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic API error ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.content?.[0]?.text || '';
}

// ---------- tiny local "database" ----------
const DB_PATH = path.join(__dirname, 'usage-db.json');

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return {}; }
}
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

const LIMITS = { free: 15, pro: 300 }; // generations per calendar month
const currentMonth = () => new Date().toISOString().slice(0, 7); // "2026-09"

// Reads (or creates) this visitor's record, resetting their count if the
// calendar month has rolled over since they last generated something.
function getRecord(userId) {
  const db = loadDB();
  const month = currentMonth();
  let rec = db[userId];
  if (!rec || rec.month !== month) {
    rec = { tier: rec?.tier || 'free', month, used: 0 };
  }
  db[userId] = rec;
  saveDB(db);
  return rec;
}
function writeRecord(userId, rec) {
  const db = loadDB();
  db[userId] = rec;
  saveDB(db);
}

// ---------- cookie-based visitor ID (no extra dependency needed) ----------
function getUserId(req, res) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0])
  );
  let id = cookies.cb_uid;
  if (!id) {
    id = crypto.randomUUID();
    res.setHeader('Set-Cookie', `cb_uid=${id}; Path=/; Max-Age=${60 * 60 * 24 * 365}; HttpOnly; SameSite=Lax`);
  }
  return id;
}

// ---------- routes ----------

// Who am I, what plan, how much have I used? Any tool in the suite can call
// this — it's not specific to Captions.
app.get('/api/me', (req, res) => {
  const userId = getUserId(req, res);
  const rec = getRecord(userId);
  res.json({
    tier: rec.tier,
    used: rec.used,
    limit: LIMITS[rec.tier],
    remaining: Math.max(0, LIMITS[rec.tier] - rec.used),
  });
});

// DEV ONLY: flip between free/pro to simulate a purchase. Delete this route
// once real billing (Stripe) decides the tier instead.
app.post('/api/set-tier', (req, res) => {
  const userId = getUserId(req, res);
  const tier = req.body.tier === 'pro' ? 'pro' : 'free';
  const rec = getRecord(userId);
  rec.tier = tier;
  writeRecord(userId, rec);
  res.json({ tier: rec.tier, used: rec.used, limit: LIMITS[rec.tier] });
});

// The actual caption generation call.
app.post('/api/generate', async (req, res) => {
  try {
    const userId = getUserId(req, res);
    const rec = getRecord(userId);
    const limit = LIMITS[rec.tier];

    if (rec.used >= limit) {
      return res.status(429).json({
        error: 'limit_reached',
        message: rec.tier === 'free'
          ? "You've used all 15 free captions this month."
          : "You've hit your plan's monthly cap.",
      });
    }

    const { topic, platform, tone } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'invalid_request', message: 'Topic is required.' });
    }
    if (PROVIDER === 'groq' && !GROQ_KEY) {
      return res.status(500).json({ error: 'no_api_key', message: 'Server has no GROQ_API_KEY set.' });
    }
    if (PROVIDER === 'anthropic' && !ANTHROPIC_KEY) {
      return res.status(500).json({ error: 'no_api_key', message: 'Server has no ANTHROPIC_API_KEY set.' });
    }

    const platformInfo = {
      ig: { label: 'Instagram', brief: '1-3 sentences, warm and visual, light emoji use is fine, 4-6 relevant hashtags.' },
      tt: { label: 'TikTok', brief: 'a punchy hook as the first few words, casual and fast, 2-4 hashtags.' },
      x: { label: 'X', brief: 'under 220 characters, sharp and witty, at most 1-2 hashtags.' },
    };
    const p = platformInfo[platform] || platformInfo.ig;

    const prompt = `Write 5 different social media captions for a ${p.label} post.
Post is about: ${topic}
Tone: ${tone || 'Playful'}
Platform style: ${p.brief}
Each caption must be genuinely different in angle/hook, not just reworded.
Reply with ONLY a JSON array of 5 objects, each shaped exactly like:
{"caption": "the caption text", "hashtags": ["tag1","tag2"]}
No hashtags inside "caption" itself. Lowercase hashtags, no # symbol. No preamble, no markdown fences.`;

    let rawText;
    try {
      rawText = await callLLM(prompt);
    } catch (err) {
      console.error(err);
      return res.status(502).json({ error: 'upstream_error', message: `${PROVIDER} API call failed.` });
    }
    const captions = parseCaptionsJSON(rawText);

    if (!captions) {
      return res.status(502).json({ error: 'invalid_json', message: "Couldn't parse a caption list from the reply." });
    }

    rec.used += 1;
    writeRecord(userId, rec);

    res.json({ captions, used: rec.used, limit, remaining: Math.max(0, limit - rec.used) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', message: 'Something went wrong on the server.' });
  }
});

// Tolerant JSON extraction: handles a bare array, a markdown code fence, or
// a value with a stray sentence before/after it.
function parseCaptionsJSON(text) {
  const attempts = [
    text,
    text.replace(/```json|```/g, ''),
  ];
  for (const t of attempts) {
    try {
      const parsed = JSON.parse(t.trim());
      if (Array.isArray(parsed)) return parsed;
    } catch { /* try next */ }
  }
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const parsed = JSON.parse(text.slice(start, end + 1));
      if (Array.isArray(parsed)) return parsed;
    } catch { /* give up */ }
  }
  return null;
}

// ---------- serve the built React dashboard ----------
const DIST_DIR = path.join(__dirname, 'dist');
const hasBuild = fs.existsSync(path.join(DIST_DIR, 'index.html'));

if (hasBuild) {
  app.use(express.static(DIST_DIR));
  // SPA fallback: any route that isn't /api/* or a real static file goes to
  // index.html, so React Router can handle client-side paths like /captions
  // on a hard refresh.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.status(503).send(
      'The dashboard has not been built yet. Run "npm start" from the ' +
      'project root (it builds the client automatically), or run ' +
      '"npm run build" first.'
    );
  });
}

app.listen(PORT, () => {
  console.log(`\n✅ Caption Board running at http://localhost:${PORT}\n`);
});
