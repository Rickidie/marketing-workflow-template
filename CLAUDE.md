# ${BRAND_NAME} Marketing Workflow — Claude Instructions

This is the ${BRAND_NAME} marketing team workspace. All work here supports ${BRAND_NAME}'s marketing operations.

Global writing, formatting, and editing defaults live in `~/.claude/CLAUDE.md`. The rules below override or extend them for this workspace.

## Directory Structure

```
_context/        Brand foundation files — load per `.claude/rules/brand-context-loading.md`
_sop/            Standard operating procedures
_templates/      Reusable templates
.claude/rules/   Topical rules referenced by agents and SOPs
content/         Finished content (blog, social, copy)
geo/             Geo-localised materials
reports/         Marketing reports and performance analyses
research/        Market research, competitor analysis, audience insights
```

## Rules Index

These rules are referenced by every agent and SOP. Edit the rule file once — every consumer picks up the change.

- [Brand context loading](rules/brand-context-loading.md) — which `_context/` files to load and when
- [Output format and placement](rules/output-format.md) — `.docx` everywhere; folder mapping; file naming
- [Brand facts](rules/brand-facts.example.md) — `${BRAND_URL}`, ${BRAND_LEGAL_NAME}, standard CTA copy
- [Scoring model](rules/scoring-model.md) — `prompt_impact_score` formula and history-append rule

## Skills and Agents

- Keep skills **brand-agnostic**. Skills define workflow and process only. Never hardcode brand-specific details. Skills pull brand context at runtime.
- Keep agents **brand-agnostic**. No hardcoded brand details in agent files. Each agent has a clear, non-overlapping role. Agents pull brand context at runtime.

## SOPs

Check `_sop/` for an existing standard operating procedure before starting a workflow task. If one exists, follow it.

---

## GEO/SEO Agent Team

### Pipeline

```
research → strategy → content → review → tracking → research (loop)
```

### Agents

| Agent | Stage | Schedule |
|-------|-------|----------|
| `research-analyst` | Research | Bi-weekly Monday + on-demand |
| `website-geo-auditor` | Research (site audit) | Monthly first week + on-demand |
| `content-creator` | Content | Manual / daily cadence |
| `content-reviewer` | Review (quality gate) | Automatic after content-creator; on-demand for user content |
| `brand-geo-monitor` | Tracking | Weekly Monday |
| `geo-intelligence-synthesizer` | Strategy + Evaluation | Weekly Tuesday |

### How to Invoke

- Run weekly brand GEO tracking: `use brand-geo-monitor`
- Run website audit: `use website-geo-auditor`
- Run keyword and competitor research: `use research-analyst`
- Write a piece of content: `use content-creator`
- Review a piece of content: `use content-reviewer`
- Run weekly synthesis + content calendar + report: `use geo-intelligence-synthesizer`

### Sub-Agent Delegation Rules

**Do NOT spin up a sub-agent when:**
- The task is a single, named skill invocation (e.g., `social-content-writing`, `ecc:article-writing`, `ecc:deep-research`, `humanizer`)
- The task is a single Notion read or write
- The task is a single Exa search with a known query
- The task is a straightforward file save or read

**DO use a sub-agent when:**
- The task is open-ended and requires judgment across multiple steps (e.g., GEO homepage audit: crawl + evaluate + research + record)
- The task requires synthesising across multiple tools or data sources (e.g., Synthesizer reading 8 Notion DBs and generating briefs)
- The task is long-running enough to dominate the main agent's context window (e.g., full 70-prompt × 7-engine monitoring run — one sub-agent per engine)
- The task needs a fresh context window to reason clearly

### Content Cadence

- **Blogs**: 3/week (Mon/Wed/Fri) — each blog auto-triggers 2 repurposed social posts
- **LinkedIn**: 1/day (7/week)
- **Twitter/X**: 1/day (7/week)
- Synthesizer generates the full weekly Content Calendar each Tuesday

### Scoring Model

See `.claude/rules/scoring-model.md` for the canonical `prompt_impact_score` formula, history-append rule, and trend classification.

### Prompt Universe

Location: `_context/geo-prompt-universe.md`

70 prompts across 5 categories used by `brand-geo-monitor` every Monday. Do not modify prompt IDs — it breaks week-over-week comparisons. To add prompts, append with the next sequential ID and update the Notion `prompt_category` Select options to match.

### AI Engines Tracked

7 engines: Perplexity, ChatGPT, Google AI Overviews, Gemini, Bing Copilot, Claude, Meta AI. **Grok is permanently excluded** — free-tier 20-prompt/day cap makes a 70-prompt sweep unreliable. Do not re-add without an explicit user request and a paid X Premium account.

### Notion Database IDs

```
GEO_BRAND_TRACKING_DB_ID=${GEO_BRAND_TRACKING_DB_ID}
WEBSITE_AUDIT_LOG_DB_ID=${WEBSITE_AUDIT_LOG_DB_ID}
KEYWORD_RESEARCH_DB_ID=${KEYWORD_RESEARCH_DB_ID}
COMPETITOR_INTELLIGENCE_DB_ID=${COMPETITOR_INTELLIGENCE_DB_ID}
CONTENT_PERFORMANCE_DB_ID=${CONTENT_PERFORMANCE_DB_ID}
CONTENT_BRIEFS_DB_ID=${CONTENT_BRIEFS_DB_ID}
CONTENT_CALENDAR_DB_ID=${CONTENT_CALENDAR_DB_ID}
KEYWORD_SCORE_HISTORY_DB_ID=${KEYWORD_SCORE_HISTORY_DB_ID}
```

All agents read these IDs from this file when making Notion API calls. Do not rename the variable names.

### Weekly Schedule

| Day | Action |
|-----|--------|
| Monday (bi-weekly) | Run `research-analyst` first, then `brand-geo-monitor` |
| Monday (every week) | Run `brand-geo-monitor` (all 7 engines × 70 prompts) |
| Tuesday | Run `geo-intelligence-synthesizer` (reads Monday's data, generates Content Calendar) |
| Mon–Sun | Run `content-creator` on each Content Calendar entry; `content-reviewer` triggers automatically |
| First of month | Run `website-geo-auditor` |

### Data Limitations (resolve as priority)

- [ ] **Google Analytics 4 → BigQuery**: GTM events flow into BigQuery dataset `${GCP_PROJECT_ID}.${BQ_DATASET}`. Synthesizer queries it directly via the `bigquery` MCP server (in `.mcp.json`). Canonical SQL for AI referral traffic + page-traffic deltas lives in `.claude/agents/geo-intelligence-synthesizer.md` Step 1.
- [ ] **Google Search Console → BigQuery export**: Not yet enabled. GSC keyword ranking data only flows into BigQuery once the [GSC bulk export](https://support.google.com/webmasters/answer/12918484) is turned on for `${BRAND_URL}`. Until then, the synthesizer's "Top GSC Keywords" section says "GSC export not yet enabled". Action: enable the export from Search Console → Settings → Bulk data export, target dataset `${GCP_PROJECT_ID}.search_console`.
- [ ] **CMS write access to ${BRAND_URL}**: Confirm write access before implementing schema markup recommendations from Website Auditor.
