# marketing-workflow-template

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-blueviolet)](https://claude.ai/download)

**Open-source GEO/SEO marketing agent system for Claude Code. 6 agents, 6 skills, 70-prompt brand-monitoring universe, Notion integration, BigQuery analytics. Bring your own brand context.**

---

## What is this?

This template gives you a complete Generative Engine Optimization (GEO) marketing workflow — designed to improve your brand's visibility in AI-generated answers from engines like Perplexity, ChatGPT, Gemini, and more. It ships 6 coordinated Claude Code agents that form a closed loop: research feeds strategy, strategy drives content, content gets reviewed, and tracking data closes back into research. The brand-monitoring core runs a 70-prompt universe against 7 AI engines every week and records 10 GEO metrics per response in Notion, giving you week-over-week trend data on how AI engines perceive and cite your brand.

---

## Why use it?

- **Track brand presence across 7 AI engines** — Perplexity, ChatGPT, Google AI Overviews, Gemini, Bing Copilot, Claude, Meta AI — on 70 prompts per week
- **Generate content briefs from data** — the Synthesizer reads all 8 Notion databases, scores keyword bets, and produces a full weekly Content Calendar
- **BigQuery-backed analytics** — AI referral traffic and page-level sessions pulled directly from GA4 via BigQuery, with ready-to-run SQL
- **Notion-backed databases** — 8 structured databases covering keywords, competitors, content briefs, content calendar, audit log, and performance tracking
- **Fully brand-agnostic** — all agents and skills load brand context at runtime from `_context/`. Swap in your brand by filling the `.example.md` stubs

---

## Architecture

```
Pipeline:  research → strategy → content → review → tracking → research (loop)

Agents:
  research-analyst          Research stage      Bi-weekly Monday + on-demand
  website-geo-auditor       Research (audit)    Monthly first week + on-demand
  content-creator           Content             Manual / daily cadence
  content-reviewer          Review              Auto after content-creator
  brand-geo-monitor         Tracking            Weekly Monday
  geo-intelligence-synthesizer  Strategy + Eval Weekly Tuesday

Weekly schedule:
  Monday      brand-geo-monitor runs all 70 prompts × 7 engines
  Tuesday     geo-intelligence-synthesizer synthesises data, scores keywords,
              generates Content Calendar for the coming week
  Mon–Sun     content-creator executes calendar entries; content-reviewer follows
  Bi-weekly   research-analyst runs keyword and competitor research
  1st of month  website-geo-auditor audits the site
```

---

## Prerequisites

- **Node.js 20+** and npm
- **Claude Code** ([download](https://claude.ai/download)) — Claude Code reads `.claude/` automatically
- **Notion workspace** — create a free workspace at notion.so, then create an integration at notion.so/profile/integrations
- **Google Chrome** (for the CDP-based AI engine runner) — run with `--remote-debugging-port=55068`
- **BigQuery + GA4** (optional) — required only if you want AI referral traffic analytics in weekly reports. Needs a GCP project with GA4 BigQuery export enabled and a service account key
- **Gemini API key** (optional) — required only for blog hero image generation via nanobanana MCP

---

## Quickstart

1. **Clone the repo**

   ```bash
   git clone https://github.com/Rickidie/marketing-workflow-template.git
   cd marketing-workflow-template
   ```

2. **Run setup**

   ```bash
   ./setup.sh
   ```

   This checks prerequisites, copies `.env.example` to `.env`, copies `.mcp.json.example` to `.mcp.json`, and installs dependencies.

3. **Fill your `.env`** — open `.env` and set at minimum `BRAND_NAME`, `BRAND_URL`, `NOTION_API_KEY`, and all 8 `*_DB_ID` values.

4. **Create 8 Notion databases** — follow the schema in [`docs/notion-schema.md`](docs/notion-schema.md). Copy each database's ID from the URL and paste it into `.env`.

5. **Fill the `_context/` stubs** with your brand's actual content:

   ```
   _context/brand-context.example.md         → rename to brand-context.md
   _context/brand-voice-guide.example.md     → rename to brand-voice-guide.md
   _context/brand-style-guide.example.md     → rename to brand-style-guide.md
   _context/product-offerings.example.md     → rename to product-offerings.md
   _context/growth-marketing-context.example.md → rename to growth-marketing-context.md
   _context/platform-reference.example.md    → rename to platform-reference.md
   ```

   Or keep the `.example.md` names and update `.claude/rules/brand-context-loading.md` to point at them — both approaches work.

6. **Open in Claude Code and run**

   ```bash
   claude
   ```

   Then type: `use brand-geo-monitor`

---

## Customizing for your brand

Three places to edit before your first run:

| File | What to change |
|------|---------------|
| `_context/*.example.md` | Fill with your brand's actual voice, positioning, product descriptions, and growth context |
| `.claude/rules/brand-facts.example.md` | Set your brand's legal name, website URL, and standard CTA copy |
| `_context/geo-prompt-universe.md` | Replace the placeholder prompts with queries relevant to your category and brand |

Do not rename variable names in `.env` — agents reference them by exact name.

---

## Repo structure

```
.claude/
  agents/         6 agent definitions (brand-agnostic)
  rules/          4 rule files: brand context loading, output format, brand facts, scoring model
  skills/         6 skill definitions: geo-brand-monitor, website-geo-audit,
                  social-content-writing, content-trends-research, docx, geo-run
_context/         Brand context stubs (fill these with your brand)
_sop/             Standard operating procedures for each agent
docs/             notion-schema.md — database schemas for all 8 Notion DBs
run-engine.js     CDP-based AI engine prompt runner
run-all-engines.js  Runs all engines in sequence
package.json
.env.example      All environment variable definitions
.mcp.json.example MCP server configuration (Notion, nanobanana, Playwright, BigQuery)
```

---

## Using with Claude Code

This project includes a `CLAUDE.md` that gives Claude Code full context on the agent pipeline, schedule, Notion DB IDs, and weekly workflow.

```bash
claude    # Start Claude Code — reads CLAUDE.md automatically
```

Invoke any agent by typing `use <agent-name>` in Claude Code:

```
use brand-geo-monitor              # Weekly AI engine tracking
use geo-intelligence-synthesizer   # Weekly synthesis + content calendar
use research-analyst               # Keyword and competitor research
use content-creator                # Write content from a brief
use content-reviewer               # Review a piece of content
use website-geo-auditor            # Monthly site audit
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](LICENSE)
