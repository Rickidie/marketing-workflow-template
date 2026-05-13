# Contributing to marketing-workflow-template

Thank you for your interest in contributing. This document covers how to report issues, submit pull requests, and keep the codebase healthy.

---

## Filing issues

Use the GitHub issue templates in `.github/ISSUE_TEMPLATE/`:

- **Bug report** — unexpected behaviour, broken agent workflows, Notion write failures, runner errors
- **Feature request** — new agent ideas, additional AI engine support, new skill workflows

Before opening an issue, search existing issues to avoid duplicates.

---

## Development setup

```bash
git clone https://github.com/Rickidie/marketing-workflow-template.git
cd marketing-workflow-template
./setup.sh
```

Fill `.env` with test values (a personal Notion workspace works fine for local testing). You do not need BigQuery or a real brand to test most of the agent logic.

---

## Branch naming

```
feat/short-description       New feature or agent
fix/short-description        Bug fix
docs/short-description       Documentation-only changes
refactor/short-description   Code restructuring without behaviour change
chore/short-description      Dependency updates, tooling, CI
```

Branch from `main`. Keep branches focused — one concern per PR.

---

## Commit conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(agent): add support for meta AI engine login detection
fix(runner): handle empty response from google-aio gracefully
docs(notion-schema): add missing content_pieces_shipped relation note
refactor(synthesizer): extract keyword scoring into shared helper
chore(deps): update @playwright/test to 1.60.0
```

Format: `type(scope): imperative description`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Scopes: `agent`, `skill`, `runner`, `sop`, `rule`, `notion-schema`, `deps`, or the specific agent name (e.g., `synthesizer`, `monitor`)

---

## Pull request conventions

1. Open a PR against `main`
2. Fill in the PR description: what changed and why
3. Keep PRs small — prefer multiple focused PRs over one large one
4. Link any related issues with `Closes #N`

PRs are reviewed for:
- Correct conventional commit messages
- No hardcoded brand details (see below)
- No breaking changes to Notion property names without a matching schema migration note in `docs/notion-schema.md`
- Agent files remain brand-agnostic

---

## Brand-agnosticism rule (important)

**Agents and skills must never contain hardcoded brand details.**

All brand-specific information lives in `_context/` and `.claude/rules/brand-facts.example.md`. Agents and skills load brand context at runtime using `.claude/rules/brand-context-loading.md`.

PRs that introduce hardcoded brand names, URLs, or positioning copy into agent or skill files will be rejected.

This rule exists so the template stays genuinely reusable. Any brand should be able to fork this repo, fill their `_context/` stubs, and have a working system — without editing agent files.

---

## Notion schema changes

If a PR changes the properties read from or written to a Notion database, you must update `docs/notion-schema.md` in the same PR. Agents that expect a property to exist will fail silently if the schema is out of date.

---

## Adding a new AI engine

The supported engines are defined in `.claude/skills/geo-brand-monitor/SKILL.md` and `run-engine.js`. To add a new engine:

1. Add a navigation entry and engine key in `run-engine.js`
2. Update the `engine` Select options in the GEO Brand Tracking DB schema (`docs/notion-schema.md`)
3. Update the engine list in `.claude/skills/geo-brand-monitor/SKILL.md`
4. Update `.claude/CLAUDE.md` "AI Engines Tracked" section
5. Document any login requirements or rate-limit constraints

Note: do not re-add Grok without an explicit user request and a paid X Premium account (the free tier's 20-prompt/day cap makes a 70-prompt sweep impossible).

---

## Code style

- JavaScript files use CommonJS (`require`/`module.exports`) — match the existing style
- No TypeScript compilation step — keep the runner scripts runnable with plain `node`
- Markdown files use ATX headings (`##`), not Setext
- Agent and skill YAML front matter must include `name` and `description`

---

## Using Claude Code while contributing

Open the repo in Claude Code (`claude` from the repo root). The `CLAUDE.md` gives Claude Code full context on the pipeline, so it can help you trace how an agent uses a skill, find the right Notion property name, or draft a new SOP section.
