// Inspect a chat page that already contains a real response.
// Goal: list every container with substantial text, plus its selector path,
// so we can pick the right one for the response extractor.
//
// Usage: Set TARGETS below to actual chat URLs from your session before running.
// The URLs must be active sessions where you are already logged in via the
// CDP-connected Chrome instance.
const { chromium } = require('playwright-core');

const TARGETS = {
  // Replace these placeholder URLs with real chat session URLs from your browser
  claude: 'https://claude.ai/chat/your-session-id-here',
  meta: 'https://www.meta.ai/prompt/your-session-id-here',
};

async function inspect() {
  const browser = await chromium.connectOverCDP(`http://localhost:55068`);
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  for (const [name, url] of Object.entries(TARGETS)) {
    console.log(`\n=== ${name} ===\n${url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 6000));

      const state = await page.evaluate(() => {
        function path(el) {
          const parts = [];
          let cur = el;
          for (let i = 0; i < 4 && cur && cur !== document.body; i++) {
            let p = cur.tagName.toLowerCase();
            if (cur.id) p += '#' + cur.id;
            const testid = cur.getAttribute('data-testid');
            if (testid) p += `[data-testid="${testid}"]`;
            const cls = (cur.className || '').toString().split(/\s+/).filter(c => c.length).slice(0, 2).join('.');
            if (cls) p += '.' + cls;
            parts.unshift(p);
            cur = cur.parentElement;
          }
          return parts.join(' > ');
        }
        // List all elements with substantial direct text content
        const elements = Array.from(document.querySelectorAll('*'))
          .filter(el => {
            const t = el.innerText || '';
            return t.length > 200 && t.length < 4000;
          })
          .map(el => ({
            tag: el.tagName,
            testid: el.getAttribute('data-testid') || null,
            cls: (el.className || '').toString().substring(0, 100),
            len: (el.innerText || '').length,
            path: path(el),
            sample: (el.innerText || '').replace(/\n+/g, ' | ').substring(0, 180),
          }));
        // Dedupe by len (rough) and take the smallest 8 (most specific containers)
        elements.sort((a, b) => a.len - b.len);
        return elements.slice(0, 8);
      });
      console.log(JSON.stringify(state, null, 2));
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  await page.close();
}

inspect().catch(e => { console.error(e); process.exit(1); });
