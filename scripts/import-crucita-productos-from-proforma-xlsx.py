#!/usr/bin/env python3
"""Importa rubros de la proforma/O/C (xlsx) al JSON de productos SRI."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_XLSX = ROOT / "data/infimas/fuentes/crucita-leopoldo-cedeno-proforma-ic-epa-ep-052-2026.xlsx"
DEFAULT_JSON = ROOT / "data/infimas/crucita-leopoldo-cedeno-productos-sri.json"
ORDEN_COMPRA = "IC-EPA EP-052-2026"


def import_productos(xlsx: Path) -> list[dict]:
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    ws = wb.active
    productos: list[dict] = []
    for r in range(2, ws.max_row + 1):
        no = ws.cell(r, 1).value
        if no is None or not isinstance(no, (int, float)):
            continue
        item = int(no)
        cpc = ws.cell(r, 2).value
        cpc_s = str(int(cpc)) if isinstance(cpc, (int, float)) else str(cpc).strip()
        desc = str(ws.cell(r, 3).value).strip()
        unidad = str(ws.cell(r, 4).value).strip()
        cant = ws.cell(r, 5).value
        cant_label = int(cant) if isinstance(cant, (int, float)) and float(cant).is_integer() else cant
        precio = float(ws.cell(r, 6).value)
        productos.append(
            {
                "codigoPrincipal": f"EP052-{item:03d}",
                "codigoAuxiliar": cpc_s,
                "descripcion": desc,
                "informacionAdicional": f"{unidad} · Cant. {cant_label} · O/C {ORDEN_COMPRA}",
                "precioUnitario": precio,
                "tarifaIva": 4,
                "gravaIce": "NO",
                "codigoIce": 3000,
                "turismo": "No",
            }
        )
    return productos


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("xlsx", type=Path, nargs="?", default=DEFAULT_XLSX)
    parser.add_argument("--json", type=Path, default=DEFAULT_JSON)
    args = parser.parse_args()
    if not args.xlsx.is_file():
        raise SystemExit(f"No existe la proforma: {args.xlsx}")
    productos = import_productos(args.xlsx)
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_text(json.dumps(productos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Importados {len(productos)} productos → {args.json}")


if __name__ == "__main__":
    main()