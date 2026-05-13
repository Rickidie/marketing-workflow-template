# Rule: Keyword Bet Scoring Model

## What we score

The canonical bet-evaluation metric is `prompt_impact_score` on **Keyword Research DB** rows — not `geo_impact_score` on Content Performance rows.

- Each keyword has `associated_prompts` (mapping to prompt IDs in `_context/geo-prompt-universe.md`).
- The Synthesizer rolls up GEO Brand Tracking win rates across those prompts to score the keyword bet.
- Content pieces are inventory + status only. Their `geo_impact_score` field is **deprecated** — existing data preserved, no new writes.

## Scoring procedure

For each keyword in Keyword Research DB where `content_pieces_shipped ≥ 1` AND `first_content_ship_date` is at least 14 days ago:

1. **Snapshot baseline if null.** Mean win rate across `associated_prompts` over the 4 weeks **before** `first_content_ship_date`. Write to `baseline_win_rate`. Snapshot once, never recompute.
2. **Recompute current win rate.** Mean win rate across `associated_prompts` over the last 4 monitoring runs. Write to `current_win_rate`.
3. **Compute delta:** `delta_pp = current_win_rate − baseline_win_rate` (percentage points).
4. **Map delta to base score (0–10):**

| Delta (pp) | Base score |
|---|---|
| ≥ +40 | 10 |
| ≥ +25 | 8 |
| ≥ +15 | 6 |
| ≥ +5  | 4 |
| −5 to +5 | 2 (flat) |
| ≤ −5 | 0 |

5. **Apply multipliers (cap at 10):**
   - × 1.2 if current-period wins span ≥ 4 of 7 engines (breadth check across `associated_prompts` responses).
   - × 1.1 if at least one citation (not just mention) appeared in the current period.
6. **Write back** `prompt_impact_score`, `current_win_rate`, `last_scored = today` to the Keyword Research row.

## Time-series tracking

Keyword Research holds the **latest snapshot**. The **Keyword Score History DB** holds the **time series** — one row per (keyword × week) appended by the Synthesizer every Tuesday.

- Use Keyword Score History for trend analysis, 4-week slope, and the report's "Trending Up / Trending Down" section.
- **Never overwrite** history rows; only append. Skip the append if a row already exists for (keyword, week) — idempotent re-run.

## Trend classification

For each keyword with ≥ 3 history snapshots, compute the slope of `Prompt Impact Score` per week over the last 4 snapshots:

- `slope ≥ +0.5 / week` → **Trending Up**
- `slope ≤ −0.5 / week` → **Trending Down**
- otherwise → **Flat**

Keywords with fewer than 3 snapshots → labelled **"New bet — insufficient history"**. Trend slope is derived only — never written back to Notion.
