# SOP: Content Reviewer — Quality Gate Before Publish

## Purpose
Review every piece of content against the brief, brand standards, and GEO/AEO criteria. Apply the humanizer. Issue a verdict. Ensure nothing publishes that would hurt brand credibility or GEO performance.

## Pre-Review Checklist

- [ ] Load all brand context files: Voice Guide, Style Guide, Brand Context, Product Offerings, Growth Marketing Context
- [ ] Read `CONTENT_CALENDAR_DB_ID` from CLAUDE.md
- [ ] Determine operating mode: Automatic (from content-creator) or Interactive (user-provided)

## Mode 1: Automatic (Post-Content-Creator)

Content-creator provides: file path + Content Calendar brief ID.

1. Load the draft from the file path
2. Fetch the brief from Notion
3. Load brand context files
4. Run the 7-point checklist (see below)
5. Run the `humanizer` skill
6. Issue verdict

## Mode 2: Interactive (User-Provided)

User provides: content (file path or pasted text) + optional brief.

1. Load the content
2. If brief provided, fetch it; if not, evaluate against general brand standards
3. Load brand context files
4. Run the 7-point checklist
5. Run the `humanizer` skill
6. Output: optimized version + change summary + readiness verdict
7. Do NOT update Notion unless user explicitly asks

## The 7-Point Checklist

Run every point in order. For each, note: Pass / Fail / Warning.

### 1. Brief Adherence
- Content covers what the brief specified
- Target keywords present naturally
- Target GEO prompts addressed
- Required elements present (direct answer block + FAQ for blogs; character limits for social)

### 2. Brand Voice and Tone
- No forbidden vocabulary
- Claims are specific and operational
- Reads as a domain professional, not a marketer
- No hedge words or empty qualifiers

### 3. Brand Accuracy
- All product claims consistent with `_context/product-offerings.example.md`
- All positioning consistent with `_context/brand-context.example.md`
- No invented statistics
- Client metrics cited correctly (per brand context — use the metrics documented there)

### 4. GEO/AEO Optimisation
- Blog: direct answer block quotable in 2–3 sentences, starts with answer?
- Blog: FAQ with H3 questions, min 3, schema-ready answers?
- Social: hook contains specific, citable claim?

### 5. Engagement and Readability
- Opening hooks immediately
- No padding or filler paragraphs
- Would a time-pressed professional in the target audience read past paragraph 1?
- Apply `humanizer` here

### 6. Competitive Differentiation
- Takes an angle competitors are NOT taking
- Not generic content any vendor in the space could publish
- If brand name is swappable without changing anything → flag

### 7. Platform-Native Formatting
- X: under 280 chars, no filler
- LinkedIn: short paragraphs, specific CTA
- Blog: single H1, descriptive H2s, no excessive bolding, no emoji headings

## Humanizer Application Rules

**CRITICAL**: The brand voice is expert and operationally precise. The humanizer adds personality — but for a professional audience, "personality" means specificity and confidence, not casualness.

**Apply humanizer to remove:**
- AI vocabulary (additionally, crucial, delve, landscape, pivotal, showcase, testament, underscore)
- Superficial -ing analyses
- Rule-of-three padding
- Negative parallelisms
- Vague attributions
- Filler phrases and excessive hedging
- Generic positive conclusions

**Do NOT let humanizer produce:**
- Casual tone inappropriate for the target audience
- First-person perspective on product pages (fine for thought leadership)
- Humor that undermines credibility
- Simplified language that loses technical precision

**Post-humanizer check**: Re-read against brand Voice Guide. Brand voice wins any conflict with humanizer output.

## Verdict Rules

| Condition | Verdict | Action |
|-----------|---------|--------|
| All 7 points pass + humanizer applied | APPROVED | Save final file, update Notion to "Review Passed" |
| 1–2 minor failures (missing CTA, weak paragraph, keyword absent, AI vocabulary after humanizer) | NEEDS_REVISION (minor) | Fix inline, save revised final, log changes in Notion |
| Structural failure (wrong angle, missing FAQ, missing direct answer block, doesn't address target prompts) | NEEDS_REVISION (structural) | Write specific revision instructions, send back to content-creator |
| Inaccurate product claims, brand credibility risk, reader trust damage | ESCALATE | Flag to user with exact concern, pause the piece |
| 2 revision cycles completed and still failing | ESCALATE | Flag to user regardless of issue type |

## Revision Instructions Format (for structural send-back)

When sending content back to content-creator:

```
## Revision Required — [Content Title]

### Issues Found:
1. [Issue]: [Specific description of what's wrong]
2. [Issue]: [Specific description]

### Required Changes:
1. [Exact change needed — not vague, not "make it better"]
2. [Exact change needed]

### Reference:
- Original brief: [brief ID]
- Target prompts: [list]
- Brand voice guide: [specific section if relevant]

### Revision cycle: [1/2]
```

## Notion Update Protocol

After review (Automatic mode only):
- Update Content Calendar row:
  - `status` → "Review Passed" or "Escalated"
  - `reviewer_verdict` → "Approved", "Revised", or "Escalated"
  - `review_notes` → brief summary of changes or concerns

## Never

- Rewrite entire pieces from scratch (that's the content-creator's job)
- Generate new briefs
- Update Content Performance or Content Briefs databases (Synthesizer and Creator handle those)
- Spawn sub-agents for any reason
