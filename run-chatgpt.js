const { chromium } = require('playwright-core');

const PROMPTS = process.env.PROMPTS ? JSON.parse(process.env.PROMPTS) : [];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForResponse(page, maxWait = 70000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await sleep(3000);
    const done = await page.evaluate(() => {
      const streaming = document.querySelector('[aria-busy="true"]');
      const resultStreaming = document.querySelector('.result-streaming');
      const text = (document.querySelector('[data-message-author-role="assistant"]')?.innerText || '').trim();
      return !streaming && !resultStreaming && text.length > 5;
    });
    if (done) return true;
  }
  return false;
}

async function runPrompts(prompts) {
  const browser = await chromium.connectOverCDP('http://localhost:55068');
  const results = [];

  // Use the existing context (no new window), create just ONE page total
  const contexts = browser.contexts();
  const ctx = contexts[0];
  const page = await ctx.newPage();

  try {
    for (const p of prompts) {
      try {
        // Navigate to chatgpt.com (new chat each time)
        await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 25000 });
        await sleep(3000);

        // Accept cookies if present
        try {
          const acceptBtn = await page.$('button:has-text("Accept all")');
          if (acceptBtn) { await acceptBtn.click(); await sleep(800); }
        } catch(e) {}

        const input = page.locator('#prompt-textarea');
        await input.click();
        await sleep(400);
        await page.keyboard.type(p.text);
        await sleep(400);
        await page.keyboard.press('Enter');

        await waitForResponse(page, 70000);
        await sleep(800);

        const url = page.url();
        const text = await page.evaluate(() => {
          const els = document.querySelectorAll('[data-message-author-role="assistant"]');
          if (els.length === 0) return '';
          return els[els.length - 1].innerText.substring(0, 700);
        });

        results.push({ id: p.id, prompt: p.text, url, text, error: null });
      } catch (err) {
        results.push({ id: p.id, prompt: p.text, url: 'error', text: '', error: err.message });
      }
    }
  } finally {
    await page.close().catch(() => {});
  }

  // Do NOT call browser.close() — it would close the user's visible Chrome
  console.log(JSON.stringify(results, null, 2));
}

runPrompts(PROMPTS).catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
