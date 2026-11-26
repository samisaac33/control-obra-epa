#!/usr/bin/env python3
"""Extrae texto de la O/C Crucita (PDF) para facilitar el volcado de rubros CPC."""

from __future__ import annotations

import argparse
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "data/infimas/crucita-oc-052-2026-texto-extraido.txt"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path, help="Ruta al PDF de la orden de compra")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    if not args.pdf.is_file():
        raise SystemExit(f"No existe: {args.pdf}")

    doc = pymupdf.open(args.pdf)
    parts: list[str] = []
    for i, page in enumerate(doc):
        text = page.get_text().strip()
        if text:
            parts.append(f"--- Página {i + 1} ---\n{text}")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text("\n\n".join(parts) + "\n", encoding="utf-8")
    print(f"Texto extraído ({doc.page_count} pág.) → {args.out}")


if __name__ == "__main__":
    main()