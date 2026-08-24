#!/usr/bin/env python3
"""Render the Save4Dream cost & pricing proposal (Hebrew, RTL) to PDF."""
from pathlib import Path
from weasyprint import HTML

here = Path(__file__).parent
html_file = here / "proposal_he.html"
out_file = here / "Save4Dream_הצעת_מחיר_ותכנית.pdf"

HTML(filename=str(html_file)).write_pdf(str(out_file))
print(f"Wrote {out_file} ({out_file.stat().st_size} bytes)")
