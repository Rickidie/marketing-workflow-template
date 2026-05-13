// Unified CDP-based prompt runner for all AI engines.
//
// Connects to the user's already-authenticated Chrome via CDP — never launches
// a fresh browser. One page is reused across all prompts in a single run.
//
// Env vars:
//   ENGINE   — one of: perplexity, chatgpt, google-aio, gemini, bing, claude, meta
//   PROMPTS  — JSON array: [{ "id": "P-01", "text": "..." }, ...]
//   CDP_PORT — defaults to 55068
//
// Output: JSON array on stdout: [{ id, prompt, engine, url, text, status, error }]
//   status is "ok" (response captured), "not-shown" (Google AIO didn't render),
//   "blocked" (login wall / captcha / unreachable), or "error" (anything else).
// Never writes to Notion — the agent layer does scoring + writing.

const { chromium } = require('playwright-core');

const fs = require('fs');
const path = require('path');

const ENGINE = (process.env.ENGINE || '').toLowerCase();
const PROMPTS = process.env.PROMPTS ? JSON.parse(process.env.PROMPTS) : [];
const CDP_PORT = process.env.CDP_PORT || '55068';
const EXCERPT_LEN = 700;
const INTER_PROMPT_MS = parseInt(process.env.INTER_PROMPT_MS || '1500', 10);
// Outer stall watchdog: if engine.run() does not complete within this window,
// interrupt the page (window.stop + about:blank) and continue to the next prompt.
// Set comfortably above the longest internal waitUntil (Claude: 120s) plus buffer.
const STALL_TIMEOUT_MS = parseInt(process.env.STALL_TIMEOUT_MS || '180000', 10);
// JSONL incremental log path — survives mid-run kills. One line per prompt.
const JSONL_PATH = process.env.JSONL_PATH || `/tmp/geo-run/${ENGINE}.jsonl`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Poll-based wait: calls predicate every `intervalMs` until true or timeout.
async function waitUntil(page, predicate, { timeout = 60000, intervalMs = 2500 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (await page.evaluate(predicate)) return true;
    } catch (_) {}
    await sleep(intervalMs);
  }
  return false;
}

