# Build DOCX Deliverable
1. Draft in markdown with proper \mathrm{} LaTeX
2. Convert: pandoc input.md -o output.docx --pdf-engine=xelatex
3. Verify: no em-dashes (grep '—'), target page count via Word/PDF check
4. Delete intermediate .md unless user asked to keep
