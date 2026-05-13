const { chromium } = require('playwright-core');

const PROMPTS = process.env.PROMPTS ? JSON.parse(process.env.PROMPTS) : [];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runPrompts(prompts) {
  const browser = await chromium.connectOverCDP('http://localhost:55068');
  const results = [];

  // Use the existing context — create just ONE page total (one tab in visible Chrome)
  const contexts = browser.contexts();
  const ctx = contexts[0];
  const page = await ctx.newPage();

  try {
    for (const p of prompts) {
      try {
        await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 25000 });
        await sleep(7000);

        const input = page.locator('[contenteditable="true"]').first();
        await input.click();
        await sleep(500);
        await page.keyboard.type(p.text);
        await sleep(500);
        await page.keyboard.press('Enter');
        await sleep(28000);

        const url = page.url();
        const text = await page.evaluate(() => {
          const body = document.body.innerText;
          const idx = body.indexOf('Gemini said');
          if (idx > -1) return body.substring(idx, idx + 700);
          return body.substring(0, 700);
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
