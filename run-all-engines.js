#!/usr/bin/env node
/* eslint-disable no-console */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CDP_URL = process.env.CDP_URL || 'http://localhost:55068';
const RUN_DATE = process.env.RUN_DATE || new Date().toISOString().slice(0, 10);
const OUT_DIR = path.join(__dirname, 'reports', 'geo-monitor', RUN_DATE);
const OUT_FILE = path.join(OUT_DIR, 'raw-responses.jsonl');
const PROMPT_FILE = path.join(__dirname, '_context', 'geo-prompt-universe.md');

const ENGINES_FILTER = process.env.ENGINES ? process.env.ENGINES.split(',').map(s => s.trim()) : null;
const PROMPTS_LIMIT = process.env.PROMPTS_LIMIT ? parseInt(process.env.PROMPTS_LIMIT, 10) : null;

fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function parsePrompts() {
  const md = fs.readFileSync(PROMPT_FILE, 'utf8');
  const prompts = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^\|\s*([PCUTX]-\d{2})\s*\|\s*(.+?)\s*\|$/);
    if (m && !line.includes('--')) prompts.push({ id: m[1], text: m[2] });
  }
  return prompts;
}

// Stratified (round-robin) ordering across the 5 prompt categories.
// File order is P-01..P-15, C-01..C-20, U-01..U-20, X-01..X-10, T-01..T-05 —
// running in that order means a partial run that dies after 25 prompts gets
// all 15 P prompts, 10 C prompts, and zero from U/X/T. SoV averaged across
// that biased subset is not comparable to a full run.
//
// Round-robin walks the categories in parallel: P-01, C-01, U-01, X-01, T-01,
// P-02, C-02, U-02, X-02, T-02, ... so any prefix of the order is a
// proportional cross-category sample. After 25 prompts you have ~5 from each
// category instead of 15+10+0+0+0. Once stratified, partial runs at 30%
// coverage are statistically defensible — which is why MIN_COVERAGE_FOR_TREND
// in the dashboard drops from 50% to 30%.
//
// Ordering is deterministic per RUN_DATE: the round-robin is stable, but the
// within-category order is shuffled with a seed derived from RUN_DATE so
// different weeks rotate which exact prompts get sampled if a run truncates.
// Same-date re-runs produce the same order, which keeps the resume logic
// (loadDone) consistent across retries within a single day.
function stratifyPrompts(prompts, runDate) {
  const byCat = new Map();
  for (const p of prompts) {
    const cat = p.id[0]; // P / C / U / X / T
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(p);
  }

  // Deterministic shuffle within each category seeded by run date — gives a
  // different prompt-within-category sample each week without breaking
  // reproducibility.
  const rand = mulberry32(hashString(runDate));
  for (const list of byCat.values()) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }

  // Round-robin across categories. We walk in order [P, C, U, X, T] each
  // round, drop categories as they're exhausted. This ordering puts the
  // strongest signal (Brand/Product) first in each round so even a 5-prompt
  // truncation captures one anchor data point per category cycle.
  const order = ['P', 'C', 'U', 'X', 'T'];
  const cursors = Object.fromEntries(order.map((c) => [c, 0]));
  const out = [];
  while (out.length < prompts.length) {
    let added = 0;
    for (const cat of order) {
      const list = byCat.get(cat) || [];
      if (cursors[cat] < list.length) {
        out.push(list[cursors[cat]++]);
        added++;
      }
    }
    if (added === 0) break; // safety — all categories drained
  }
  return out;
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadDone() {
  if (!fs.existsSync(OUT_FILE)) return new Set();
  const done = new Set();
  for (const line of fs.readFileSync(OUT_FILE, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      if (r.engine && r.prompt_id && !r.error) done.add(`${r.engine}|${r.prompt_id}`);
    } catch {}
  }
  return done;
}

function append(row) { fs.appendFileSync(OUT_FILE, JSON.stringify(row) + '\n'); }

async function findOrCreatePage(ctx, hostname) {
  const pages = ctx.pages();
  let page = pages.find(p => p.url().includes(hostname));
  if (page) return page;
  return await ctx.newPage();
}

async function typeAndSubmit(page, selector, text) {
  const input = page.locator(selector).first();
  await input.click({ timeout: 8000 });
  await sleep(300);
  // Clear existing content
  await page.keyboard.press('Meta+A').catch(() => {});
  await page.keyboard.press('Backspace').catch(() => {});
  await sleep(200);
  await page.keyboard.type(text, { delay: 8 });
  await sleep(400);
  await page.keyboard.press('Enter');
}

