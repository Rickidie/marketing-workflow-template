# Rule: Brand Facts

Authoritative facts for any brand-facing claim. Use these exactly. Do not invent variants.

**Template note**: Replace all placeholder values below with your brand's actual details before using this workspace. This file is loaded by agents and SOPs whenever brand identity, URLs, or CTA copy is needed.

---

## Identity

- **Legal name**: [Your Legal Entity Name] (e.g. Acme Inc.)
- **Address**: [Your registered business address]
- **Ownership**: [Parent company or ownership structure, if relevant]
- **Predecessor**: [Former brand name, if rebranded] (leave blank if not applicable)

---

## URLs

- **Website**: `www.your-domain.com` — use in every CTA, link, and copy reference
- **Never use**: Any legacy domains or variants not listed above

---

## Positioning (one-liner)

[Your brand] is [category descriptor] for [target audience] — [completing what outcome] through [key differentiator or methodology].

**Example structure**: "[Brand] is an AI-native [category] platform for [audience] — completing [workflow] in a more efficient, auditable, and scalable way through [approach]."

Full positioning lives in `_context/brand-context.example.md` — load that file when you need the longer form. This rule covers the load-bearing facts only.

---

## Standard CTA copy (blog footer)

Replace the template text below with your brand's standard CTA. Use this exact copy in every blog post footer. No variations.

> [YOUR BRAND] is [your one-line category descriptor] dedicated to helping [your audience] [achieve what outcome]. By [how your product works], [your brand] enables [your audience] to [primary benefit] and [secondary benefit].
>
> Learn more at [your-domain.com] →

---

## Notes for template users

- Once you set these facts, every agent that loads this rule will use them without prompting.
- The `brand-context-loading.md` rule determines when this file is loaded vs. when `_context/brand-context.example.md` is loaded. This file is for quick, frequently-referenced facts. The context file is for deeper positioning and narrative.
- Update the CTA copy block above before your first content run.
