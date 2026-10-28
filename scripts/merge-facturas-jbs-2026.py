#!/usr/bin/env python3
"""Combina la página 1 de las facturas JBS (julio, agosto, septiembre 2026)."""
from __future__ import annotations

from pathlib import Path

import pymupdf as fitz

SOURCES = [
    Path("/home/ubuntu/.cursor/projects/workspace/uploads/Factura_Julio_JBS_42e7.pdf"),
    Path("/home/ubuntu/.cursor/projects/workspace/uploads/Factura_agosto_JBS_36dc.pdf"),
    Path("/home/ubuntu/.cursor/projects/workspace/uploads/Factura_septiembre_JBS_ee41.pdf"),
]
OUT = Path("/workspace/public/infimas/documentos/facturas-jbs-julio-agosto-septiembre-2026.pdf")


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