// Per-engine configuration. Each entry returns { url, text, status }.
// Engines never throw for normal "no response" / "blocked" — they return a status.
const ENGINES = {
  perplexity: {
    url: 'https://www.perplexity.ai/',
    async run(page, prompt) {
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(3500);

      // Perplexity now uses a contenteditable div with id="ask-input"
      const input = page.locator('#ask-input, textarea, [contenteditable="true"]').first();
      await input.click();
      await sleep(300);
      await page.keyboard.type(prompt.text);
      await sleep(300);
      await page.keyboard.press('Enter');

      // Wait for the answer to render. Perplexity puts the answer body under
      // main and grows it as the response streams. Wait until it exceeds a
      // size threshold and then stabilises.
      await waitUntil(page, () => {
        const main = document.querySelector('main');
        return (main?.innerText || '').length > 400;
      }, { timeout: 60000 });

      // Settle: poll innerText length and exit when it stops growing.
      let last = 0;
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1500));
        const cur = await page.evaluate(() => (document.querySelector('main')?.innerText || '').length);
        if (cur === last && cur > 400) break;
        last = cur;
      }

      const text = await page.evaluate((n) => {
        // Strip nav/sidebar by anchoring on the deepest answer container.
        // Perplexity renders the assistant text inside an element whose
        // descendants include both citation links and the prose.
        const main = document.querySelector('main');
        if (!main) return '';
        const raw = (main.innerText || '').trim();
        // Drop the prompt itself if it leads the block
        const lines = raw.split('\n').filter((l) => l.trim().length);
        return lines.join('\n').substring(0, n);
      }, EXCERPT_LEN);

      if (!text) return { url: page.url(), text: '', status: 'blocked' };
      return { url: page.url(), text, status: 'ok' };
    },
  },

  chatgpt: {
    url: 'https://chatgpt.com/',
    async run(page, prompt) {
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(3000);

      // Detect login wall
      const loggedOut = await page.$('button:has-text("Log in"), button:has-text("Sign up")');
      const composer = await page.$('#prompt-textarea');
      if (loggedOut && !composer) return { url: page.url(), text: '', status: 'blocked' };

      try {
        const acceptBtn = await page.$('button:has-text("Accept all")');
        if (acceptBtn) { await acceptBtn.click(); await sleep(600); }
      } catch (_) {}

      // Dismiss "Too many requests" rate-limit dialog if present
      try {
        const gotIt = await page.$('button:has-text("Got it")');
        if (gotIt) { await gotIt.click(); await sleep(1200); }
      } catch (_) {}

      // If rate-limit dialog text is on the page, mark this prompt blocked
      // and let the inter-prompt delay let the limit cool off.
      const rateLimited = await page.evaluate(() =>
        /Too many requests|You're making requests too quickly/i.test(document.body.innerText || '')
      );
      if (rateLimited) return { url: page.url(), text: '', status: 'blocked' };

      const input = page.locator('#prompt-textarea');
      await input.click();
      await sleep(400);
      await page.keyboard.type(prompt.text);
      await sleep(400);
      await page.keyboard.press('Enter');

      await waitUntil(page, () => {
        const streaming = document.querySelector('[aria-busy="true"], .result-streaming');
        const ans = document.querySelector('[data-message-author-role="assistant"]');
        const text = (ans?.innerText || '').trim();
        return !streaming && text.length > 20;
      }, { timeout: 75000 });
      await sleep(800);

      const text = await page.evaluate((n) => {
        const els = document.querySelectorAll('[data-message-author-role="assistant"]');
        if (!els.length) return '';
        return (els[els.length - 1].innerText || '').substring(0, n);
      }, EXCERPT_LEN);

      if (!text) return { url: page.url(), text: '', status: 'blocked' };
      return { url: page.url(), text, status: 'ok' };
    },
  },

  'google-aio': {
    url: 'https://www.google.com/',
    async run(page, prompt) {
      const q = encodeURIComponent(prompt.text);
      await page.goto(`https://www.google.com/search?q=${q}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(5500); // AI Overview lazily renders

      // Look for the AI Overview block
      const result = await page.evaluate((n) => {
        // AI Overview labels Google uses; bot detection-resistant text-based scan
        const labelPatterns = [/AI Overview/i, /Generated by AI/i, /Powered by Gemini/i];
        const candidates = Array.from(document.querySelectorAll('div, section, c-wiz'))
          .filter((el) => {
            const t = el.innerText || '';
            if (t.length < 60 || t.length > 8000) return false;
            return labelPatterns.some((p) => p.test(t));
          });
        if (!candidates.length) return { found: false, text: '' };
        // Pick the smallest container that matches (most specific)
        candidates.sort((a, b) => (a.innerText.length - b.innerText.length));
        return { found: true, text: candidates[0].innerText.substring(0, n) };
      }, EXCERPT_LEN);

      if (!result.found) return { url: page.url(), text: '', status: 'not-shown' };
      return { url: page.url(), text: result.text, status: 'ok' };
    },
  },

  gemini: {
    url: 'https://gemini.google.com/app',
    async run(page, prompt) {
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(7000);

      const signIn = await page.$('a:has-text("Sign in"), button:has-text("Sign in")');
      const input = await page.$('[contenteditable="true"]');
      if (signIn && !input) return { url: page.url(), text: '', status: 'blocked' };

      const editable = page.locator('[contenteditable="true"]').first();
      await editable.click();
      await sleep(500);
      await page.keyboard.type(prompt.text);
      await sleep(500);
      await page.keyboard.press('Enter');

      await waitUntil(page, () => {
        const body = document.body.innerText || '';
        return body.includes('Gemini said') || body.length > 800;
      }, { timeout: 60000 });
      await sleep(3000);

      const text = await page.evaluate((n) => {
        const body = document.body.innerText || '';
        const idx = body.indexOf('Gemini said');
        if (idx > -1) return body.substring(idx, idx + n);
        return body.substring(0, n);
      }, EXCERPT_LEN);

      if (!text) return { url: page.url(), text: '', status: 'blocked' };
      return { url: page.url(), text, status: 'ok' };
    },
  },

  bing: {
    url: 'https://www.bing.com/chat',
    async run(page, prompt) {
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(5000);

      // Bing Copilot uses an editable contenteditable or textarea, varies by region
      const input = page.locator('textarea, [contenteditable="true"]').first();
      if (!(await input.count())) return { url: page.url(), text: '', status: 'blocked' };

      await input.click();
      await sleep(500);
      await page.keyboard.type(prompt.text);
      await sleep(500);
      await page.keyboard.press('Enter');

      await waitUntil(page, () => (document.body.innerText || '').length > 600,
        { timeout: 60000 });
      await sleep(3000);

      const text = await page.evaluate((n) => {
        // Try common Copilot answer containers
        const sel = [
          '[data-content="ai-message"]',
          '.ac-textBlock',
          'cib-message',
          '[role="article"]',
        ];
        for (const s of sel) {
          const els = document.querySelectorAll(s);
          if (els.length) return (els[els.length - 1].innerText || '').substring(0, n);
        }
        return (document.body.innerText || '').substring(0, n);
      }, EXCERPT_LEN);

      if (!text) return { url: page.url(), text: '', status: 'blocked' };
      return { url: page.url(), text, status: 'ok' };
    },
  },

  claude: {
    url: 'https://claude.ai/new',
    async run(page, prompt) {
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(4000);

      const loggedOut = await page.$('button:has-text("Continue with Google"), button:has-text("Sign in")');
      const composer = await page.$('[data-testid="chat-input"]');
      if (loggedOut && !composer) return { url: page.url(), text: '', status: 'blocked' };

      // Claude uses a TipTap/ProseMirror contenteditable div
      const editable = page.locator('[data-testid="chat-input"]').first();
      await editable.click();
      await sleep(500);
      await page.keyboard.type(prompt.text);
      await sleep(500);
      await page.keyboard.press('Enter');

      // Wait for the FINAL response paragraphs to render. Claude often
      // streams a brief announcement before doing a web search, then renders
      // the real answer 10-30s later. We need to wait for the total response
      // text to grow past the announcement length.
      await waitUntil(page, () => {
        const paragraphs = document.querySelectorAll('.font-claude-response-body');
        if (!paragraphs.length) return false;
        const totalLen = Array.from(paragraphs).reduce((s, p) => s + (p.innerText || '').length, 0);
        return totalLen > 600; // longer than a brief streaming announcement
      }, { timeout: 120000 });

      // Settle: poll total response length until it stops growing
      let last = 0;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const cur = await page.evaluate(() => {
          const ps = document.querySelectorAll('.font-claude-response-body');
          return Array.from(ps).reduce((s, p) => s + (p.innerText || '').length, 0);
        });
        if (cur === last && cur > 600) break;
        last = cur;
      }

      const text = await page.evaluate(({ n }) => {
        // Claude renders each response paragraph as <p class="font-claude-response-body">,
        // grouped under div.standard-markdown. Grab the parent container of the
        // LAST set of these paragraphs (i.e. the most recent assistant turn).
        const paragraphs = document.querySelectorAll('.font-claude-response-body');
        if (!paragraphs.length) return '';
        // Find the closest .standard-markdown ancestor of the last paragraph
        let container = paragraphs[paragraphs.length - 1];
        for (let i = 0; i < 6 && container && container !== document.body; i++) {
          if (container.classList && container.classList.contains('standard-markdown')) break;
          container = container.parentElement;
        }
        if (!container || container === document.body) {
          // Fallback: concat all response paragraphs
          return Array.from(paragraphs).map((p) => p.innerText).join('\n\n').substring(0, n);
        }
        return (container.innerText || '').substring(0, n);
      }, { n: EXCERPT_LEN });

      if (!text || text.length < 40) return { url: page.url(), text, status: 'blocked' };
      return { url: page.url(), text, status: 'ok' };
    },
  },

  meta: {
    url: 'https://www.meta.ai/',
    async run(page, prompt) {
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(5000);

      // Meta has TWO data-testid="composer-input" elements: a hidden <textarea>
      // and a visible contenteditable <div>. Always target the visible one.
      const input = page.locator('div[data-testid="composer-input"][contenteditable], div[contenteditable="true"]:visible').first();
      if (!(await input.count())) return { url: page.url(), text: '', status: 'blocked' };

      await input.click();
      await sleep(500);
      await page.keyboard.type(prompt.text);
      await sleep(500);
      await page.keyboard.press('Enter');

      // Wait for the markdown response container to render and stabilise
      await waitUntil(page, () => {
        const md = document.querySelector('.ur-markdown.prose, .ur-markdown');
        return md && (md.innerText || '').length > 200;
      }, { timeout: 60000 });

      let last = 0;
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1500));
        const cur = await page.evaluate(() => {
          const md = document.querySelector('.ur-markdown.prose, .ur-markdown');
          return md ? (md.innerText || '').length : 0;
        });
        if (cur === last && cur > 200) break;
        last = cur;
      }

      const text = await page.evaluate(({ n }) => {
        // Meta renders the assistant response inside div.ur-markdown.prose
        const md = document.querySelector('.ur-markdown.prose, .ur-markdown');
        if (md) return (md.innerText || '').substring(0, n);
        return '';
      }, { n: EXCERPT_LEN });

      if (!text) return { url: page.url(), text: '', status: 'blocked' };
      return { url: page.url(), text, status: 'ok' };
    },
  },
};

async function main() {
  if (!ENGINE || !ENGINES[ENGINE]) {
    console.error(JSON.stringify({ error: `Unknown ENGINE: "${ENGINE}". Valid: ${Object.keys(ENGINES).join(', ')}` }));
    process.exit(2);
  }
  if (!Array.isArray(PROMPTS) || !PROMPTS.length) {
    console.error(JSON.stringify({ error: 'PROMPTS env var must be a non-empty JSON array of {id, text}' }));
    process.exit(2);
  }

  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  const engine = ENGINES[ENGINE];
  const results = [];

  try {
    for (const p of PROMPTS) {
      let outcome;
      let stalled = false;
      let stallTimerId;
      const stallPromise = new Promise((resolve) => {
        stallTimerId = setTimeout(() => {
          stalled = true;
          page.evaluate(() => window.stop()).catch(() => {});
          resolve({ url: page.url(), text: '', status: 'error', error: `stall-timeout after ${STALL_TIMEOUT_MS}ms` });
        }, STALL_TIMEOUT_MS);
      });
      const workPromise = engine.run(page, p).catch((err) => ({
        url: page.url(), text: '', status: 'error', error: err.message,
      }));
      outcome = await Promise.race([workPromise, stallPromise]);
      clearTimeout(stallTimerId);
      if (stalled) {
        // Reset the page so the next prompt starts from a clean state
        try { await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 }); } catch (_) {}
      }
      const row = {
        id: p.id,
        prompt: p.text,
        engine: ENGINE,
        url: outcome.url,
        text: outcome.text,
        status: outcome.status,
        error: outcome.error || null,
      };
      results.push(row);
      // Append to JSONL immediately — survives mid-run kill
      try {
        fs.mkdirSync(path.dirname(JSONL_PATH), { recursive: true });
        fs.appendFileSync(JSONL_PATH, JSON.stringify(row) + '\n');
      } catch (_) {}
      // Per-prompt progress to stderr
      process.stderr.write(`[${ENGINE}] ${p.id} status=${outcome.status} textlen=${(outcome.text || '').length}\n`);
      // Inter-prompt delay (configurable for rate-limited engines)
      await sleep(INTER_PROMPT_MS);
    }
  } finally {
    await page.close().catch(() => {});
    // Never close the browser — that would kill the user's visible Chrome
  }

  process.stdout.write(JSON.stringify(results));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
