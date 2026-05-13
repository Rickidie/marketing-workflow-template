# SOP: GEO Intelligence Synthesizer — Weekly Analysis and Content Planning

## Purpose
Synthesise all GEO marketing data, calculate aggregate metrics, score keyword bets, generate next week's Content Calendar, and produce the weekly intelligence report.

## Pre-Run Checklist

- [ ] Confirm brand-geo-monitor completed Monday's run (check most recent `run_date` in GEO Brand Tracking DB)
- [ ] Apply `.claude/rules/brand-context-loading.md` — load Brand Context, Growth Marketing Context, and `_context/geo-prompt-universe.md`
- [ ] Apply `.claude/rules/scoring-model.md` — canonical scoring + history-append rule
- [ ] Apply `.claude/rules/output-format.md` — weekly report saved as `.docx`
- [ ] Read all 8 Notion DB IDs from `.claude/CLAUDE.md`
- [ ] Confirm today is Tuesday (or later) — do not run before Monday's monitor data exists

## Data Pull Scope

| Database | Time range | Filter |
|----------|-----------|--------|
| GEO Brand Tracking | Past 7 days | All rows from latest run_date |
| Website Audit Log | Past 30 days | status = Open |
| Keyword Research | Past 14 days | Updated recently |
| Competitor Intelligence | Past 14 days | All recent entries |
| Content Performance | All time | status = Published |
| Content Calendar | Current week | All entries and their status |
| Keyword Score History | Last 4 weeks | All snapshots — used for slope and trending analysis |

## Metric Calculation Formulas

### AI Visibility Score
```
(Rows where brand_mentioned = true) / (Total rows for this run_date) × 100
```

### Brand Mention Rate
```
Same as AI Visibility Score
```

### Brand Citation Rate
```
(Rows where brand_cited = true) / (Total rows for this run_date) × 100
```

### Overall Share of Voice
```
Average of all share_of_voice values for this run_date
```

### Prompt Category Win Rate
```
For each category (Brand/Product, Category, Use Case, Competitor, Technical):
(Rows where prompt_win = "Win") / (Total rows in category for this run_date) × 100
```

### Week-over-Week Change
```
For each metric:
Change = This week's value - Previous week's value
```
If no previous week data exists: note "Baseline — first week".

## Keyword Bet Scoring Rules

Follow `.claude/rules/scoring-model.md` — it is the canonical specification for the formula, multipliers, write-back fields, history append, and trend classification. The synthesizer workflow only adds two operational items on top:

1. **Pre-step: reconcile keyword ↔ content linkage.** For every Content Performance row with `status` = Published, read its `target_keywords`. For each keyword, find the Keyword Research DB row and ensure the Content Performance row appears in that keyword's `content_pieces_shipped` relation. If the keyword's `first_content_ship_date` is null, set it to the `publish_date` of the earliest linked piece.
2. **Eligibility filter:** score only keywords where `content_pieces_shipped ≥ 1` AND `first_content_ship_date` is at least 14 days ago. Skip the score AND the history append for keywords below the threshold.

