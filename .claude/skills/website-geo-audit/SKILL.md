---
name: website-geo-audit
description: "Audit a website for GEO, AEO, and SEO gaps. Use this skill when crawling a site with Playwright, evaluating pages against GEO citation readiness, AEO schema and structured content criteria, and SEO fundamentals, then recording every finding in a Notion audit log. Extends ecc:seo and marketing-skills:schema-markup with GEO/AEO-specific checklists, content gap framework, issue severity rubric, and Notion row structure for Website Audit Log records. Brand-agnostic — loads brand context at runtime."
---

# Website GEO Audit Skill

A brand-agnostic methodology for crawling a website, evaluating it against GEO, AEO, and SEO criteria, and recording every issue with severity and actionable recommendations in Notion. Extends `ecc:seo` (SEO fundamentals) and `marketing-skills:schema-markup` (schema implementation) — reference those skills for foundational methodology. This skill adds the GEO/AEO-specific criteria layer and the operational audit workflow.

---

## Inputs Required

1. **Target URL** — the website's homepage URL (crawl starts here)
2. **Brand context files** — loaded at runtime: brand context, product offerings, growth marketing context
3. **Notion DB ID** — `WEBSITE_AUDIT_LOG_DB_ID` from CLAUDE.md
4. **Audit scope** — full site or specific section/page; primary focus (GEO/AEO/SEO/all)

---

## Crawl Workflow

### Step 1: Build the URL list

Start at the homepage. Systematically navigate and log all URLs to audit before evaluating any of them:

1. Homepage
2. All top-level navigation links (product, solutions, industries, pricing, about, blog, contact)
3. All product/feature sub-pages
4. All industry/vertical sub-pages
5. Blog index + 10 most recent posts
6. Any standalone landing pages visible in the nav

**Do not evaluate as you crawl.** Build the full URL list first, then evaluate each page.

### Step 2: Per-page data capture

For each URL, capture using Playwright:

```
- Page URL
- <title> tag content
- <meta name="description"> content
- All <h1> tags (should be exactly one per page)
- All <h2> tags
- Any <script type="application/ld+json"> blocks (schema markup)
- FAQ sections visible on-page (look for FAQ headings or accordion elements)
- Visible word count estimate (document.body.innerText.split(' ').length)
- All internal links (href starting with same domain)
- Any explicit "answer" or "definition" blocks (div/section labelled as such)
```

---

## GEO Readiness Checklist

GEO (Generative Engine Optimisation) readiness = how likely an AI engine is to cite this page when answering a relevant query. Evaluate each key page.

### What counts as a "direct answer block"

A direct answer block is a passage that:
- Starts with the answer in the first sentence (not a wind-up or context paragraph)
- Is 2–4 sentences long, self-contained, and quotable without surrounding context
- Answers a specific question someone might type into an AI engine
- Ideally sits under an H2 or H3 phrased as that question

**Good example**: Under the H2 "What is event-driven [category] monitoring?" — "Event-driven monitoring triggers reviews based on specific client behaviours or risk signals rather than on a fixed calendar schedule. This means high-risk clients are reviewed immediately when a trigger occurs, while low-risk clients are reviewed less frequently. The result is faster response times and fewer wasted analyst hours."

**Bad example**: "[Category] monitoring is an important part of compliance. Companies have long used various approaches. One such approach is event-driven monitoring, which we will explain below."

### What counts as a "quotable statistic"

A statistic that is:
- A specific number in context: "[Brand] clients reduce [metric] by [X]%"
- Sourced or attributable (internal data, client outcomes, or published research)
- One sentence, complete without surrounding text

Vague claims ("significant reduction", "up to 90% faster") do not qualify.

### GEO Readiness checks per page

| Check | Pass criteria | Severity if missing |
|-------|--------------|---------------------|
| Direct answer block present | At least one passage matching the definition above | High |
| Quotable statistics present | At least one specific, sourced number | Medium |
| Brand's unique methodology named and explained | Proprietary framework or approach named with a 2–3 sentence explanation | High |
| Market position stated clearly | A single sentence stating what the brand does, for whom, and in which market — quotable without context | High |
| "What is X" definitional section | At least one page on the site has a definitional section for the brand's primary category | High |
| Comparison content exists | At least one page compares the brand to alternatives or traditional approaches | High |

---

## AEO Checklist (Answer Engine Optimisation)

AEO = structuring content so AI answer engines can extract and present it directly. Evaluate schema markup and content structure.

### Schema markup checks

Reference `marketing-skills:schema-markup` for implementation syntax. Evaluate presence and correctness:

| Schema type | Where required | Check |
|-------------|---------------|-------|
| `FAQPage` | Any page with FAQ section | `@type: FAQPage` with `mainEntity` array of `Question` objects, each with `acceptedAnswer` |
| `HowTo` | Any page describing a process or workflow | `@type: HowTo` with `step` array |
| `Article` | All blog posts | `@type: Article` with `headline`, `author`, `datePublished`, `dateModified` |
| `Organization` | Homepage | `@type: Organization` with `name`, `url`, `logo`, `description` |
| `Product` or `SoftwareApplication` | Product/feature pages | `@type: SoftwareApplication` with `name`, `description`, `applicationCategory` |

**Schema quality checks**:
- FAQ answers must include the target keyword in the answer text (not just the question)
- `datePublished` and `dateModified` must be present and accurate on articles
- Schema must be valid JSON-LD (check for syntax errors in `<script type="application/ld+json">` blocks)

