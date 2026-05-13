---
name: geo-brand-monitor
description: "Run GEO brand tracking across AI engines. Use this skill when querying AI engines with a defined prompt universe, evaluating brand presence in AI responses, scoring GEO metrics per response, and recording results in a Notion tracking database. Extends marketing-skills:ai-seo and ecc:seo with Playwright automation patterns, a 10-metric evaluation rubric, share-of-voice calculation, and Notion row structure for GEO Brand Tracking records. Brand-agnostic — loads brand context at runtime."
---

# GEO Brand Monitor Skill

A brand-agnostic workflow for systematically querying AI engines with a defined prompt universe, evaluating each response against GEO metrics, and recording structured results in Notion. Extends `marketing-skills:ai-seo` and `ecc:seo` — reference those skills for GEO keyword strategy and SEO fundamentals. This skill adds the operational execution layer: automation patterns, evaluation rubric, and data recording.

---

## Inputs Required

Before running, confirm these are available:
1. **Prompt universe file** — a markdown file with prompt IDs and prompt text organised by category (e.g., `_context/geo-prompt-universe.md`)
2. **Brand context files** — loaded at runtime to evaluate mentions and sentiment accurately
3. **Notion DB ID** — `GEO_BRAND_TRACKING_DB_ID` from CLAUDE.md
4. **Run scope** — full run (all prompts, all engines) or spot-check (specific categories or engines)

---

## AI Engines — Navigation Reference

Run prompts in this order. For each engine, navigate fresh (do not reuse sessions across prompts to avoid context contamination).

| Engine | URL | Login required | Notes |
|--------|-----|----------------|-------|
| Perplexity | perplexity.ai | No (anonymous allowed) | Use default search mode |
| ChatGPT | chat.openai.com | Yes | Requires account; if blocked, record BLOCKED |
| Google AI Overviews | google.com | No | Standard search; AI Overview appears above results for eligible queries |
| Gemini | gemini.google.com | Yes | Requires Google account |
| Bing Copilot | bing.com | No (limited) | Copilot tab; more features with Microsoft login |
| Claude | claude.ai | Yes | Run prompts as a separate Playwright session — do NOT self-answer |
| Meta AI | meta.ai | No (limited) | Some features require Meta login |

**Grok is permanently excluded** from this skill. Free-tier X/Grok caps at ~20 prompts/day, making a 70-prompt sweep impossible and partial data unreliable. Do not add Grok back without an explicit user decision and a paid X Premium account.

**Blocked engine protocol**: If an engine requires login you cannot complete, returns a CAPTCHA, errors out, or returns an empty/non-evaluable response — **do NOT write a Notion row**. Add the (engine, prompt_id) pair to the run summary's "Blocked — needs user run" section. The user will run those prompts manually, provide the response text, and only then will the row be scored and written. Continue to the next prompt/engine.

---

## Prompt Execution — CDP Runner (`run-engine.js`)

This skill does NOT use the Playwright MCP. It invokes the repo's `run-engine.js` script, which connects to the user's already-authenticated Chrome over CDP (default `localhost:55068`). The script reuses one Chrome tab across all prompts in a batch — no per-prompt newContext(), no fresh logins.

### Invocation pattern (one Bash call per batch)

```bash
ENGINE=<engine-key> PROMPTS='[{"id":"P-01","text":"..."}, ...]' node run-engine.js
```

Engine keys: `perplexity`, `chatgpt`, `google-aio`, `gemini`, `bing`, `claude`, `meta`.

### Runner output

Stdout is a JSON array: `[{ id, prompt, engine, url, text, status, error }]`. Each prompt produces exactly one entry.

`status` values:
- `ok` — response captured in `text` (first ~700 chars). Proceed to score and write the Notion row.
- `not-shown` — Google AI Overviews block did not render for this query (legitimate "no AI answer triggered" outcome — distinct from "AI answered but didn't mention brand")
- `blocked` — login wall, captcha, or unreachable engine. The runner detected it without attempting the prompt
- `error` — runtime/navigation error captured in `error` field