History snapshot fields (per the rule, written to KEYWORD_SCORE_HISTORY_DB_ID): `Snapshot` = `{keyword-slug}-{YYYY-MM-DD}`, `Keyword` (relation), `Week Start Date` = monitoring run date, `Win Rate`, `Prompt Impact Score`, `Delta vs Baseline`, `Pieces Shipped At Snapshot`, `Engines Won` (count of engines with ≥ 1 win in this week's run on `associated_prompts`).

## Enrich Stub Briefs from the Dashboard

The dashboard `/keywords` page lets the team queue briefs against keywords on demand. To keep the click cheap (no LLM in the request path), the dashboard writes a minimal stub row to Content Briefs marked with `[STUB:NEEDS-ENRICHMENT]` in Brief Text. Each Tuesday, before generating the Content Calendar, enrich these stubs in place.

**Detection**: `Status` = `Open` AND `Created By` = `Manual` AND `Brief Text` contains literal `[STUB:NEEDS-ENRICHMENT]`.

**For each stub**:
1. Look up the matching Keyword Research row by `Target Keywords` value (case-insensitive trim).
2. Read its `associated_prompts`, `relevance_score`, `geo_likelihood`, `category`.
3. Resolve prompt IDs to full text via `_context/geo-prompt-universe.md`.
4. Rewrite Brief Text using the same blog-brief template as Content Calendar Generation below (audience · problem · angle · key points · GEO/AEO/competitor angles · required elements).
5. Populate Target Prompts (comma-separated IDs), Content Type (`Blog Post` default), Priority (High if relevance ≥8, Medium if ≥5, else Low).
6. Update the existing Notion page — do NOT create a duplicate. Removing the `[STUB:NEEDS-ENRICHMENT]` marker is the signal that enrichment succeeded.

**Skip rules** (leave the stub untouched, log reason in the report):
- Keyword not found in Keyword Research → `unknown keyword — create a Keyword Research row first`
- Keyword has empty `associated_prompts` → `no associated prompts — Research Analyst must map this keyword`
- Keyword status = `Re-angle` → `keyword flagged Re-angle — needs Research Analyst review`

Add a `## Stub briefs enriched` section to the weekly report listing enriched + skipped briefs and counts. Run this step BEFORE Content Calendar Generation so the just-enriched briefs are considered as existing pipeline (and the calendar generator's no-duplicate-brief check honours them).

## Content Calendar Generation

Generate 7 entries for next week:

### 3 Blog Briefs (Mon/Wed/Fri)
Priority order for selecting topics (fill blog slots top-down):
1. **Untested high-relevance keyword**: `geo_relevance_score` ≥ 7 AND `content_pieces_shipped` = 0
2. **Underperforming keyword bet**: `prompt_impact_score` ≤ 2 AND `first_content_ship_date` ≥ 30 days ago → new angle/format; mark keyword `status` = "Re-angle"
3. **Winning keyword bet**: `prompt_impact_score` ≥ 7 → doubling-down brief (adjacent angle on same keyword)
4. **Competitor gaining share of voice** → differentiation piece
5. **Content gaps from Website Audit Log** (status = Open, type = Content Gap)
6. **Prompt category win rate < 50% with no keyword mapped to it** → DO NOT create a blog brief; flag to Research Analyst to create a keyword first (see Research Direction Flags below)
7. **Highest `geo_relevance_score` keywords** in Keyword Research DB (status = New) — fallback fill

Each blog brief includes:
- Title, target audience, problem, angle/hook, key points, GEO angle (prompts to win), AEO angle (FAQ questions), competitor angle, required elements
- Target keywords and target prompts
- Priority based on GEO gap severity

### 4 Social Briefs (remaining days)
Source from:
- Recent GEO wins worth highlighting (brand appeared in new engine or won a new category)
- Research findings from Research Analyst
- Keyword Research entries worth testing as social content
- Brand moments or industry news

### Calendar Structure
Each entry: `week_start_date`, `day`, `content_type`, `title`, `brief_id`, `status` = Scheduled, `source` = Original

The 3 blog-repurposed social sets (3 LinkedIn + 3 X) are NOT pre-created here — `content-creator` generates them automatically after each blog.

## Report Structure

Save to `reports/[YYYY-MM-DD]-geo-weekly-report.docx` (per `.claude/rules/output-format.md`). Follow the template in the `geo-intelligence-synthesizer` agent definition exactly.

Key sections:
1. Executive summary (3 sentences)
2. GEO metrics table (this week vs last week)
3. AI engine performance breakdown
4. Prompt category win/loss table
5. Competitor movements
6. Keyword Bet Performance (top winners, underperformers, untested high-relevance keywords)
6a. Keyword Trends (4-week slope — Trending Up / Trending Down / New bets)
7. Open website audit issues (count + top 3)
8. Content Calendar for next week
9. Research directions for Research Analyst (2–3)
10. Flags
11. Data limitations

## Research Direction Flags

At the end of the report, list 2–3 research priorities:
- Which prompt categories have the largest share-of-voice gap?
- Which competitors are showing unexpected growth?
- What best practice areas is the site weakest in?
- Where do keyword gaps exist?

Format:
```
## Research Directions for Research Analyst
1. [Direction] — [Why this matters based on this week's data]
2. [Direction] — [Why]
3. [Direction] — [Why]
```

## Post-Run

1. Print the completion summary
2. Confirm: Content Calendar entries created in Notion
3. Confirm: Keyword Research rows scored (`prompt_impact_score`, `current_win_rate`, `last_scored` written)
4. Confirm: Keyword Score History rows appended (one per scored keyword for this week's monitoring run date)
5. Confirm: Report saved to `reports/`
5. Note: "Content Creator can begin executing next week's calendar entries."