### Content structure checks

| Check | Pass criteria | Severity if missing |
|-------|--------------|---------------------|
| FAQ section present on key pages | Product pages, use-case pages, and blog posts have at least one FAQ section | High |
| Questions phrased as H2/H3 headings | FAQ questions are actual headings, not bold text | Medium |
| Answer starts directly | FAQ answers start with the answer in sentence 1 | High |
| Definitions structured as single-sentence | Key terms defined as "Term — [one sentence definition]" | Medium |
| HowTo content for process pages | Any page describing "how to" do something has HowTo schema | Medium |

---

## SEO Checklist

Reference `ecc:seo` for full SEO methodology. Focus these checks on GEO-adjacent SEO fundamentals.

| Check | Pass criteria | Severity if missing |
|-------|--------------|---------------------|
| Title tag | Present, unique per page, under 60 characters, contains primary keyword | High |
| Meta description | Present, under 155 characters, contains primary keyword and a clear value statement | Medium |
| Single H1 | Exactly one H1 per page, containing primary keyword | High |
| Internal linking | Key conversion pages linked from at least 3 other pages on the site | High |
| Canonical tag | Present on all pages, self-referencing for originals, pointing to original for duplicates | Medium |
| Page indexability | No `noindex` meta tag on pages that should rank | Critical |

---

## Content Gap Analysis Framework

Evaluate whether these 7 high-value page types exist on the site. Missing pages = content gap. Each gap is a potential High-priority audit issue.

| Page type | Why it matters for GEO | Example |
|-----------|------------------------|---------|
| "What is [primary category]?" explainer | Definitional content is the most cited type by AI engines | "What is [your category]?" |
| "[Brand] vs [Competitor]" comparison | Comparison queries drive purchase decisions; AI engines cite comparison pages | "[Your brand] vs [Competitor]" |
| "[Use case]" specific landing pages | Use-case framing matches how buyers search; AEO-optimisable | "[Category] for [specific audience]" |
| "How to [key workflow]" guides | HowTo schema opportunity; cited for process queries | "How to implement [key process]" |
| Industry-specific landing pages | Buyers search by industry; AI engines cite industry-specific pages for recommendation queries | "[Category] for [industry]" |
| Glossary / definitions page | Definitional authority; AI engines cite glossaries for "what is" queries | [Category] terminology glossary |
| Case studies / client outcomes | Social proof with specific metrics; cited for "does it work?" queries | Client outcome with specific % improvements |

---

## Issue Severity Rubric

| Severity | Definition | Examples |
|----------|------------|---------|
| **Critical** | Blocks AI citation entirely or prevents indexing | No schema on key pages; page marked noindex; no direct answer blocks on any page; analytics not set up |
| **High** | Significantly reduces citation quality or discoverability | Missing FAQ schema; no "what is" explainer; missing comparison page; meta descriptions absent |
| **Medium** | Reduces ranking probability or citation probability | Title tag too long; missing internal links; HowTo schema absent on process pages; thin meta descriptions |
| **Low** | Cosmetic or minor | Minor schema formatting issues; heading capitalisation; image alt text |

### Standard Critical flags — always include

These must appear as Critical severity issues in every audit, regardless of whether they already exist:

```
1. "Google Analytics 4 not set up — AI Referral Traffic and content performance tracking unavailable"
2. "Google Search Console not set up — organic keyword performance and indexing status unavailable; XML sitemap cannot be submitted"
3. "CMS write access for schema implementation — confirm before actioning schema recommendations"
```

---

## Notion Row Structure (Website Audit Log)

One row per issue per page per audit date. Use `mcp__claude_ai_Notion__notion-create-pages` with `data_source_id` from `WEBSITE_AUDIT_LOG_DB_ID`.

| Field | Type | Value |
|-------|------|-------|
| `issue_id` | Title | Auto-generate: "AUDIT-[sequential number]" e.g. AUDIT-001 |
| `page_url` | URL | Full URL of the page with the issue |
| `audit_date` | Date | Today's date |
| `issue_type` | Select | GEO, AEO, SEO, Content Gap, Technical |
| `severity` | Select | Critical, High, Medium, Low |
| `issue_description` | Text | What the problem is (specific, not generic) |
| `recommendation` | Text | What to do to fix it (specific and actionable) |
| `effort_estimate` | Select | Low (< 1 day), Medium (1–3 days), High (3+ days) |
| `status` | Select | Open |
| `assigned_to` | Person | Leave blank |
| `resolution_notes` | Text | Leave blank |
| `resolved_date` | Date | Leave blank |

---

## Completion Summary Format

```
Website GEO Audit Complete
Date: [YYYY-MM-DD]
Site audited: [URL]
Pages evaluated: [n]
Total issues logged: [n]
  Critical: [n]
  High: [n]
  Medium: [n]
  Low: [n]
Content gaps identified: [n]

Top 3 priority actions:
1. [Most critical action]
2. [Second priority]
3. [Third priority]

Notion database updated: Website Audit Log
Next step: Share findings with geo-intelligence-synthesizer for brief generation on content gaps.
```

---

## Related Skills and References

- `ecc:seo` — SEO audit methodology and keyword/ranking fundamentals
- `marketing-skills:schema-markup` — schema implementation syntax and best practices
- `marketing-skills:ai-seo` — AI SEO and GEO optimisation strategy
- `seo-geo` — GEO-specific optimisation criteria