**Skip Notion writes for any status other than `ok`.** Those prompts go to the run summary's "Blocked — needs user run" section so the user can run them manually and feed the responses back.

### CDP pre-flight

Before invoking the runner, confirm Chrome is reachable:

```bash
curl -s --max-time 2 http://localhost:55068/json/version
```

If the curl fails, stop and tell the user to start their dedicated Chrome with `--remote-debugging-port=55068` (or pass the actual port via `CDP_PORT`). Do not attempt prompts without a working CDP connection.

### Google AI Overviews — `not-shown` vs `not-mentioned`

Google AI Overviews only appear for eligible queries and are geolocation-dependent. The runner returns `status: "not-shown"` when no AI Overview block rendered. This is **not** the same as "the AI answered but didn't mention the brand" (which would be `status: "ok"` + `brand_mentioned = No` after scoring).

Do not write a Notion row for `not-shown` — log it to the user-run list instead. Only write rows when an AI Overview actually rendered.

### Response capture

The runner captures the first 700 characters of the assistant response. Use that as the `raw_response_excerpt` field in the Notion row.

---

## 10-Metric Evaluation Rubric

Evaluate every prompt × engine response against these metrics. Apply in order — each metric is independent.

### Pre-Step: Brand Identity Verification (run BEFORE Metric 1)

Before scoring any metrics, verify that the entity the response is talking about is actually the tracked brand — not a different company that shares the name. Many brand names collide with unrelated companies (different industries, different domains, different products).

**Do this check using the brand context files**:
1. Load `_context/brand-context.example.md` to confirm: official domain, category (industry), product description, headquarters/region.
2. Compare against the response. If the response describes a **different industry, different product family, or links to a domain that does NOT match the official brand domain**, the response is NOT about the brand.
3. If a citation URL is present, check that the host matches the brand's official domain (or a known sub-domain). A look-alike domain is a different company unless brand context explicitly lists it as owned.

**Disambiguation outcomes**:

| Situation | How to score |
|-----------|-------------|
| Response describes the correct brand AND citation URL is the official domain | Score normally |
| Response describes the correct brand BUT citation URL is a wrong/look-alike domain | `brand_mentioned = Yes` (prose is correct), `brand_cited = No`, `citation_url = ""`, `citation_position = None`, `citation_quality = None`, `link_destination = None`. Score `prompt_win`, `accuracy`, `sentiment`, and `share_of_voice` **strictly from the prose**. If the prose lists the brand as the primary/sole recommendation, that's still a `Win`. Add `Notes: "URL MISMATCH: engine cited <wrong-domain>; prose correctly describes brand. Citation fields cleared; Prompt Win and Accuracy reflect prose only."` |
| Response describes a DIFFERENT company that happens to share the brand name | `brand_mentioned = No`, `brand_cited = No`, `citation_url = ""`, all citation metrics = None, `share_of_voice = 0`, `prompt_win = Not Mentioned`, `sentiment = Not Mentioned`, `accuracy = Inaccurate`, and add `Notes: "BRAND CONFUSION: response describes <other company> (<wrong-domain>), not the tracked brand. Logged as Not Mentioned."` |

**Why this matters**: A wrong-domain citation is a separate GEO problem from prose recommendation. Track both independently. A row can legitimately be `Win + Brand Cited=No` — the engine endorsed the brand but couldn't find the right source-of-truth URL.

### Metric 1: Brand Mention
**Question**: Is the brand name referenced anywhere in the response, AND does the response describe the tracked brand (not a different company sharing the name)?
**Score**: Yes / No
**Note**: Count any variation of the brand name (full name, shortened form, URL). Do not count mentions of brand-adjacent terms used generically. If the Pre-Step flagged brand confusion (different company), score this metric `No`.

### Metric 2: Brand Citation
**Question**: Is the brand cited with a hyperlink or direct attribution?
**Score**: Yes / No + URL (if Yes)
**Note**: A "citation" is a link or explicit "according to [brand]" attribution. A bare name mention without a link is a Mention, not a Citation.

