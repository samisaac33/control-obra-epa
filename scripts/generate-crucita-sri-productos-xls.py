#!/usr/bin/env python3
"""Genera el .xls de carga masiva SRI para Compuerta Leopoldo Cedeño (IC-EPA EP-052-2026)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import xlrd
from xlutils.copy import copy as xl_copy

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TEMPLATE = (
    ROOT / "public/infimas/plantillas/plantilla-carga-masiva-productos-sri.xls"
)
DEFAULT_JSON = ROOT / "data/infimas/crucita-leopoldo-cedeno-productos-sri.json"
DEFAULT_OUT = (
    ROOT
    / "public/infimas/carga-masiva-productos-compuerta-leopoldo-cedeno-ic-epa-ep-052-2026.xls"
)

FIRST_DATA_ROW = 2
MAX_EXAMPLE_ROWS = 8


def load_productos(path: Path) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise SystemExit(f"Se esperaba un arreglo JSON en {path}")
    if not raw:
        raise SystemExit(
            f"Sin productos en {path}. Complete los rubros desde la orden de compra."
        )
    return raw


def row_values(p: dict) -> list:
    return [
        p["codigoPrincipal"],
        p.get("codigoAuxiliar", ""),
        p["descripcion"],
        p.get("informacionAdicional", ""),
        float(p["precioUnitario"]),
        float(p.get("tarifaIva", 4)),
        p.get("gravaIce", "NO"),
        float(p.get("codigoIce", 3000)),
        p.get("turismo", "No"),
    ]


def clear_example_rows(sheet, start_col: int = 0, ncols: int = 9) -> None:
    for r in range(FIRST_DATA_ROW, FIRST_DATA_ROW + MAX_EXAMPLE_ROWS):
        for c in range(start_col, start_col + ncols):
            sheet.write(r, c, "")


def write_workbook(template: Path, productos: list[dict], out: Path) -> None:
    wb = xlrd.open_workbook(str(template), formatting_info=True)
    out_wb = xl_copy(wb)
    sheet = out_wb.get_sheet(0)
    clear_example_rows(sheet)
    for i, prod in enumerate(productos):
        row = FIRST_DATA_ROW + i
        for col, val in enumerate(row_values(prod)):
            sheet.write(row, col, val)
    out.parent.mkdir(parents=True, exist_ok=True)
    out_wb.save(str(out))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--template", type=Path, default=DEFAULT_TEMPLATE)
    parser.add_argument("--json", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    if not args.template.is_file():
        raise SystemExit(f"Falta plantilla: {args.template}")

    productos = load_productos(args.json)
    write_workbook(args.template, productos, args.out)
    total = sum(float(p["precioUnitario"]) for p in productos)
    print(f"OK: {len(productos)} producto(s) → {args.out}")
    print(f"Suma precios unitarios (sin IVA): {total:.2f}")


if __name__ == "__main__":
    try:
        main()
    except SystemExit as e:
        print(e, file=sys.stderr)
        raise