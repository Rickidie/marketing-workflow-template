const { chromium } = require('playwright-core');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  // Try positioned off-screen (non-headless but invisible)
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-position=-2000,-2000',
      '--window-size=1280,800'
    ]
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(4000);

  try {
    const acceptBtn = await page.$('button:has-text("Accept all")');
    if (acceptBtn) { await acceptBtn.click(); await sleep(1000); }
  } catch(e) {}

  const input = page.locator('#prompt-textarea');
  await input.click();
  await sleep(300);
  await page.keyboard.type('What is compliance automation?');
  await sleep(300);
  await page.keyboard.press('Enter');

  console.log('Prompt submitted...');

  // Wait for streaming to complete by polling
  const maxWait = 60000;
  const start = Date.now();
  let done = false;
  while (Date.now() - start < maxWait) {
    await sleep(3000);
    const state = await page.evaluate(() => ({
      streaming: !!document.querySelector('[aria-busy="true"]'),
      resultStreaming: !!document.querySelector('.result-streaming'),
      hasText: (document.querySelector('[data-message-author-role="assistant"]')?.innerText || '').length > 0
    }));
    console.log(`  ${Math.round((Date.now()-start)/1000)}s:`, JSON.stringify(state));
    if (!state.streaming && !state.resultStreaming && state.hasText) { done = true; break; }
    if (state.hasText) { done = true; break; }
  }

  const result = await page.evaluate(() => {
    const els = document.querySelectorAll('[data-message-author-role="assistant"]');
    if (els.length === 0) return 'no assistant element';
    const el = els[els.length - 1];
    return el.innerText.substring(0, 700) || el.textContent.substring(0, 700) || 'empty';
  });

  console.log('Done:', done, '\nResponse:', result);
  await browser.close();
}

test().catch(err => { console.error('Error:', err.message); process.exit(1); });
