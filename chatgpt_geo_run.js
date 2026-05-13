/**
 * ChatGPT GEO Brand Monitor
 * Queries ChatGPT with all prompts from geo-prompt-universe.md, captures responses,
 * writes JSON output. Prompts are loaded from the PROMPTS array below — update them
 * for your brand before running. See _context/geo-prompt-universe.md for the full
 * template prompt universe.
 *
 * NOTE: This script uses headless Playwright with a new browser context. It is a
 * standalone alternative to run-chatgpt.js (which uses CDP to attach to an existing
 * visible Chrome session). Use this script when you need a fully automated, no-GUI run.
 */

const { chromium } = require('playwright-core');
const fs = require('fs');

// Load prompts from geo-prompt-universe.md at runtime, or define them inline here.
// The array below mirrors the template prompt IDs. Replace the text values with
// prompts specific to your brand.
const PROMPTS = [
  // Brand/Product — replace [Your Brand] with your brand name
  { id: 'P-01', category: 'Brand/Product', text: 'What is [Your Brand]?' },
  { id: 'P-02', category: 'Brand/Product', text: 'What does [Your Brand] do?' },
  { id: 'P-03', category: 'Brand/Product', text: 'Is [Your Brand] a good platform?' },
  { id: 'P-04', category: 'Brand/Product', text: 'What AI capabilities does [Your Brand] have?' },
  { id: 'P-05', category: 'Brand/Product', text: 'How does [Your Brand] reduce false positives?' },
  { id: 'P-06', category: 'Brand/Product', text: 'What regulatory jurisdictions does [Your Brand] support?' },
  { id: 'P-07', category: 'Brand/Product', text: "What is [Your Brand]'s core framework?" },
  { id: 'P-08', category: 'Brand/Product', text: 'Can [Your Brand] integrate with existing systems?' },
  { id: 'P-09', category: 'Brand/Product', text: 'Is [Your Brand] SOC2 compliant?' },
  { id: 'P-10', category: 'Brand/Product', text: 'What industries does [Your Brand] serve?' },
  { id: 'P-11', category: 'Brand/Product', text: 'Is [Your Brand] suitable for digital businesses?' },
  { id: 'P-12', category: 'Brand/Product', text: "What is [Your Brand]'s onboarding technology?" },
  { id: 'P-13', category: 'Brand/Product', text: 'How does [Your Brand] compare to traditional platforms?' },
  { id: 'P-14', category: 'Brand/Product', text: 'Who founded [Your Brand] and where is it headquartered?' },
  { id: 'P-15', category: 'Brand/Product', text: "What results do [Your Brand]'s clients typically achieve?" },
  // Category — update for your product category
  { id: 'C-01', category: 'Category', text: 'What is the best [your category] platform for [your primary audience]?' },
  { id: 'C-02', category: 'Category', text: 'What [your category] software should a [your buyer persona] use?' },
  { id: 'C-03', category: 'Category', text: 'Best [your category] software for [your market]' },
  { id: 'C-04', category: 'Category', text: 'Top [your category] platforms 2025' },
  { id: 'C-05', category: 'Category', text: 'What is the best [your category] platform for regulated [your industry]?' },
  { id: 'C-06', category: 'Category', text: 'AI-native [your category] platforms' },
  { id: 'C-07', category: 'Category', text: 'What [your category] software do [your buyer] use?' },
  { id: 'C-08', category: 'Category', text: 'Best [your category] platform for a startup in [your primary market]' },
  { id: 'C-09', category: 'Category', text: '[your category] tools for [your geographic region] institutions' },
  { id: 'C-10', category: 'Category', text: 'What is the best [your workflow] software for [your use case]?' },
  { id: 'C-11', category: 'Category', text: 'Top [your category] tools for [your audience segment]' },
  { id: 'C-12', category: 'Category', text: '[your category] software with AI automation' },
  { id: 'C-13', category: 'Category', text: 'Best tools for [your primary pain point]' },
  { id: 'C-14', category: 'Category', text: '[your category] platform for [your secondary audience]' },
  { id: 'C-15', category: 'Category', text: 'What software do [your buyer] teams use for [your workflow]?' },
  { id: 'C-16', category: 'Category', text: 'AI [your category] platform' },
  { id: 'C-17', category: 'Category', text: 'No-code [your category] platform' },
  { id: 'C-18', category: 'Category', text: 'Event-driven [your category] software' },
  { id: 'C-19', category: 'Category', text: '[your category] platform with [your differentiator] capabilities' },
  { id: 'C-20', category: 'Category', text: '[your category] software for [your niche audience]' },
  // Use Case
  { id: 'U-01', category: 'Use Case', text: 'How do I reduce false positives in [your workflow]?' },
  { id: 'U-02', category: 'Use Case', text: 'How can I automate [your workflow] review?' },
  { id: 'U-03', category: 'Use Case', text: 'How do I speed up [your workflow] for [your audience]?' },
  { id: 'U-04', category: 'Use Case', text: 'How can a [your buyer] achieve [desired outcome] without [their constraint]?' },
  { id: 'U-05', category: 'Use Case', text: 'How do I [your primary use case]?' },
  { id: 'U-06', category: 'Use Case', text: 'How can I detect [your problem type] using [your data]?' },
  { id: 'U-07', category: 'Use Case', text: 'How do I implement [your methodology] instead of [legacy approach]?' },
  { id: 'U-08', category: 'Use Case', text: 'How can my team handle more [your workload] without adding headcount?' },
  { id: 'U-09', category: 'Use Case', text: 'How do I reduce the time to [your workflow outcome]?' },
  { id: 'U-10', category: 'Use Case', text: 'How can a [your buyer] prove [your value proposition] to [their stakeholder]?' },
  { id: 'U-11', category: 'Use Case', text: 'How do I detect [your problem type] during [your workflow]?' },
  { id: 'U-12', category: 'Use Case', text: 'How can I integrate [your category] with [adjacent category]?' },
  { id: 'U-13', category: 'Use Case', text: 'How do I implement AI in [your category] without losing [their concern]?' },
  { id: 'U-14', category: 'Use Case', text: 'How do I manage [your risk type] for AI-driven [your category] decisions?' },
  { id: 'U-15', category: 'Use Case', text: 'What is the best way to prepare for a [your regulatory context] inspection?' },
  { id: 'U-16', category: 'Use Case', text: 'How can I reduce my [your category] operations cost?' },
  { id: 'U-17', category: 'Use Case', text: 'How do I detect [your fraud/risk type] in a [your platform type]?' },
  { id: 'U-18', category: 'Use Case', text: 'How do I onboard [your complex entity type] for [your workflow]?' },
  { id: 'U-19', category: 'Use Case', text: 'How can I automate [your screening type] without excessive false positives?' },
  { id: 'U-20', category: 'Use Case', text: 'How do I set up a [your governance framework] for [your technology context]?' },
  // Competitor
  { id: 'X-01', category: 'Competitor', text: '[Your Brand] vs [Competitor 1] — which is better for [your use case]?' },
  { id: 'X-02', category: 'Competitor', text: '[Your Brand] vs [Competitor 2] — comparison for [your use case]' },
  { id: 'X-03', category: 'Competitor', text: '[Competitor 1] alternatives for [your audience] [your category]' },
  { id: 'X-04', category: 'Competitor', text: 'What is the difference between [Your Brand] and [Competitor 3]?' },
  { id: 'X-05', category: 'Competitor', text: 'Alternatives to legacy [your category] platforms for AI-native [your audience]' },
  { id: 'X-06', category: 'Competitor', text: 'Best [your category] platform alternatives to [Competitor 4]' },
  { id: 'X-07', category: 'Competitor', text: '[Competitor 5] vs [Your Brand] for [your use case]' },
  { id: 'X-08', category: 'Competitor', text: 'What are the top alternatives to manual [your category] processes?' },
  { id: 'X-09', category: 'Competitor', text: '[your category] platforms better than spreadsheet-based approaches' },
  { id: 'X-10', category: 'Competitor', text: 'AI-native alternatives to traditional [your category] vendors' },
  // Technical/Definitional
  { id: 'T-01', category: 'Technical', text: 'What is generative engine optimisation (GEO) in the context of B2B marketing?' },
  { id: 'T-02', category: 'Technical', text: 'What is [your proprietary concept] in [your domain]?' },
  { id: 'T-03', category: 'Technical', text: 'What is [your methodology] and how does it differ from [legacy approach]?' },
  { id: 'T-04', category: 'Technical', text: 'What is the difference between [your category] and [adjacent category]?' },
  { id: 'T-05', category: 'Technical', text: 'What does AI-native mean for [your category] software?' },
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForResponseComplete(page, timeoutMs = 120000) {
  // Wait for the streaming to stop — poll every 2s up to timeoutMs
  const start = Date.now();
  let lastText = '';
  let stableCount = 0;
  while (Date.now() - start < timeoutMs) {
    await sleep(2000);
    // Check if stop button is gone (streaming done) or text has stabilised
    const stopBtn = await page.$('button[aria-label="Stop streaming"]');
    if (!stopBtn) {
      // Extra 2s to ensure final render
      await sleep(2000);
      return;
    }
    // Also check text stability as fallback
    const currentText = await page.evaluate(() => {
      const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
      if (msgs.length === 0) return '';
      return msgs[msgs.length - 1].innerText || '';
    });
    if (currentText === lastText && currentText.length > 50) {
      stableCount++;
      if (stableCount >= 2) return;
    } else {
      stableCount = 0;
      lastText = currentText;
    }
  }
}

async function getLastAssistantResponse(page) {
  return await page.evaluate(() => {
    const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
    if (msgs.length === 0) return '';
    return msgs[msgs.length - 1].innerText || '';
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 }
  });
  const results = [];

  try {
    const page = await context.newPage();

    // Navigate to ChatGPT
    console.log('Navigating to chat.openai.com...');
    await page.goto('https://chat.openai.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    // Take a screenshot to see login state
    await page.screenshot({ path: './chatgpt_initial.png' });
    console.log('Initial screenshot saved.');

    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log('Page title:', pageTitle);
    console.log('Page URL:', pageUrl);

    // Check if we're on login page
    const pageContent = await page.content();
    const isLoginPage = pageContent.includes('Log in') || pageContent.includes('Sign in') || pageUrl.includes('auth');
    console.log('Login required:', isLoginPage);

    if (isLoginPage) {
      console.log('LOGIN REQUIRED — applying Blocked Engine Protocol to all prompts');
      await browser.close();
      // Write blocked results
      for (const prompt of PROMPTS) {
        results.push({
          id: prompt.id,
          category: prompt.category,
          text: prompt.text,
          blocked: true,
          response: 'BLOCKED — login required',
          responseExcerpt: 'BLOCKED — login required'
        });
      }
      fs.writeFileSync('./chatgpt_results.json', JSON.stringify(results, null, 2));
      console.log('Results written (all blocked).');
      return;
    }

    // We're logged in — proceed with prompts
    console.log('Logged in — proceeding with prompts...');

    for (let i = 0; i < PROMPTS.length; i++) {
      const prompt = PROMPTS[i];
      console.log(`[${i + 1}/${PROMPTS.length}] ${prompt.id}: ${prompt.text.substring(0, 60)}...`);

      try {
        // Click "New chat" to start fresh
        // Try various selectors for new chat button
        const newChatSelectors = [
          'button[aria-label="New chat"]',
          'a[href="/"]',
          '[data-testid="new-chat-button"]',
          'button:has-text("New chat")',
          'nav a[href="/"]'
        ];

        let newChatClicked = false;
        for (const sel of newChatSelectors) {
          try {
            const btn = await page.$(sel);
            if (btn) {
              await btn.click();
              newChatClicked = true;
              await sleep(1500);
              break;
            }
          } catch (e) { /* continue */ }
        }

        if (!newChatClicked) {
          // Navigate to home URL to start fresh
          await page.goto('https://chat.openai.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
          await sleep(2000);
        }

        // Find and click the message input
        const inputSelectors = [
          '#prompt-textarea',
          'textarea[placeholder="Message ChatGPT"]',
          'div[contenteditable="true"][role="textbox"]',
          'textarea',
          '[data-testid="send-button"] ~ textarea',
        ];

        let inputFocused = false;
        for (const sel of inputSelectors) {
          try {
            const input = await page.$(sel);
            if (input) {
              await input.click();
              await sleep(300);
              inputFocused = true;
              // Type the prompt
              await page.keyboard.type(prompt.text, { delay: 10 });
              break;
            }
          } catch (e) { /* continue */ }
        }

        if (!inputFocused) {
          console.log(`  WARN: Could not find input for ${prompt.id}`);
          results.push({
            id: prompt.id,
            category: prompt.category,
            text: prompt.text,
            blocked: true,
            response: 'BLOCKED — input not found',
            responseExcerpt: 'BLOCKED — input not found'
          });
          continue;
        }

        // Submit
        await page.keyboard.press('Enter');
        await sleep(1000);

        // Wait for response
        await waitForResponseComplete(page, 90000);

        // Capture response
        const response = await getLastAssistantResponse(page);
        const responseExcerpt = response.substring(0, 500);

        console.log(`  Response captured (${response.length} chars)`);

        results.push({
          id: prompt.id,
          category: prompt.category,
          text: prompt.text,
          blocked: false,
          response: response,
          responseExcerpt: responseExcerpt
        });

        // Small pause between prompts
        await sleep(1000);

      } catch (err) {
        console.error(`  ERROR on ${prompt.id}:`, err.message);
        results.push({
          id: prompt.id,
          category: prompt.category,
          text: prompt.text,
          blocked: true,
          response: `ERROR — ${err.message}`,
          responseExcerpt: `ERROR — ${err.message}`
        });
      }
    }

  } catch (err) {
    console.error('Fatal error:', err.message);
  } finally {
    await browser.close();
  }

  fs.writeFileSync('./chatgpt_results.json', JSON.stringify(results, null, 2));
  console.log(`Done. ${results.length} results written to chatgpt_results.json`);
}

run().catch(console.error);
