# SOP: Content Creator — Writing Blog Posts and Social Content

## Purpose
Execute content briefs from the Content Calendar. Produce blog posts and paired social posts (LinkedIn + X) that are brand-aligned, GEO-optimised, and current. Hand off every piece to the content-reviewer.

## Pre-Flight: Brief Availability Check

**Run this check before anything else.**

1. Query `CONTENT_BRIEFS_DB_ID` for briefs with Status = "Open" or "Scheduled"
2. Count the results

**If count ≥ 3**: Proceed normally to the Pre-Writing Checklist below.

**If count < 3**: Do not proceed to writing yet.
   - Announce: "Fewer than 3 open briefs available. Running research-analyst to generate new briefs before continuing."
   - Invoke the `research-analyst` agent (use the `sop-research-analyst.md` workflow)
   - Wait for research-analyst to complete and write new briefs to `CONTENT_BRIEFS_DB_ID`
   - Then proceed to the Pre-Writing Checklist below

> **Why this threshold:** The Synthesizer generates briefs weekly (Tuesday), but content-creator runs daily. A buffer of 3 open briefs ensures the content pipeline never stalls due to brief shortage.

## Pre-Writing Checklist

- [ ] Apply `.claude/rules/brand-context-loading.md` (Voice Guide, Style Guide, Brand Context, Product Offerings as the brief requires)
- [ ] Apply `.claude/rules/brand-facts.md` (CTA copy, `${BRAND_URL}`)
- [ ] Apply `.claude/rules/output-format.md` (`.docx`, folder placement, file naming)
- [ ] Read `CONTENT_CALENDAR_DB_ID` and `CONTENT_PERFORMANCE_DB_ID` from `.claude/CLAUDE.md`
- [ ] Fetch the brief from Content Calendar Notion DB
- [ ] Confirm content type: Blog Post, Social Pair (LinkedIn + X), or Blog + Social Pairs

## Mandatory Pre-Writing Step: Trends Research

**Never skip this step.** Before writing anything:

1. Invoke `content-trends-research` skill with: brief topic, target keywords, target prompt IDs
2. Wait for the trend snapshot (5–10 bullets: current news, competitor angles, gap opportunity, recommended hook)
3. Use the recommended hook/angle as the content's opening framing

Even for social posts — the trend snapshot keeps content current and differentiated.

> **Why trends research stays here, not in research-analyst:** Research-analyst runs bi-weekly; content-creator runs daily. A trend snapshot generated on Monday is stale by Wednesday. Trends research must happen at write-time so the hook is always fresh. Research-analyst feeds strategic keyword and competitor intelligence into briefs via the Synthesizer — that is its role. Content-trends-research is a tactical, per-topic, per-day operation.

## Blog Post Structure

Follow this structure for every blog post:

```
# [Title — follows brand headline patterns from Voice Guide]

[Opening: reader's problem or tension — NOT brand features. Incorporate trend snapshot hook.]

## [Context section — why this matters now. Reference current trends from snapshot.]

## [Core argument — the specific, operational answer. Include target keywords naturally.]

## [H2 or H3 phrased as a question] <- DIRECT ANSWER BLOCK
[2–4 sentence, quotable passage that starts with the answer. No wind-up.]

## [Supporting section — product connection where relevant]

## Frequently Asked Questions

### [Question 1 — phrased as the target persona would ask it]
[1–3 paragraph answer. Clear, specific, no filler.]

### [Question 2]
[Answer]

### [Question 3]
[Answer]

## About [BRAND_NAME]

[Insert your brand CTA copy from `.claude/rules/brand-facts.md` here]
Learn more at ${BRAND_URL} →
```

**Requirements checklist**:
- [ ] Target keywords in title, H1, and at least 2 body sections
- [ ] Direct answer block present (quotable, starts with the answer)
- [ ] FAQ section: minimum 3 questions as H3 headings
- [ ] Internal links to product pages where relevant
- [ ] About brand CTA present at the end — use the exact copy from `.claude/rules/brand-facts.md`, no variations
- [ ] Word count: 800–1,500 standard; 1,500–2,500 pillar (brief specifies)

## Blog Image Generation

After completing the blog post text, generate a blog hero image via `mcp__nanobanana__generate_image`.

### Prompt guidelines:

Construct the prompt to produce a **1200×800 professional stock photo or 3D render** that is:
- Conceptually relevant to the blog topic
- No text, no words, no UI overlays
- Limited elements — clean, uncluttered composition
- Professional, modern aesthetic — blue or dark color tones preferred
- Style: realistic photography OR 3D render OR dark abstract digital art

