# Image Generation Prompt Templates

Reference for constructing nanobanana image prompts. Load `_context/brand-style-guide.example.md` to get the exact hex color codes for your brand before using these templates. Fill `[CONTENT]` and `[COLOR_*]` placeholders with actual values.

Templates follow a **platform × style** system. See the brand style guide for full layout specs and template selection guidance.

---

## Template Selection Quick Reference

| Situation | Recommended style | Canvas |
|-----------|------|--------|
| Bold stat or metric | Clean / Blue | 1200×628 / 1080×1080 |
| Regulatory / editorial take | Gradient / Blue Right | 1200×628 / 1080×1080 |
| Provocative question / hot take | Blue (Twitter) | 1200×628 |
| Contrast / comparison ("X vs Y") | Blue Left / Wave Line | 1200×628 |
| Multi-line statement / quote | Gradient (LinkedIn) | 1080×1080 |
| Minimal topic post / list teaser | Clean (LinkedIn) | 1080×1080 |
| Event announcement | Event | 1200×628 |
| Speaker lineup | Speaker | 1200×628 |
| Partnership / integration | Partnership | 1080×1080 |
| Governance / structural concept | Split (brand color) | 1200×628 |
| Single bold CTA / action statement | Button | 1200×628 |
| Editorial / typographic statement | Blocks Grey | 1200×628 |
| Premium editorial / institutional | Dark Right | 1200×628 |
| Market / industry / macro-trend | Building (LinkedIn) | 1080×1080 |

---

## Color Reference

Load `_context/brand-style-guide.example.md` to get exact hex values for:
- Primary brand color (used for backgrounds, headlines, wordmark on white)
- Dark background color (used for speaker cards, photo panel overlays)
- White (text on dark/brand color backgrounds)
- Near-black (headline text on white templates)
- Secondary/accent colors (gradients, geometric elements)

Replace `[COLOR_PRIMARY]`, `[COLOR_DARK]`, etc. in the prompts below with the actual hex codes from the style guide.

---

## Prompt Frameworks

### Style: Full Brand Color Background (Twitter, 1200×628px)

```
A 1200x628 pixel landscape social media graphic. Full-bleed background in brand primary color ([COLOR_PRIMARY]).

Layout:
- Bold white headline "[HEADLINE]" in bold geometric sans-serif, upper-left to center-left zone, left-aligned. Large size — fills roughly one-third of the image height.
- Below headline: "[DESCRIPTOR]" in regular-weight white, smaller size.
- Top-right: two overlapping geometric rectangles in a darker shade of the brand color — one square and one taller rectangle, layered to create depth. No text.
- Bottom-left: brand wordmark in bold white all-caps geometric sans-serif.
- Clean flat design. No gradients, no shadows, no decorative underlines.
```

### Style: Full Brand Color Background (LinkedIn, 1080×1080px)

```
A 1080x1080 pixel square social media graphic. Full-bleed background in brand primary color ([COLOR_PRIMARY]).

Layout:
- Bold white headline "[STAT OR HEADLINE]" in bold geometric sans-serif, left-aligned, positioned in the left half of the image vertically centered or slightly above center.
- Below: "[DESCRIPTOR]" in regular-weight white, smaller size.
- Top-right: two overlapping geometric rectangles in a darker brand color — layered depth effect.
- Bottom-left: brand wordmark in bold white geometric sans-serif.
- Flat design. No gradients, no shadows.
```

### Style: Blue Left Panel (Twitter, 1200×628px)

```
A 1200x628 pixel landscape social media graphic split into two vertical panels.

Left panel (~40% of width): Full brand primary color ([COLOR_PRIMARY]) background. A large geometric brand initial/icon shape formed by thin angular outline strokes in white, semi-transparent, fills most of the panel area. Along the far left edge, the brand name letters are arranged vertically in white, bold, widely letter-spaced.

Right panel (~60% of width): White ([COLOR_WHITE]) background.
- Bold near-black ([COLOR_NEAR_BLACK]) headline "[MAIN HEADLINE]" — large, left-aligned within the right panel.
- Below: "[SUBHEADLINE]" in brand primary color ([COLOR_PRIMARY]), bold or semibold.
- A thin horizontal rule in brand color beneath the subheadline.
- Small regular-weight grey descriptor "[NOTE TEXT]" below the rule.

Clean flat design. No shadows.
```