### Metric 3: Share of Voice
**Question**: Of all named vendors in the same product category in this response, what percentage is the brand?
**Formula**: (Brand name appearances) / (All named vendor appearances in response) × 100
**Score**: 0–100 (percentage)
**Example**: Response names 4 vendors, brand appears once → 25%
**Edge case**: If no vendors are named, record 0. If brand is the only vendor named, record 100.

### Metric 4: Prompt Win
**Question**: Does the brand lead or co-lead the response for this prompt?
**Score**: Win / Loss / Not Mentioned
- **Win**: Brand is the primary recommendation, first-named, or sole recommendation
- **Loss**: Brand is present but secondary to a competitor
- **Not Mentioned**: Brand does not appear

### Metric 5: Citation Position
**Question**: Where in the response does the brand first appear?
**Score**: First / Secondary / Passing
- **First**: In the opening paragraph or first recommendation
- **Secondary**: In the body, after other vendors
- **Passing**: Brief reference at end, in a list, or in a caveat

### Metric 6: Citation Quality
**Question**: How is the brand referenced?
**Score**: Direct Quote / Paraphrase / Name Only
- **Direct Quote**: Engine lifts specific text or stats attributed to the brand
- **Paraphrase**: Engine describes the brand's capabilities in its own words with specificity
- **Name Only**: Brand mentioned without describing what it does

### Metric 7: Link Destination
**Question**: If cited with a link, where does it point?
**Score**: Homepage / Product Page / Blog / None
- Inspect the href of any link containing the brand domain

### Metric 8: Sentiment
**Question**: How does the AI engine frame the brand when it mentions it?
**Score**: Positive / Neutral / Negative / Not Mentioned

Sentiment classification rules:
- **Positive**: Framing language includes "leading", "trusted", "strong", "recommended", "well-suited", "best-in-class", "comprehensive", or the brand is listed first with affirmative context
- **Neutral**: Brand named without qualitative framing, or in a neutral list with other vendors
- **Negative**: Framing includes "lacks", "limited", "complex", "steep learning curve", "criticized", "expensive", "compliance risk", or similar negatives
- **Not Mentioned**: Brand does not appear

### Metric 9: Accuracy
**Question**: Is the brand described accurately per its product context?
**Score**: Accurate / Inaccurate / Partial

Load `_context/product-offerings.example.md` and `_context/brand-context.example.md` before evaluating.
- **Accurate**: Product capabilities, market, and positioning described consistently with source material
- **Inaccurate**: Wrong market segment, incorrect capabilities stated, or brand confused with a competitor
- **Partial**: Some correct, some missing or misrepresented

### Metric 10: Competitors Present
**Question**: Which named competitors appear in the response?
**Score**: List of competitor names (comma-separated)
**Note**: Record all named vendors, not just the primary competitors. This field feeds competitor analysis in the Synthesizer.

---

## Share-of-Voice Calculation Reference

```
SoV per response = (count of brand name mentions) / (count of ALL named vendor mentions) × 100

Weekly aggregate SoV = average of all individual response SoV scores for the run date
```

When calculating, count each vendor name once per sentence/paragraph it appears in, not the total character occurrences.

---

## Notion Row Structure (GEO Brand Tracking)

One row per prompt × engine × run_date combination. Use `mcp__claude_ai_Notion__notion-create-pages` with `data_source_id` from the GEO_BRAND_TRACKING_DB_ID.

Required fields for each row:

