#!/usr/bin/env python3
"""Render private evidence locally; never copy raw reports to public assets."""
import json
from pathlib import Path

import pymupdf as fitz


def main():
    output = Path("/tmp/certifyme-private-evidence")
    output.mkdir(parents=True, exist_ok=True)
    summaries = []
    pdfs = sorted(Path("attached_assets").glob("*1791047416*.pdf"))
    for source in pdfs:
        with fitz.open(source) as document:
            text = "\n".join(
                f"\n--- PAGE {number + 1} ---\n{page.get_text()}"
                for number, page in enumerate(document)
            )
            (output / (source.stem + ".txt")).write_text(text)
            first = document[0]
            first.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(
                output / (source.stem + ".png")
            )
            if "SOC_2" in source.name:
                document[5].get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(
                    output / "soc-opinion-page.png"
                )
            summaries.append({
                "file": source.name,
                "pages": document.page_count,
                "text_characters": len(text),
                "first_page": first.get_text()[:12000],
            })
    (output / "summary.json").write_text(json.dumps(summaries, indent=2))
    print(json.dumps(summaries, indent=2))


if __name__ == "__main__":
    main()