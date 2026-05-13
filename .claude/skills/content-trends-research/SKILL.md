---
name: content-trends-research
description: "Run pre-writing trends research before creating any content. Use this skill before writing a blog post or social content — it searches for current industry news, recent competitor content, and trending angles relevant to the brief topic. Outputs a 5-10 bullet trend snapshot the content creator uses to ensure content is timely and engaging. Extends marketing-skills:content-strategy and ecc:deep-research. Brand-agnostic — loads audience context at runtime. Does NOT write content — only prepares trend context."
---

# Content Trends Research Skill

A brand-agnostic pre-writing research workflow that ensures every piece of content is grounded in current industry context before writing begins. Extends `marketing-skills:content-strategy` (for audience and angle framing) and `ecc:deep-research` (for web research methodology). This skill is a mandatory step — content creator always runs it before writing.

**This skill does NOT write content.** It produces a trend snapshot that the content creator uses as input.

---

## Inputs Required

1. **Brief topic** — the subject of the content (from the Content Calendar brief)
2. **Target keywords** — the keywords the content should rank/win for
3. **Target prompts** — the GEO prompt IDs this content should help win (from the brief)
4. **Brand audience context** — loaded at runtime from `_context/growth-marketing-context.example.md`
5. **Content type** — blog post, LinkedIn post, X post, or mixed

---

## Research Workflow

### Step 1: Define search angles

From the brief topic and keywords, derive 4 search angles:

1. **Current news angle**: "[topic] + news [current month year]" — what's happening right now in this space
2. **Trend angle**: "[topic] + trend 2025 2026" — what's shifting in the industry
3. **Competitor content angle**: "[competitor 1] OR [competitor 2] [topic]" — what competitors are publishing on this topic right now
4. **Gap angle**: "[topic] + [one of the target GEO prompts phrased as a search query]" — what content is ranking/being cited for this query

Use the competitor list from `_context/growth-marketing-context.example.md` for the competitor angle. Load the file to find the relevant competitors.

### Step 2: Run Exa searches

Run each of the 4 search angles using `mcp__plugin_ecc_exa__web_search_exa`. Focus on results published in the last 14 days for news/trend angles, and last 30 days for competitor/gap angles.

For each search, capture:
- Top 3–5 results: title, URL, publication date, 1-sentence summary of the angle they take

Do not read full articles — headlines and summaries are sufficient.

### Step 3: Audience filter

Load `_context/growth-marketing-context.example.md`. Apply these filters to the raw search results:

**Keep** results that:
- Directly affect the target audience (as defined in the growth marketing context)
- Reference regulatory developments, enforcement actions, or compliance requirements relevant to the audience's geography
- Discuss operational pain points the audience faces
- Show what competitors are saying that you could respond to or differentiate from

**Discard** results that:
- Are vendor press releases with no substantive angle
- Cover markets outside the audience's primary context
- Are academic or theoretical without operational relevance
- Duplicate what another kept result already covers

### Step 4: Identify differentiation opportunity

After filtering, scan the kept results for a gap: what is NOT being said?

Look for:
- A perspective that none of the competitors are taking on this topic
- A more specific, operational framing vs competitors' generic content
- A counterintuitive angle that challenges conventional wisdom in the space
- A data point or outcome claim that your brand can back up that competitors cannot

This differentiation opportunity becomes the recommended hook/angle in the trend snapshot.

### Step 5: Synthesise the trend snapshot

Produce a concise snapshot in this format:

```
## Trend Snapshot — [Topic] — [Date]

**What's happening now** (2–3 bullets):
- [Current development 1 with source link]
- [Current development 2 with source link]
- [Current development 3 with source link, if relevant]

**What competitors are saying** (1–2 bullets):
- [Competitor name] is publishing on [angle] — e.g., [URL or title]
- [Competitor name] is positioning around [angle]

**What's NOT being said** (1 bullet — the gap):
- [The angle or claim nobody is making that you could own]

**Recommended hook/angle for this content**:
[One sentence: the specific angle this piece should take to be current, differentiated, and relevant to your audience]

**GEO tie-in**:
[One sentence: how this angle connects to the target GEO prompts — why would an AI engine cite this piece for those prompts?]
```

---

## Output

Return the trend snapshot inline — do not save to a file. The content creator uses it directly in the writing step.

After producing the snapshot, state clearly:
```
Trend research complete. Proceed with writing using the angle above.
```

---

## What to Do When Results Are Sparse

If Exa searches return few or no relevant results:
- Try broader search terms (drop the year, expand the topic category)
- Try searching for the target GEO prompts directly to see what's currently ranking
- If still sparse: note "Limited current coverage found — content will lead the conversation on this topic" in the snapshot. This is actually valuable intelligence — it means an opportunity to own a topic with little competition.

Do not fabricate trends or invent competitor angles. If no data exists, say so.

---

## Related Skills and References

- `marketing-skills:content-strategy` — content planning, audience strategy, editorial angle methodology
- `ecc:deep-research` — comprehensive web research methodology for complex topics
- `ecc:exa-search` — Exa search tool usage patterns
- `marketing-skills:customer-research` — audience language and buyer behaviour patterns
