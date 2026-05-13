# SOP: Website GEO Audit — Monthly Site Evaluation

## Purpose
Crawl the brand website, evaluate against GEO/AEO/SEO criteria, record findings in Notion.

## Pre-Audit Checklist

- [ ] Confirm target URL (set `BRAND_URL` in `.env`)
- [ ] Load brand context files (Brand Context, Product Offerings, Growth Marketing Context)
- [ ] Read `WEBSITE_AUDIT_LOG_DB_ID` from CLAUDE.md
- [ ] Review existing open issues in Website Audit Log — note which pages have unresolved issues
- [ ] Confirm audit scope (default: full site; user may request specific section)
- [ ] Confirm primary focus (default: all three — GEO, AEO, SEO)

## Crawl Protocol

1. **Build URL list first** — do not evaluate as you crawl
2. Start at homepage, follow top-level navigation links
3. Document every unique URL before starting evaluation
4. Crawl order: Homepage → Product pages → Industry pages → Blog (index + 10 recent) → About/Contact
5. For each page, capture: URL, title tag, meta description, H1/H2 tags, ld+json schema blocks, FAQ sections, word count, internal links

## Evaluation Protocol

Apply all checklists from the `website-geo-audit` skill in this order:

### 1. GEO Readiness (per key page)
- Direct answer block present? (2–4 sentences, starts with the answer, quotable without context)
- Quotable statistics present? (specific number + source, one sentence)
- Unique methodology named and explained?
- Market position stated clearly and quotably?
- Comparison content exists somewhere on the site?

### 2. AEO (per page with FAQ or process content)
- FAQPage schema present with mainEntity array?
- HowTo schema on process/workflow pages?
- Article schema on all blog posts with datePublished and dateModified?
- Questions phrased as actual H2/H3 headings (not just bold text)?
- Answers start directly with the answer (no wind-up)?

### 3. SEO (per page)
- Title tag: present, unique, < 60 chars, contains primary keyword?
- Meta description: present, < 155 chars, contains keyword + value statement?
- Single H1 containing primary keyword?
- Internal links from high-authority pages to conversion pages?
- Canonical tags present and correct?
- No accidental noindex on pages that should rank?

### 4. Content Gaps (site-wide)
Check for the 7 high-value page types (see `website-geo-audit` skill). Log each missing type as a Content Gap issue.

## Issue Severity Tiers

| Severity | When to use |
|----------|------------|
| Critical | Blocks AI citation or indexing. Examples: no schema on key pages, page noindexed, analytics not tracking correctly |
| High | Significantly reduces citation quality. Examples: missing FAQ schema, no direct answer blocks, no comparison page, no "what is" explainer |
| Medium | Reduces ranking or citation probability. Examples: title too long, missing internal links, thin meta descriptions |
| Low | Cosmetic or minor. Examples: heading capitalisation, minor schema formatting, image alt text |

## Always-Include Critical Issues

Every audit must include this row (check if resolved since last audit):
1. "CMS write access for schema implementation — confirm before actioning recommendations" — Critical (downgrade to resolved if confirmed)

## Deduplication

Before creating a new issue row:
- Check if an identical open issue exists for the same page + issue type from a previous audit
- If yes: add a note to the existing row ("Still open as of [date]") rather than creating a duplicate
- If the issue has been resolved: create a new row only if regression detected

## Notion Write Protocol

- One row per issue per page per audit date
- Auto-generate `issue_id` sequentially: AUDIT-001, AUDIT-002, etc.
- Set `status` = Open, leave `assigned_to` blank
- Write Critical issues first, then High, Medium, Low

## Post-Audit

1. Print the completion summary (format in `website-geo-audit` skill)
2. Recommend the top 3 highest-impact actions
3. Note: "Content gaps will be turned into briefs by geo-intelligence-synthesizer in the next weekly run."
