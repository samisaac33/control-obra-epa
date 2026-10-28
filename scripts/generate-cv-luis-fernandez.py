#!/usr/bin/env python3
"""Genera páginas 1-2 del CV desde cero y combina certificados + título Senescyt."""
from __future__ import annotations

import io
from pathlib import Path

import pymupdf as fitz
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
FUENTES_CV = ROOT / "public" / "infimas" / "fuentes" / "cv"
SRC = FUENTES_CV / "original-certificados.pdf"
TITULO_SENESCYT = FUENTES_CV / "titulo-senescyt.pdf"
OUT = ROOT / "CV_LUIS_FERNANDEZ_8002_actualizado.pdf"
PUBLIC_OUT = ROOT / "public" / "infimas" / "documentos" / "cv-luis-fernandez-guadamud.pdf"
PHOTO_CACHE = ROOT / "public" / "infimas" / "fuentes" / "cv" / "foto.jpg"

FONT_REG = "DejaVuSans"
FONT_BOLD = "DejaVuSans-Bold"
DEJAVU = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
DEJAVU_BOLD = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")


def register_fonts() -> None:
    if FONT_REG not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont(FONT_REG, str(DEJAVU)))
    if FONT_BOLD not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont(FONT_BOLD, str(DEJAVU_BOLD)))


def extract_photo() -> Path:
    doc = fitz.open(SRC)
    page = doc[0]
    imgs = page.get_images()
    if not imgs:
        doc.close()
        raise RuntimeError("No se encontró foto en el CV original")
    xref = imgs[0][0]
    pix = fitz.Pixmap(doc, xref)
    if pix.n - pix.alpha > 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    PHOTO_CACHE.parent.mkdir(parents=True, exist_ok=True)
    pix.save(PHOTO_CACHE)
    doc.close()
    return PHOTO_CACHE


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "name": ParagraphStyle(
            "name",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#1a1a1a"),
            spaceAfter=2,
        ),
        "section": ParagraphStyle(
            "section",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#2d4a6a"),
            spaceBefore=10,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=9.5,
            leading=13,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#222222"),
        ),
        "bodyBold": ParagraphStyle(
            "bodyBold",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#222222"),
        ),
        "contact": ParagraphStyle(
            "contact",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#333333"),
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=9.5,
            leading=13,
            leftIndent=12,
            bulletIndent=0,
            spaceAfter=3,
        ),
    }


def bullet_list(items: list[str], st: dict[str, ParagraphStyle]) -> ListFlowable:
    return ListFlowable(
        [ListItem(Paragraph(text, st["bullet"]), leftIndent=8) for text in items],
        bulletType="bullet",
        start="•",
        bulletFontName=FONT_REG,
        bulletFontSize=9,
        leftIndent=14,
    )