### Style: White Background, Clean (Twitter, 1200×628px)

```
A 1200x628 pixel landscape social media graphic. White ([COLOR_WHITE]) background.

Layout:
- Center of image: Large bold brand-colored stat or number "[90%]" — very large, centered horizontally and vertically.
- Below stat: "[DESCRIPTOR]" in near-black ([COLOR_NEAR_BLACK]), regular weight, centered, smaller than stat.
- Below descriptor: "[SMALL NOTE]" in light grey, small size, centered.
- Top-right: brand wordmark in brand primary color, bold geometric sans-serif, small.
- Bottom of image: Giant brand wordmark spanning the full image width as an ultra-light outline/watermark — barely visible, light color, outline strokes only, no fill. Letters are cropped at the bottom edge.

Flat design. Lots of white space above the stat. No geometric blocks.
```

### Style: Clean (LinkedIn, 1080×1080px)

```
A 1080x1080 pixel square social media graphic. White ([COLOR_WHITE]) background.

Layout:
- Bold brand-colored headline "[HEADLINE]" — left-aligned, positioned in the lower-left quadrant. Large but not oversized.
- Bottom-right: Large geometric brand motif — repeated or overlapping brand initial shapes formed by thin outline strokes only, in very faint light brand color. Large scale — approximately 40% of the image height. No fill.
- Very minimal. Generous white space in the upper portion.
```

### Style: Gradient Stripe (Twitter, 1200×628px)

```
A 1200x628 pixel landscape social media graphic. White ([COLOR_WHITE]) background.

Layout:
- Left side (~20% of width): A column of fine, closely-spaced vertical lines that form a gradient stripe — lines transition from light brand-adjacent blue on the left edge to a slightly deeper shade on the right edge of the stripe. The stripe is composed of many thin parallel vertical lines, not a solid fill.
- Brand wordmark — top-left, brand primary color, bold geometric sans-serif, small size.
- Headline "[HEADLINE]" — bold, near-black, left-aligned, positioned in the lower-left to center-left zone. Multi-line acceptable.
- Small italic right-aligned note "[NOTE]" at the bottom-right in light grey.

Flat design. No geometric blocks.
```

### Event (1200×628px)

```
A 1200x628 pixel landscape social media graphic. White ([COLOR_WHITE]) background.

Layout:
- Top-left: brand wordmark in brand primary color, bold geometric sans-serif.
- Right half: "[EVENT TITLE]" in bold brand color, large, 1-2 lines, left-aligned within right column. Below title: "[YEAR]" in oversized thin/light-weight brand color — noticeably larger than the title, weight contrast creates hierarchy.
- Bottom-left to center: thin-bordered rectangle containing small "co-host" label and partner logo placeholders in a horizontal row.
- At the top-right of the logo strip border: a solid brand-colored filled rectangular tab block intersecting the border.
- Bottom-right: geometric brand motif — angular shapes in thin brand color outline strokes, outline only, large.

Flat design.
```

### Speaker (1200×628px)

```
A 1200x628 pixel landscape social media graphic. Dark background ([COLOR_DARK]) background.

Layout:
- Top-left: brand wordmark in white, bold geometric sans-serif.
- Top area, below logo: "[HEADLINE e.g. 'Meet the speakers']" in bold white, large.
- Center: event badge — pill/rounded rectangle with "[EVENT NAME]" in white.
- Below badge: "[DATE, TIME]" in small white or light grey.
- Lower half: row of [N] circular avatar placeholders. Below each: speaker name in medium white, speaker title in small light grey.
- Optional bottom row: partner logos.

Flat design.
```

### Partnership (1080×1080px)

```
A 1080x1080 pixel square social media graphic. Soft light background with subtle gradient.

Layout:
- Horizontally and vertically centered: "[BRAND 1 LOGO]" | "[BRAND 2 LOGO]" with a thin vertical divider line between them.
- No headline copy. No body text. Logos only.
- Generous whitespace above and below.
- Minimal and clean.
```

---

## Typography Reference

- **Typeface:** Geometric sans-serif (per brand style guide — use the specified typeface or equivalent)
- **Bold:** Headlines, stats, wordmark
- **Regular:** Descriptors, body, captions
- **Light/Thin:** Large event years, small notes — creates weight contrast
- **Case:** Sentence case or title case for headlines — ALL CAPS for brand wordmark only