| Field | Type | Value |
|-------|------|-------|
| `prompt_id` | Title | e.g., "C-01" |
| `prompt_text` | Text | Exact prompt text |
| `prompt_category` | Select | Brand/Product, Category, Use Case, Competitor, Technical |
| `engine` | Select | Perplexity, ChatGPT, Google AI Overviews, Gemini, Bing Copilot, Claude, Meta AI |
| `run_date` | Date | Today's date |
| `brand_mentioned` | Checkbox | true/false |
| `brand_cited` | Checkbox | true/false |
| `citation_url` | URL | URL or empty |
| `share_of_voice` | Number | 0–100 |
| `prompt_win` | Select | Win, Loss, Not Mentioned |
| `citation_position` | Select | First, Secondary, Passing |
| `citation_quality` | Select | Direct Quote, Paraphrase, Name Only |
| `link_destination` | Select | Homepage, Product Page, Blog, None |
| `sentiment` | Select | Positive, Neutral, Negative, Not Mentioned |
| `accuracy` | Select | Accurate, Inaccurate, Partial |
| `competitors_present` | Multi-select | List of competitor names |
| `raw_response_excerpt` | Text | First 500 chars of response |
| `notes` | Text | Any anomaly worth flagging |

**Batching note**: If Notion MCP rate-limits on high-volume writes (70 prompts × 7 engines = 490 rows), batch by engine — write all rows for one engine before moving to the next. If rate limit persists, add a 2-second pause between batches.

---

## Checkpoint / Resume

Because a full run (490 rows) is long and prone to interruption, the monitor supports mid-run resumption without re-running already-completed rows.

### How it works

**Orchestrator (brand-geo-monitor agent) at run start:**
1. Query GEO Brand Tracking DB: `filter: { property: "Run Date", date: { equals: today } }`
2. Build completed set: `Set<"<prompt_id>:<engine>">` — e.g., `"C-01:Perplexity"`
3. Compute remaining: all 490 (prompt_id, engine) combinations NOT in completed set
4. Pass completed set to each sub-agent in the dispatch payload

**Sub-agent (per batch of 10 prompts × 1 engine):**
1. Receive completed set from orchestrator
2. For each prompt in the batch: if `"<prompt_id>:<engine>"` is in completed set → skip (do not run, do not write)
3. Run remaining prompts, write rows, return count

### Blocked engine fast-fail

For auth-required engines (ChatGPT, Gemini, Claude):
- Attempt login ONCE before running any prompts
- If login fails: skip the engine entirely. Do NOT write BLOCKED rows. Add the (engine, all 70 prompt IDs) to the "Blocked — needs user run" section of the run summary.

### CAPTCHA / error mid-run

If CAPTCHA appears, an error occurs, or the response is empty/non-evaluable mid-run on a prompt:
- Do NOT write a Notion row for that prompt
- Add the (engine, prompt_id) to the "Blocked — needs user run" section of the run summary
- Continue to the next prompt in the batch
- Do not retry the same prompt in the same run

---

## Anomaly Flags (for run summary, not individual rows)

Raise these flags in the completion summary if encountered:

| Condition | Flag text |
|-----------|-----------|
| Any row with accuracy = Inaccurate | "ACCURACY FLAG: Brand misdescribed on [engine] for prompt [ID]" |
| Same prompt scores Negative sentiment on 2+ engines | "SENTIMENT FLAG: Negative on [engine list] for prompt [ID]" |
| Competitor wins a category where brand previously won | "COMPETITOR FLAG: [Competitor] now winning [prompt category] — was brand win in prior run" |
| GA4 not connected | "DATA FLAG: AI Referral Traffic unavailable — GA4 not yet configured" |
| Engine blocked | "ENGINE FLAG: [Engine] blocked — login required or CAPTCHA" |

---

## Completion Summary Format

```
GEO Brand Tracking Run Complete
Date: [YYYY-MM-DD]
Engines covered: [list]
Prompts run: [n] / 70
Rows written to Notion: [n]

Summary metrics (calculated from this run's rows):
- Responses with brand mention: [n] / [total]
- Responses with brand citation: [n] / [total]
- Average share of voice: [%]
- Prompt wins: [n] / [total]

Flags:
[List any flags, or "None"]

Next step: Run geo-intelligence-synthesizer to calculate aggregate metrics and generate content calendar.
```

---

## Related Skills and References

- `marketing-skills:ai-seo` — GEO keyword strategy and AI search behaviour methodology
- `ecc:seo` — SEO fundamentals and search visibility framework
- `ecc:exa-search` — supplementary web research if needed during a run