**Base prompt pattern:**
```
Generate a 1200x800 professional stock image for a blog post about [TOPIC]. [1-2 sentences describing the conceptual scene]. No text, no words, no UI elements. Clean, minimal composition with limited elements. Modern and professional. Blue, dark navy, or dark teal color palette.
```

### Model:
Always use `model_tier="flash"` (Gemini 2.5 Flash Image).

### Save as:
Per `.claude/rules/output-format.md` — `content/blog/[YYYY-MM-DD]-[slug]-image.png`.

Include the image as the first item in the blog .docx file (before the title), or embed a reference to the image file path at the top.

---

## Social Post Protocol — Paired Format

**Every topic produces exactly one LinkedIn post + one X post + one shared image.**

This is the atomic unit of social output. Never produce a LinkedIn post without its X counterpart, and never produce a post without an image.

### Steps per topic:

1. Invoke `social-content-writing` skill with the brief and trend snapshot as source material
2. The skill produces both the LinkedIn and X text
3. Generate one image via `mcp__nanobanana__generate_image` that works for both platforms (square 1:1, minimal text, brand-consistent visual concept)
4. Save all three outputs (LinkedIn, X, image) together

### Image generation guidance:
- One image per topic, used on both LinkedIn and X
- Prompt the image generator with the post's core concept, not text overlays
- Brand-consistent: professional, relevant industry aesthetic
- Avoid stock-photo clichés — prefer abstract or conceptual visuals
- Always use `model_tier="flash"` (Gemini 2.5 Flash Image)
- Name the image file after the post topic (descriptive slug, not the auto-generated hash): `content/social/[YYYY-MM-DD]-[topic-slug]-image.png`

### Embedding images in the output docx:
- All 4 pairs go into **one single .docx** file
- After the LinkedIn and X text for each pair, embed the image inline in the doc
- Add a small italic caption below the image with the filename
- This allows the image to be referenced directly when posting without hunting for separate files

### For blog repurposing:
After writing a blog, extract the strongest claim, stat, or angle → treat it as a social topic → follow the paired format above.

## Daily Output Target

**4 LinkedIn + X pairs per day** (4 topics × 1 LinkedIn + 1 X + 1 shared image each).

Sources for the 4 topics each day (in priority order):
1. Content Calendar briefs generated by the Synthesizer
2. Blog repurposed angles (up to 1 per blog published that day)
3. Timely research-analyst findings or trending angles from the trend snapshot

## File Naming

Per `.claude/rules/output-format.md` "File naming".

## Notion Updates

After saving all drafts for a topic, update **both** databases:

1. **Content Briefs DB** (`CONTENT_BRIEFS_DB_ID`): Set `Status` → "Drafted" and populate `Output File Path` with the saved file paths (comma-separated if multiple files)
2. **Content Calendar DB** (`CONTENT_CALENDAR_DB_ID`): Set `Status` → "Drafted", add file paths for all files
3. **Content Performance DB** (`CONTENT_PERFORMANCE_DB_ID`): Create row with title, type, brief_source, status = "Drafted", file_path

Update Content Briefs first — it is the source of truth for brief lifecycle status.

## Handoff to Content Reviewer

After every topic's pair is complete:
```
Draft complete. Handing off to content-reviewer.
Files: [linkedin path], [x path], [image path]
Brief ID: [id]
```

Do NOT mark as "complete" or "published". The reviewer advances status.

## Revision Protocol

If content-reviewer returns NEEDS_REVISION (structural):
1. Read the revision instructions carefully
2. Re-run the writing step with additional instructions applied
3. Save as the same file path (overwrite the draft)
4. Hand off again to reviewer
5. Max 2 revision cycles — after that, reviewer escalates

## Forbidden Vocabulary (Quick Reference)

Never use: revolutionary, game-changing, seamless, AI-powered, AI does the work for you, cutting-edge, next-generation, holistic, synergy, leverage (as verb), unlock, empower, disrupt

Instead: be specific about what the product does and what outcome it produces.

## Content Cadence Reference

| Type | Frequency | Notes |
|------|-----------|-------|
| Blog | 3/week | Mon, Wed, Fri |
| LinkedIn + X pair | 4/day | Each pair = 1 topic, 1 image shared across both |

Daily social production: 4 topics × (1 LinkedIn + 1 X + 1 image) = 4 LinkedIn posts, 4 X posts, 4 images.
