# SOP: Research Analyst — Keyword and Competitor Research

## Purpose
Discover keywords, analyse competitor GEO presence, and surface best practices. Feed the Synthesizer and Content Creator with actionable intelligence.

## Pre-Run Checklist

- [ ] Read the latest weekly report in `reports/` — check for Synthesizer-flagged research directions. Prioritise these.
- [ ] Apply `.claude/rules/brand-context-loading.md` — load Brand Context, Product Offerings, Growth Marketing Context
- [ ] Read Notion DB IDs from `.claude/CLAUDE.md`: `KEYWORD_RESEARCH_DB_ID`, `COMPETITOR_INTELLIGENCE_DB_ID`
- [ ] Check existing Keyword Research and Competitor Intelligence DB entries — avoid duplicating recent work
- [ ] Confirm run type: scheduled bi-weekly / on-demand / Synthesizer-directed

## Research Types

### Scheduled Bi-Weekly Run
Run all three research areas in order:
1. Keyword Discovery (Area 1)
2. Competitor GEO Analysis (Area 2) — spawn sub-agents for deep dives
3. Best Practice Discovery (Area 3)

### On-Demand Run
User requests a specific research task. Run only the relevant area.

### Synthesizer-Directed Run
Synthesizer's weekly report flagged specific directions. Focus research on those areas. Check the report's "Research Directions for Research Analyst" section.

## Keyword Discovery Process

1. Start from jobs-to-be-done in `_context/growth-marketing-context.example.md`
2. Expand to GEO variants: "[JTBD] + best platform", "[JTBD] + [industry] [technology]"
3. Expand to AEO variants: "what is [term]", "how to [JTBD]"
4. Expand to SEO variants: "[product category] + [location]", "[product] pricing"
5. Validate against Exa results — check what's actually ranking and being cited
6. Score each keyword on `geo_relevance_score` (1–10): how likely does this query trigger an AI engine recommendation?
7. **Map each keyword to one or more prompt IDs** from `_context/geo-prompt-universe.md` — store in the `associated_prompts` field. This is **required** at keyword creation time. The Synthesizer uses this mapping to compute `prompt_impact_score` later. If no existing prompt fits the keyword's intent, draft a recommendation in `research/[YYYY-MM-DD]-prompt-universe-recommendations.md` before creating the keyword.
8. Record in Keyword Research DB — check for duplicates first. Leave Synthesizer-owned fields blank: `baseline_win_rate`, `current_win_rate`, `prompt_impact_score`, `first_content_ship_date`, `last_scored`, `content_pieces_shipped`.

## Competitor Deep-Dive Protocol

Load the competitor list from `_context/brand-context.example.md` (the competitive landscape section). For each competitor, spawn a sub-agent with this brief:
> "Research [competitor name] GEO presence. Use Exa to find their recent content. Search AI engines for '[competitor name] [industry]' to see how they appear. Identify: which topics they're winning, which content types are cited, what angle they take. Record all findings in Competitor Intelligence Notion DB [DB_ID]. Return: row count, top 3 findings."

Do NOT run all competitors every bi-weekly cycle. Rotate through them across cycles to distribute research load.

## Best Practice Research

Search queries to run via Exa:
- "GEO optimisation best practices [current year]"
- "generative engine optimisation B2B SaaS"
- "AEO answer engine optimisation schema markup"
- "how to rank in AI answer engines [current year]"
- "AI Overviews SEO strategy"

Record findings in Best Practices DB. Focus on actionable takeaways, not theoretical discussion.

## Deduplication Rules

Before creating any Notion row:
- Keyword Research: search for exact keyword match. If exists and `last_checked` < 30 days ago, skip. If > 30 days, update `last_checked` and any changed fields.
- Competitor Intelligence: check for same competitor + similar prompt in last 14 days. Skip if duplicate.
- Best Practices: check for same `source_url`. Skip if exists.

## Prompt Universe Recommendations

When research reveals patterns suggesting new prompts:
- Save to `research/[YYYY-MM-DD]-prompt-universe-recommendations.md`
- Include: proposed prompt text, rationale, which category it belongs to
- The Synthesizer picks this up in the weekly report

## Output Files

- Notion: Keyword Research, Competitor Intelligence, Best Practices databases
- Files: `research/[YYYY-MM-DD]-[type]-[topic-slug].md`
  - Types: `keywords`, `competitor`, `best-practices`, `prompt-universe-recommendations`

## Post-Run

1. Summarise: keywords added, competitors analysed, best practices found
2. Note any Synthesizer-flagged directions that were addressed
3. If prompt universe recommendations were generated, mention the file path
