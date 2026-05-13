---
name: social-content-writing
description: "Create complete social media posts — text + branded image — for X (Twitter) and LinkedIn. Use this skill whenever the user asks to write a social post, create content for X or LinkedIn, needs a social image, wants to announce something on social media, or says anything like 'write a tweet', 'draft a LinkedIn post', 'create a social post about', 'make a post for', 'social content for this topic', or 'post for X/LinkedIn'. Always use this skill for social content tasks — it handles brand voice, platform formatting, AND image generation together."
---

# Social Content Writing

Write platform-native social posts for X (Twitter) and LinkedIn, each paired with a branded image generated via the nanobanana MCP. Output is ready to publish.

## When to Use This Skill

- Writing a post about a product update, feature, insight, event, quote, or partnership
- Turning a topic, article, or brief into a finished LinkedIn or X post
- Creating social content that needs a branded image alongside the text
- Repurposing any content (blog post, news, announcement) into a social-ready format

---

## Step 1 — Understand the Request

Identify (from what the user provides, or ask if genuinely missing):

1. **Topic or source material** — what is the post about?
2. **Platform(s)** — X, LinkedIn, or both?
3. **Content type** — which of the 5 types applies? (See Template Selection below)
4. **Style preference** — has the user specified a visual style? If not, load context (Step 2).

Avoid asking for information already clear from the request. If the topic is provided and the type is inferable, proceed directly.

---

## Step 2 — Load Brand Context

Unless the user specifies a different visual style, read these files before writing anything:

| File | What it covers | Load when |
|------|---------------|-----------|
| `_context/brand-voice-guide.example.md` | Tone, vocabulary, what to avoid | Always |
| `_context/brand-style-guide.example.md` | Colors, typography, visual identity | Always |
| `_context/brand-context.example.md` | Company identity, positioning | When company-level context matters |
| `_context/product-offerings.example.md` | Product details and metrics | When writing about product capabilities |

Do not load all files by default — load what is relevant to the specific task.

---

## Step 3 — Template Selection

Match the post's purpose to one of the 5 social image templates:

| Template | Use for | Canvas |
|----------|---------|--------|
| **Cover / Announcement** | Product launches, major news, campaign kicks, bold statements | 1200×628px |
| **Leader Quote** | Executive quotes, thought leadership, attributed insights | 1200×628px |
| **Event Announcement** | Webinars, conferences, hosted gatherings, AMA events | 1200×628px |
| **Speaker Card** | Panel lineups, AMA speakers, multi-speaker events | 1200×628px |
| **Partnership** | Integrations, co-announcements, partner collabs | 1080×1080px |

When in doubt, default to **Cover / Announcement** for general content.

---

## Step 4 — Write the Post Text

Write platform-native copy. One post carries one real claim — no padding.

### X (Twitter)

- Lead with the strongest claim, tension, or proof point
- Keep compression; specificity beats adjectives
- 280 characters max per tweet; threads are fine if the content earns it
- If writing a thread, every tweet must advance the argument — no recap tweets
- End with a CTA only when it's earned (link, question, action)
- No engagement bait; no "here's why this matters" without immediate follow-through

**Good X hook patterns for B2B professional audiences:**
- Metric-first: "[Specific metric or outcome] — no [manual process]."
- Tension-first: "[Audience] don't have a [symptom] problem. They have a [root cause] problem."
- Counterintuitive: "Adding more [resource] doesn't fix [problem]. Fixing [root cause] does."

### LinkedIn

- Expand enough for people outside the immediate niche to follow — but no more
- Open with the point, not a wind-up
- Short paragraphs (1–3 lines max); visual breathing room matters on LinkedIn
- No corporate inspiration cadence; no "I'm humbled to share..."
- No fake lesson posts unless the source material is genuinely reflective
- CTAs should direct to a next action, not just prompt comments
- 150–300 words is the right range for most posts; threads/carousels can run longer

### Voice Guardrails (apply to both platforms)

Pull tone from `_context/brand-voice-guide.example.md`. General rules:
- Expert and operationally grounded — write as a domain professional, not a marketer
- Metrics and specifics over adjectives
- Never: "revolutionary", "game-changing", "seamless", "future of [category]"
- Always pair autonomy with auditability where relevant

---

## Step 5 — Generate the Image with nanobanana MCP

Use `mcp__nanobanana__generate_image` to generate the visual.

### Image Availability Check

Attempt to use nanobanana first. If the tool is unavailable or returns an error, flag it clearly:

> **Image generation unavailable:** The nanobanana MCP tool could not be reached. The post text is ready above. Please generate the image separately or contact your MCP administrator.

Do not silently skip image generation.

### Building the Image Prompt

Construct a precise prompt based on the selected template. Load `_context/brand-style-guide.example.md` for brand color hex codes and layout specs.

**Universal image prompt rules:**
- Always specify exact hex colors from the brand style guide (load it before generating)
- Specify canvas dimensions explicitly (e.g., "1200x628 pixel landscape image")
- Name the typography style: "bold geometric sans-serif, clean, modern"
- Include the brand wordmark placement and color version (white on dark/brand color; brand color on white)
- Describe composition as a layout description, not as "a design that looks like..."

**Prompt tone:** Precise and spatial. Describe what is where, not what it feels like.

### After Generation

- Display the image to the user inline
- Note which template type was used
- Offer to regenerate with adjustments if the result needs refinement

---

## Step 6 — Deliver and Save

### Output Format

Present the deliverable clearly:

```
## [Platform] Post

[Post text — ready to copy/paste]

---

## Social Image

[Generated image displayed inline]
Template used: [Cover / Leader Quote / Event / Speaker / Partnership]
Dimensions: [e.g., 1200×628px]
```

If writing for both X and LinkedIn, produce both text variants plus the image (one image serves both unless the user requests separate formats).

### File Saving

Save finished outputs to `content/social/`. Use descriptive filenames:
- `content/social/[date]-[topic-slug]-x.docx`
- `content/social/[date]-[topic-slug]-linkedin.docx`

Save the generated image to the same folder using the upload tool if available.

---

## Quality Gate

Before delivering, verify:

- [ ] Post text contains a real, specific claim — not adjectives
- [ ] Tone matches brand voice guide (no forbidden vocabulary)
- [ ] X post fits platform character limits; LinkedIn post is appropriately expanded
- [ ] Image uses correct template for content type
- [ ] Brand wordmark is placed correctly
- [ ] Brand colors are correct (per style guide — check the hex values)
- [ ] Image prompt specified layout, colors, and typography precisely
- [ ] nanobanana availability was confirmed or flagged

---

## Related Skills

- `marketing-skills:social-content` — broader social strategy and content calendars
- `ecc:content-engine` — source-first content repurposing across platforms
- `ecc:brand-voice` — voice profile derivation for multi-output campaigns
- `marketing-skills:copywriting` — longer-form copy feeding into social
