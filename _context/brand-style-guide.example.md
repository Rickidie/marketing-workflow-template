# Brand Style Guide

**Template note**: This file defines your brand's visual identity, colors, typography, and formatting rules. It is loaded by the social-content-writing skill and content-creator agent when generating images and formatted deliverables. Replace every placeholder with your brand's actual specifications.

---

## Brand Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | [Your primary color name] | `#XXXXXX` | Backgrounds on branded assets, headlines on white, wordmark on white |
| Dark | [Your dark color name] | `#XXXXXX` | Speaker cards, photo panel overlays, dark-background templates |
| White | White | `#FFFFFF` | Text on dark/primary-color backgrounds |
| Near-black | [Your text color name] | `#XXXXXX` | Headline text on white templates |
| Accent 1 | [Optional accent name] | `#XXXXXX` | Geometric elements, gradients |
| Accent 2 | [Optional accent name] | `#XXXXXX` | Secondary emphasis |

**For image generation prompts**: Always specify hex codes explicitly. Load this file before calling the nanobanana image generation tool.

---

## Typography

- **Primary typeface**: [Your typeface name — e.g. Inter, Neue Haas Grotesk, Aktiv Grotesk]
- **Classification**: [Geometric sans-serif / Humanist sans-serif / Serif / etc.]
- **Headline weight**: Bold
- **Body weight**: Regular
- **Display/Large number weight**: Light or Thin (for contrast)
- **Wordmark case**: ALL CAPS
- **Headline case**: Sentence case or Title Case (specify your preference)

---

## Logo and Wordmark

- **Wordmark on light backgrounds**: Primary brand color
- **Wordmark on dark/primary-color backgrounds**: White
- **Minimum clear space**: [Specify — e.g. equal to the height of the logo mark on all sides]
- **Never**: Rotate, stretch, recolor outside the approved palette, or place on a clashing background

---

## Social Image Templates

The social-content-writing skill uses these templates. Match the content type to the right canvas:

| Content type | Template | Canvas |
|-------------|----------|--------|
| Bold stat or metric | Clean / Full brand color | 1200x628 or 1080x1080 |
| Regulatory / editorial take | Gradient | 1200x628 |
| Provocative question | Full brand color (Twitter) | 1200x628 |
| Comparison / contrast | Split panel | 1200x628 |
| Multi-line statement / quote | Gradient (LinkedIn) | 1080x1080 |
| Minimal list teaser | Clean (LinkedIn) | 1080x1080 |
| Event announcement | Event | 1200x628 |
| Speaker lineup | Speaker | 1200x628 |
| Partnership / integration | Partnership | 1080x1080 |

For full template prompt syntax, see `.claude/skills/social-content-writing/references/image-templates.md`.

---

## Document Formatting

- **Reports and blog posts**: Saved as `.docx`. Use standard Word heading styles (Heading 1, Heading 2, Heading 3).
- **Tables**: Simple grid. No merged cells unless structurally necessary.
- **Code blocks**: Monospace, shaded background.
- **Lists**: Use bullets for unordered lists; use numbered lists only when sequence matters.

---

## Photography and Imagery Style

[Describe your preferred photography or illustration direction — e.g.:]
- [Clean, minimal — no stock-photo-looking imagery]
- [Abstract geometric patterns preferred for thought leadership content]
- [Photography: natural light, professional settings, diverse representation]

---

## What to Avoid

- Gradients that feel consumer-app (neon, playful, rainbow)
- Drop shadows on text
- Stretched or distorted logo
- Clashing colors outside the brand palette
- Clipart or generic icon sets
- [Add your specific visual taboos here]
