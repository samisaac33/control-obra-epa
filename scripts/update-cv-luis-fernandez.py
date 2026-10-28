#!/usr/bin/env python3
"""Actualiza páginas 1-2 del CV y elimina la página 10 (certificados 3-9 se conservan)."""
from __future__ import annotations

import pymupdf as fitz

SRC = "/home/ubuntu/.cursor/projects/workspace/uploads/CV_LUIS_FERNANDEZ_8002.pdf"
TITULO_SENESCYT = "/home/ubuntu/.cursor/projects/workspace/uploads/Titulo_1312746603_7c4b.pdf"
OUT = "/workspace/CV_LUIS_FERNANDEZ_8002_actualizado.pdf"

FONT = "helv"
SIZE_BODY = 9.2
SIZE_HEAD = 11.5
SIZE_CONTACT = 9.8
LEFT = 50
WIDTH = 318


def redact(page: fitz.Page, rect: fitz.Rect) -> None:
    page.add_redact_annot(rect, fill=(1, 1, 1))
    page.apply_redactions()


def replace_text(page: fitz.Page, old: str, new: str, *, width_pad: float = 100) -> None:
    for rect in page.search_for(old):
        redact(page, fitz.Rect(rect.x0 - 1, rect.y0 - 2, rect.x0 + width_pad, rect.y1 + 2))
        page.insert_text((rect.x0, rect.y1 - 1), new, fontname=FONT, fontsize=SIZE_BODY, color=(0, 0, 0))


def bullet_block(page: fitz.Page, y: float, lines: list[str], *, size: float = SIZE_BODY) -> float:
    for line in lines:
        inner = fitz.Rect(LEFT + 14, y, LEFT + WIDTH, y + 160)
        page.insert_text((LEFT + 2, y + 10), "•", fontname=FONT, fontsize=size, color=(0, 0, 0))
        remain = page.insert_textbox(
            inner,
            line,
            fontname=FONT,
            fontsize=size,
            color=(0, 0, 0),
            align=fitz.TEXT_ALIGN_LEFT,
        )
        used = inner.height + remain if remain < 0 else 13
        y += max(abs(used), 11) + 1
    return y


def main() -> None:
    doc = fitz.open(SRC)
    p1 = doc[0]
    p2 = doc[1]

    redact(p1, fitz.Rect(48, 236, 195, 252))
    p1.insert_text((50.4, 248), "EDAD: 32 AÑOS", fontname=FONT, fontsize=10, color=(0, 0, 0))

    for band in (
        fitz.Rect(398, 350, 498, 366),
        fitz.Rect(398, 364, 498, 380),
        fitz.Rect(398, 386, 498, 404),
        fitz.Rect(398, 412, 498, 432),
    ):
        redact(p1, band)
    p1.insert_text(
        (400.5, 364),
        "URBANIZACIÓN LOS ÁLAMOS.",
        fontname=FONT,
        fontsize=SIZE_CONTACT,
        color=(0, 0, 0),
    )
    p1.insert_text(
        (400.5, 378),
        "PORTOVIEJO - MANABÍ",
        fontname=FONT,
        fontsize=SIZE_CONTACT,
        color=(0, 0, 0),
    )
    p1.insert_text(
        (400.5, 400),
        "0983582044",
        fontname=FONT,
        fontsize=SIZE_CONTACT,
        color=(0, 0, 0),
    )
    p1.insert_text(
        (400.5, 422),
        "bletty95@gmail.com",
        fontname=FONT,
        fontsize=SIZE_CONTACT,
        color=(0, 0, 0),
    )

    redact(p1, fitz.Rect(48, 412, 375, 795))

    p1.insert_text(
        (50.4, 398),
        "REGISTRO SENESCYT: 1009-2021-2260987",
        fontname=FONT,
        fontsize=10,
        color=(0, 0, 0),
    )
    y = 428
    p1.insert_text((LEFT, y), "HABILIDADES", fontname=FONT, fontsize=SIZE_HEAD, color=(0, 0, 0))
    y += 16
    y = bullet_block(
        p1,
        y,
        [
            "Diseño, supervisión y control técnico de obras de infraestructura hídrica y desazolve.",
            "Seguimiento de avance físico, maquinaria, presupuesto y documentación contractual (EPA).",
            "Informes técnicos, libro de obra, registro fotográfico georreferenciado y evidencias de campo.",
            "Control de calidad, cumplimiento de plazos y coordinación con contratista y fiscalización.",
            "Coordinación de equipos multidisciplinarios en frentes de obra y oficina técnica.",
        ],
    )
    y += 4
    p1.insert_text((LEFT, y), "TRABAJOS DESEMPEÑADOS:", fontname=FONT, fontsize=SIZE_HEAD, color=(0, 0, 0))
    y += 16
    bullet_block(
        p1,
        y,
        [
            "INGENIERO CIVIL - RESIDENTE DE OBRA Y CONTROL TÉCNICO en el CONTRATO DE "
            "EMERGENCIA EPA MANABÍ N. CTO-2026-EP-0142 (Empresa Pública del Agua - EPA EP). "
            "Desazolve y rehabilitación de canales Poza Honda y compuertas La Estancilla y La Ciénega "
            "(Sistema Trasvase Manabí). Seguimiento de avance, control de equipos y maquinaria, "
            "evidencias georreferenciadas, informes de afectación, presupuesto, libro de obra y "
            "reportes de avance en campo (JULIO, AGOSTO Y SEPTIEMBRE DE 2026).",
        ],
    )

    redact(p2, fitz.Rect(48, 48, 375, 228))
    redact(p2, fitz.Rect(48, 232, 375, 322))

    y2 = 238
    p2.insert_text((LEFT, y2), "HERRAMIENTAS DE TRABAJO", fontname=FONT, fontsize=SIZE_HEAD, color=(0, 0, 0))
    y2 += 16
    bullet_block(
        p2,
        y2,
        [
            "AutoCAD 2D y 3D; Microsoft Office, Project y ETABS.",
            "Topografía, GPS y levantamientos georreferenciados en obra.",
            "Presupuestos, cronogramas, metrados e informes técnicos de obra civil.",
            "Registro fotográfico y documentación digital de avance (evidencias de campo).",
        ],
        size=8.8,
    )

    replace_text(p2, "Ing. Juan Carlos Farfán", "César Solórzano", width_pad=120)
    replace_text(p2, "Teléfono: 0986048870", "Teléfono: 0985154764", width_pad=120)
    replace_text(p2, "Ing. Carlos Pino", "Ing. Eliu Feijoo", width_pad=140)
    replace_text(p2, "Teléfono: 0982874650", "Teléfono: 0990275964", width_pad=140)
    # Si el nombre quedó fuera del área de búsqueda, lo reescribimos en la posición original.
    p2.insert_text(
        (104, 641),
        "Ing. Eliu Feijoo",
        fontname=FONT,
        fontsize=SIZE_BODY,
        color=(0, 0, 0),
    )

    doc.delete_page(9)

    titulo = fitz.open(TITULO_SENESCYT)
    doc.insert_pdf(titulo)
    titulo.close()

    doc.save(OUT, garbage=4, deflate=True)
    final_count = fitz.open(OUT).page_count
    doc.close()
    print(f"Guardado: {OUT} ({final_count} páginas)")


if __name__ == "__main__":
    main()
