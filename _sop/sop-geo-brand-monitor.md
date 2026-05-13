# SOP: GEO Brand Monitor — Weekly AI Engine Tracking

## Purpose
Run the prompt universe against all AI engines weekly, evaluate responses, and record results in Notion.

## Pre-Run Checklist

- [ ] Load `_context/geo-prompt-universe.md` — confirm prompt count and categories
- [ ] Apply `.claude/rules/brand-context-loading.md` — load Brand Context and Product Offerings for mention/sentiment evaluation
- [ ] Read `GEO_BRAND_TRACKING_DB_ID` from `.claude/CLAUDE.md` — confirm it is populated
- [ ] Check the most recent `run_date` in GEO Brand Tracking Notion DB — confirm no duplicate run for today
- [ ] **Resume check**: Query GEO Brand Tracking DB with `filter: run_date = today`. If rows exist, this is a resume — calculate remaining (prompt_id, engine) pairs before spawning sub-agents
- [ ] Confirm run scope with user (default: all 70 prompts × 7 engines — Grok excluded per `.claude/CLAUDE.md`)

## Engine Execution

All engines are executed via the CDP runner at repo root: `run-engine.js`. The runner connects to the user's dedicated Chrome (CDP `localhost:55068` by default) — never launches a fresh browser. Per-engine selectors, wait conditions, and login detection live inside the runner.

| Order | Engine | `ENGINE` key | Notion `Engine` value |
|-------|--------|--------------|----------------------|
| 1 | Perplexity | `perplexity` | Perplexity |
| 2 | ChatGPT | `chatgpt` | ChatGPT |
| 3 | Google AI Overviews | `google-aio` | Google AI Overviews |
| 4 | Gemini | `gemini` | Gemini |
| 5 | Bing Copilot | `bing` | Bing Copilot |
| 6 | Claude | `claude` | Claude |
| 7 | Meta AI | `meta` | Meta AI |

**Grok is permanently excluded** — free-tier X/Grok caps at ~20 prompts/day, making the 70-prompt sweep impossible. Do not add Grok back without an explicit user decision and a paid X Premium account.

**Pre-flight**: before starting a run, verify CDP Chrome is alive: `curl -s --max-time 2 http://localhost:55068/json/version`. If the curl fails, halt and ask the user to start their Chrome with `--remote-debugging-port=55068`.

**Per-batch invocation**: `ENGINE=<key> PROMPTS='[{"id":"P-01","text":"..."}, ...]' node run-engine.js` — stdout is a JSON array of results.

## Batch Approach

Full runs use 10-prompt batches per engine (7 batches × 7 engines = 49 sub-agents max). Each sub-agent:
- Receives: its 10 prompts, engine name, run_date, DB ID, already-completed pairs set
- Skips any (prompt_id, engine) pairs in the completed set without querying Notion again
- Writes remaining rows and returns count + any flags

Batch composition (same every run — do not reorder):

| Batch | Prompt IDs |
|-------|-----------|
| 1 | P-01 to P-10 |
| 2 | P-11 to P-15, C-01 to C-05 |
| 3 | C-06 to C-15 |
| 4 | C-16 to C-20, U-01 to U-05 |
| 5 | U-06 to U-15 |
| 6 | U-16 to U-20, X-01 to X-05 |
| 7 | X-06 to X-10, T-01 to T-05 |

## Prompt Entry Rules

- Type the prompt **exactly** as written in `geo-prompt-universe.md`
- No paraphrasing, no adding context, no "please" or "thank you"
- Enter the prompt ID in the `prompt_id` Notion field (e.g., "C-01"), not the text

## Blocked Engine Protocol

If an engine requires login you cannot complete, returns a CAPTCHA, errors out, or returns an empty/non-evaluable response:
1. **Do NOT write a Notion row** for the blocked prompt(s)
2. Add the (engine, prompt_id) pair to the run summary's "Blocked — needs user run" section
3. Continue to the next engine/prompt — do not retry or wait
4. After the run, the user will manually run the blocked prompts, paste the responses back, and only then will those rows be scored and written to Notion

## Evaluation Rules (Quick Reference)

Full rubric is in the `geo-brand-monitor` skill. Quick rules:

**Share of Voice**: Count each vendor name once per paragraph it appears in, not total character matches. If brand is the only vendor → 100%. If no vendors named → 0%.

**Sentiment classification shortcuts**:
- Contains "leading", "trusted", "recommended", "well-suited" → Positive
- Neutral list without qualifiers → Neutral
- Contains "lacks", "limited", "criticized", "expensive" → Negative

**Google AI Overviews distinction**:
- No AI Overview block appeared → record as "Not shown" (not "Not Mentioned")
- AI Overview appeared but brand absent → "Not Mentioned"

## Notion Write Protocol

- One row per prompt × engine × run_date — **never overwrite** existing rows
- On resume: skip rows already in Notion for today's run_date — never re-query them, use the completed-pairs set passed from the orchestrator
- If Notion MCP rate-limits: batch by engine (write all 70 rows for engine 1, then engine 2, etc.)
- If rate limit persists after batching: add 2-second pause between batches
- Verify row count after each engine batch — should be 70 rows per engine (or fewer if spot-checking)

## Post-Run

1. Print the completion summary (format in `geo-brand-monitor` skill)
2. Flag any anomalies (accuracy, sentiment, competitor wins)
3. Remind: "Run geo-intelligence-synthesizer tomorrow (Tuesday) to calculate aggregate metrics and generate the weekly content calendar."
