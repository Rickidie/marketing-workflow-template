# Rule: Brand Context Loading

Any agent, SOP, or skill producing brand-facing output MUST load the relevant `_context/` file(s) before writing. Load only what the task needs — not the whole set.

## Files and when to load them

| File | Load when |
|---|---|
| `_context/brand-voice-guide.example.md` | Writing or reviewing any copy (blog, social, email, web) |
| `_context/brand-style-guide.example.md` | Producing formatted deliverables (docx, slides, decks) |
| `_context/brand-context.example.md` | Verifying positioning, audience, or company facts |
| `_context/product-offerings.example.md` | Making product claims or describing capabilities |
| `_context/growth-marketing-context.example.md` | Competitive differentiation or audience strategy |
| `_context/platform-reference.example.md` | Claims need operational specificity (modules, nodes, templates, roles, integrations) |
| `_context/geo-prompt-universe.md` | Working with prompt IDs (GEO monitor, synthesizer) |

## Discipline

- Load context **before** writing or evaluating — not after.
- Do not paste this list into agent or SOP files. Link to this rule instead.
- If the task is internal tooling with no brand-facing output (e.g., a Notion schema fix), skip context loading entirely.
