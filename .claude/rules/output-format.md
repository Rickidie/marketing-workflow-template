# Rule: Output Format and Placement

## Format

All deliverables in this workspace are `.docx` by default — not `.md`, not inline text.

| Output type | Format |
|---|---|
| Blog posts | `.docx` |
| Social posts (LinkedIn, X, captions, video descriptions, event recaps) | `.docx` |
| Reports (GEO weekly, performance, analytical) | `.docx` |
| Research notes | `.docx` |
| Internal scratch / context loaded by agents | `.md` allowed |

Exception: when explicitly told to produce `.md` for a one-off (e.g. README, agent definition), do so.

## Folder placement

| Output type | Folder |
|---|---|
| Blog posts and blog images | `content/blog/` |
| Social posts and social images | `content/social/` |
| Other written content (emails, web copy) | `content/` |
| Geo-localised materials | `geo/` |
| Reports and performance analyses | `reports/` |
| Research documents | `research/` |

Never create files in the root directory. Never overwrite a brief without verifying disk state first — agents must Read a file from disk before writing the Notion row that references it.

## File naming

```
content/blog/[YYYY-MM-DD]-[slug].docx
content/blog/[YYYY-MM-DD]-[slug]-image.png
content/social/[YYYY-MM-DD]-[topic-slug]-linkedin.docx
content/social/[YYYY-MM-DD]-[topic-slug]-x.docx
content/social/[YYYY-MM-DD]-[topic-slug]-image.png
reports/[YYYY-MM-DD]-[report-name].docx
```

Slug rules: lowercase, hyphens, no special characters.