async function readMain(page, max = 4000) {
  return await page.evaluate((m) => {
    const main = document.querySelector('main') || document.body;
    return (main.innerText || '').substring(0, m);
  }, max);
}

// ---- Engine handlers ----
const engines = {
  async perplexity(ctx, prompt) {
    const page = await findOrCreatePage(ctx, 'perplexity.ai');
    await page.goto('https://www.perplexity.ai/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(4000);
    await typeAndSubmit(page, '[contenteditable="true"]', prompt.text);
    await sleep(18000);
    return { url: page.url(), text: await readMain(page) };
  },

  async chatgpt(ctx, prompt) {
    const page = await findOrCreatePage(ctx, 'chatgpt.com');
    await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(3500);
    try { const b = await page.$('button:has-text("Accept all")'); if (b) { await b.click(); await sleep(500); } } catch {}
    await typeAndSubmit(page, '#prompt-textarea', prompt.text);
    // Wait for response to settle
    const start = Date.now();
    while (Date.now() - start < 60000) {
      await sleep(2500);
      const ready = await page.evaluate(() => {
        const els = document.querySelectorAll('[data-message-author-role="assistant"]');
        if (!els.length) return false;
        const last = els[els.length - 1];
        const txt = (last.innerText || '').trim();
        const streaming = document.querySelector('.result-streaming, [aria-busy="true"]');
        return !streaming && txt.length > 30;
      });
      if (ready) break;
    }
    await sleep(800);
    const text = await page.evaluate(() => {
      const els = document.querySelectorAll('[data-message-author-role="assistant"]');
      return els.length ? (els[els.length - 1].innerText || '').substring(0, 4000) : '';
    });
    return { url: page.url(), text };
  },

  async google_aio(ctx, prompt) {
    const page = await findOrCreatePage(ctx, 'google.com');
    const q = encodeURIComponent(prompt.text);
    await page.goto(`https://www.google.com/search?q=${q}&udm=50`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(10000);
    return { url: page.url(), text: await readMain(page) };
  },

  async gemini(ctx, prompt) {
    const page = await findOrCreatePage(ctx, 'gemini.google.com');
    await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(6000);
    await typeAndSubmit(page, '[contenteditable="true"]', prompt.text);
    await sleep(28000);
    const text = await page.evaluate(() => {
      const body = document.body.innerText || '';
      const idx = body.indexOf('Gemini said');
      const slice = idx > -1 ? body.substring(idx) : body;
      return slice.substring(0, 4000);
    });
    return { url: page.url(), text };
  },

  async bing_copilot(ctx, prompt) {
    const page = await findOrCreatePage(ctx, 'copilot.microsoft.com');
    await page.goto('https://copilot.microsoft.com/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(5000);
    await typeAndSubmit(page, '#userInput, textarea', prompt.text);
    // Wait for AI response article to render with substantive text
    const start = Date.now();
    while (Date.now() - start < 70000) {
      await sleep(3000);
      const ready = await page.evaluate(() => {
        const els = document.querySelectorAll('main [role="article"]');
        if (els.length < 2) return false; // user article + AI article
        const last = els[els.length - 1];
        return (last.innerText || '').trim().length > 80;
      });
      if (ready) break;
    }
    await sleep(2000);
    const text = await page.evaluate(() => {
      const els = document.querySelectorAll('main [role="article"]');
      if (!els.length) return '';
      return (els[els.length - 1].innerText || '').substring(0, 4000);
    });
    return { url: page.url(), text };
  },

  async claude(ctx, prompt) {
    const page = await findOrCreatePage(ctx, 'claude.ai');
    await page.goto('https://claude.ai/new', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(4000);
    await typeAndSubmit(page, '[contenteditable="true"]', prompt.text);
    const start = Date.now();
    while (Date.now() - start < 80000) {
      await sleep(3000);
      const ready = await page.evaluate(() => {
        const els = document.querySelectorAll('div[class*="font-claude"]');
        if (!els.length) return false;
        const last = els[els.length - 1];
        const txt = (last.innerText || '').trim();
        // streaming flag absent indicates done
        const streaming = document.querySelector('[data-is-streaming="true"]');
        return !streaming && txt.length > 50;
      });
      if (ready) break;
    }
    await sleep(1500);
    const text = await page.evaluate(() => {
      const els = document.querySelectorAll('div[class*="font-claude"]');
      if (els.length) return (els[els.length - 1].innerText || '').substring(0, 4000);
      const ds = document.querySelectorAll('[data-is-streaming]');
      if (ds.length) return (ds[ds.length - 1].innerText || '').substring(0, 4000);
      return '';
    });
    return { url: page.url(), text };
  },

  async meta_ai(ctx, prompt) {
    const page = await findOrCreatePage(ctx, 'meta.ai');
    await page.goto('https://www.meta.ai/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(6000);
    // The textarea is wrapped in a non-clickable layer; use focus+type via evaluate, or force click
    const composer = page.locator('[data-testid="composer-input"], textarea').first();
    try {
      await composer.click({ force: true, timeout: 5000 });
    } catch {
      // fallback: focus via evaluate
      await page.evaluate(() => {
        const ta = document.querySelector('[data-testid="composer-input"], textarea');
        if (ta) ta.focus();
      });
    }
    await sleep(400);
    await page.keyboard.type(prompt.text, { delay: 8 });
    await sleep(400);
    await page.keyboard.press('Enter');
    await sleep(28000);
    const text = await page.evaluate(() => {
      // Try common message containers; fall back to main
      const sels = ['[data-testid*="message"]', 'main [role="article"]', 'main'];
      for (const s of sels) {
        const els = document.querySelectorAll(s);
        if (els.length >= 2) return (els[els.length - 1].innerText || '').substring(0, 4000);
        if (els.length === 1 && (els[0].innerText || '').length > 100) return (els[0].innerText || '').substring(0, 4000);
      }
      return (document.body.innerText || '').substring(0, 4000);
    });
    return { url: page.url(), text };
  },
};

const ENGINE_ORDER = ['perplexity', 'chatgpt', 'google_aio', 'gemini', 'bing_copilot', 'claude', 'meta_ai'];

async function run() {
  const allPrompts = parsePrompts();
  // Stratified round-robin: even if PROMPTS_LIMIT or a mid-run failure
  // truncates the list, the prefix is a proportional cross-category sample.
  const orderedPrompts = stratifyPrompts(allPrompts, RUN_DATE);
  const prompts = PROMPTS_LIMIT ? orderedPrompts.slice(0, PROMPTS_LIMIT) : orderedPrompts;
  const engineList = ENGINES_FILTER || ENGINE_ORDER;
  const done = loadDone();

  console.log(`[init] run_date=${RUN_DATE} prompts=${prompts.length} engines=${engineList.join(',')} already_done=${done.size}`);
  console.log(`[init] order=stratified (P/C/U/X/T round-robin, seed=${RUN_DATE})`);
  console.log(`[init] first 10 prompts: ${prompts.slice(0, 10).map((p) => p.id).join(', ')}`);
  console.log(`[init] output=${OUT_FILE}`);

  const browser = await chromium.connectOverCDP(CDP_URL);
  const ctx = browser.contexts()[0];

  let totalWritten = 0, totalErrors = 0;

  for (const engine of engineList) {
    const handler = engines[engine];
    if (!handler) { console.log(`[skip] unknown: ${engine}`); continue; }
    console.log(`\n=== ${engine} ===`);
    let okCount = 0, errCount = 0;
    const eStart = Date.now();
    for (const p of prompts) {
      const key = `${engine}|${p.id}`;
      if (done.has(key)) { console.log(`  skip ${p.id}`); continue; }
      const t0 = Date.now();
      const row = {
        run_date: RUN_DATE, engine, prompt_id: p.id, prompt_text: p.text,
        url: '', response_text: '', error: null, duration_ms: 0,
        timestamp: new Date().toISOString(),
      };
      try {
        const { url, text } = await handler(ctx, p);
        row.url = url; row.response_text = text;
        if (!text || text.length < 30) { row.error = 'empty_or_short_response'; errCount++; totalErrors++; }
        else { okCount++; totalWritten++; }
      } catch (err) {
        row.error = (err.message || String(err)).substring(0, 300);
        errCount++; totalErrors++;
      }
      row.duration_ms = Date.now() - t0;
      append(row);
      const tag = row.error ? `ERR ${row.error.substring(0,50)}` : `OK ${row.response_text.length}ch`;
      console.log(`  ${p.id} (${(row.duration_ms/1000).toFixed(1)}s) ${tag}`);
    }
    console.log(`=== ${engine}: ok=${okCount} err=${errCount} elapsed=${((Date.now()-eStart)/60000).toFixed(1)}min ===`);
  }

  console.log(`\n[done] total_written=${totalWritten} total_errors=${totalErrors}`);
  console.log(`[done] file=${OUT_FILE}`);
}

run().catch(e => { console.error('[fatal]', e); process.exit(1); });