def build_pages_1_2(photo: Path) -> bytes:
    register_fonts()
    st = styles()
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title="CV Luis Alberto Fernández Guadamud",
    )

    photo_img = Image(str(photo), width=32 * mm, height=32 * mm * (579 / 371))
    photo_img.hAlign = "RIGHT"

    header_table = Table(
        [
            [
                Paragraph("LUIS ALBERTO<br/>FERNÁNDEZ GUADAMUD", st["name"]),
                photo_img,
            ]
        ],
        colWidths=[doc.width - 36 * mm, 36 * mm],
    )
    header_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )

    contact_table = Table(
        [
            [Paragraph("<b>Contacto</b>", st["bodyBold"])],
            [Paragraph("Urbanización Los Álamos · Portoviejo, Manabí", st["contact"])],
            [Paragraph("Tel. 0983582044", st["contact"])],
            [Paragraph("contacto@vextu.app", st["contact"])],
        ],
        colWidths=[doc.width],
    )
    contact_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eef2f6")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#c5d0dc")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    story: list = [header_table, Spacer(1, 6), contact_table, Spacer(1, 8)]

    story += [
        Paragraph("Datos personales", st["section"]),
        Paragraph(
            "Cédula: 131274660-3 · Nacionalidad: ecuatoriana · Estado civil: soltero<br/>"
            "Edad: 32 años · Nacimiento: 16 de mayo de 1994",
            st["body"],
        ),
        Paragraph("Formación académica", st["section"]),
        Paragraph(
            "Escuela: Particular «9 de Octubre» · Colegio: Particular «Cruz del Norte»<br/>"
            "Universidad: Universidad Técnica de Manabí<br/>"
            "Título: Ingeniero Civil · Registro Senescyt: 1009-2021-2260987",
            st["body"],
        ),
        Paragraph("Habilidades", st["section"]),
        bullet_list(
            [
                "Diseño, supervisión y control técnico de obras de infraestructura hídrica y desazolve.",
                "Seguimiento de avance físico, maquinaria, presupuesto y documentación contractual (EPA).",
                "Informes técnicos, libro de obra, registro fotográfico georreferenciado y evidencias de campo.",
                "Control de calidad, plazos y coordinación con contratista y fiscalización.",
                "Coordinación de equipos multidisciplinarios en frentes de obra y oficina técnica.",
            ],
            st,
        ),
        Paragraph("Trabajos desempeñados", st["section"]),
        bullet_list(
            [
                "<b>Ingeniero civil — residente de obra y control técnico</b>, Contrato de Emergencia EPA Manabí "
                "N. CTO-2026-EP-0142 (Empresa Pública del Agua — EPA EP). Desazolve y rehabilitación de canales "
                "Poza Honda y compuertas La Estancilla y La Ciénega (Sistema Trasvase Manabí). Seguimiento de "
                "avance, control de equipos y maquinaria, evidencias georreferenciadas, informes de afectación, "
                "presupuesto, libro de obra y reportes de avance en campo "
                "<b>(julio, agosto y septiembre de 2026)</b>.",
            ],
            st,
        ),
        PageBreak(),
        Paragraph("Herramientas de trabajo", st["section"]),
        bullet_list(
            [
                "AutoCAD 2D y 3D; Microsoft Office, Project y ETABS.",
                "Topografía, GPS y levantamientos georreferenciados en obra.",
                "Presupuestos, cronogramas, metrados e informes técnicos de obra civil.",
                "Registro fotográfico y documentación digital de avance (evidencias de campo).",
            ],
            st,
        ),
        Paragraph("Cursos realizados", st["section"]),
        bullet_list(
            [
                "Consultor en sistemas informáticos",
                "Pasaporte tributario básico",
                "Vivienda saludable — enero 2018",
                "1.er Congreso de Ingeniería Civil — noviembre 2018",
                "1.ra Jornada de Ingeniería Estructural «Roberto Aguiar Falconi» — diciembre 2018",
                "Contratación pública de bienes y servicios — noviembre 2021",
            ],
            st,
        ),
        Paragraph("Referencias personales", st["section"]),
        bullet_list(
            [
                "Ing. Aldo Andrade — Tel. 0993128214",
                "César Solórzano — Tel. 0985154764",
                "Ing. Eliu Feijoo — Tel. 0990275964",
            ],
            st,
        ),
    ]

    doc.build(story)
    return buffer.getvalue()


def merge_full_cv(pages_12_pdf: bytes) -> None:
    original = fitz.open(SRC)
    intro = fitz.open(stream=pages_12_pdf, filetype="pdf")
    titulo = fitz.open(TITULO_SENESCYT)

    out = fitz.open()
    out.insert_pdf(intro, from_page=0, to_page=intro.page_count - 1)
    # Páginas 3–9 del CV original (índices 2–8): certificados
    if original.page_count >= 9:
        out.insert_pdf(original, from_page=2, to_page=8)
    titulo_pages = min(2, titulo.page_count)
    out.insert_pdf(titulo, from_page=0, to_page=titulo_pages - 1)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT, garbage=4, deflate=True)
    PUBLIC_OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(PUBLIC_OUT, garbage=4, deflate=True)

    print(f"Guardado: {OUT} ({out.page_count} páginas)")
    print(f"Publicado: {PUBLIC_OUT}")

    intro.close()
    original.close()
    titulo.close()
    out.close()


def main() -> None:
    photo = extract_photo() if not PHOTO_CACHE.exists() else PHOTO_CACHE
    if not photo.exists():
        photo = extract_photo()
    pages_pdf = build_pages_1_2(photo)
    merge_full_cv(pages_pdf)


if __name__ == "__main__":
    main()
