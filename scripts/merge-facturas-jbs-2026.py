#!/usr/bin/env python3
"""Combina la página 1 de las facturas JBS (julio, agosto, septiembre 2026)."""
from __future__ import annotations

from pathlib import Path

import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[1]
FUENTES = ROOT / "public" / "infimas" / "fuentes" / "facturas-jbs-2026"
SOURCES = [
    FUENTES / "julio.pdf",
    FUENTES / "agosto.pdf",
    FUENTES / "septiembre.pdf",
]
OUT = ROOT / "public" / "infimas" / "documentos" / "facturas-jbs-julio-agosto-septiembre-2026.pdf"


def main() -> None:
    out = fitz.open()
    for path in SOURCES:
        if not path.is_file():
            raise FileNotFoundError(path)
        src = fitz.open(path)
        if src.page_count < 1:
            src.close()
            raise ValueError(f"PDF sin páginas: {path}")
        out.insert_pdf(src, from_page=0, to_page=0)
        src.close()

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT, garbage=4, deflate=True)
    print(f"Guardado: {OUT} ({out.page_count} páginas)")
    out.close()


if __name__ == "__main__":
    main()
