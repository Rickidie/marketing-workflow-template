#!/usr/bin/env bash
set -euo pipefail

# marketing-workflow-template — First-time setup
# Usage: ./setup.sh

echo "=== marketing-workflow-template Setup ==="
echo ""

# ---------------------------------------------------------------------------
# Check prerequisites
# ---------------------------------------------------------------------------

# Node.js 20+
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but not found."
  echo "Install Node.js 20+ from https://nodejs.org"
  exit 1
fi

NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Error: Node.js 20+ is required. You have $(node --version)."
  echo "Upgrade at https://nodejs.org"
  exit 1
fi
echo "Node.js $(node --version) — OK"

# npm
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but not found. It ships with Node.js."
  exit 1
fi
echo "npm $(npm --version) — OK"

echo ""

# ---------------------------------------------------------------------------
# Environment file
# ---------------------------------------------------------------------------

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
  echo "  -> Open .env and fill in your values before running any agents."
else
  echo ".env already exists — skipping copy"
fi

# ---------------------------------------------------------------------------
# MCP configuration file
# ---------------------------------------------------------------------------

if [ ! -f .mcp.json ]; then
  cp .mcp.json.example .mcp.json
  echo "Created .mcp.json from .mcp.json.example"
  echo "  -> The MCP config reads credentials from .env automatically."
else
  echo ".mcp.json already exists — skipping copy"
fi

echo ""

# ---------------------------------------------------------------------------
# Install dependencies
# ---------------------------------------------------------------------------

echo "Installing dependencies..."
npm install
echo "Dependencies installed."

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo ""
echo "  1. Edit .env — set at minimum:"
echo "       BRAND_NAME, BRAND_URL, NOTION_API_KEY"
echo "       and all 8 *_DB_ID values"
echo ""
echo "  2. Create 8 Notion databases per docs/notion-schema.md"
echo "       then paste each database ID into .env"
echo ""
echo "  3. Fill _context/ stubs with your brand's content:"
echo "       _context/brand-context.example.md"
echo "       _context/brand-voice-guide.example.md"
echo "       _context/brand-style-guide.example.md"
echo "       _context/product-offerings.example.md"
echo "       _context/growth-marketing-context.example.md"
echo "       _context/platform-reference.example.md"
echo "     Rename each file (drop .example) or update"
echo "     .claude/rules/brand-context-loading.md to use the .example names."
echo ""
echo "  4. Update _context/geo-prompt-universe.md"
echo "       Replace placeholder prompts with queries relevant to your brand."
echo ""
echo "  5. Open in Claude Code:"
echo "       claude"
echo "     Then type: use brand-geo-monitor"
echo ""
echo "  See CLAUDE.md for the full command reference and weekly schedule."
