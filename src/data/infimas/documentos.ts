export type InfimaDocumentoPersonal = {
  id: string
  titulo: string
  descripcion: string
  archivoPdf: string
  actualizado: string
}

export const DOCUMENTOS_PERSONALES_INFIMAS: InfimaDocumentoPersonal[] = [
  {
    id: "cv-luis-fernandez",
    titulo: "Hoja de vida — Luis Alberto Fernández Guadamud",
    descripcion:
      "CV actualizado (11 páginas): datos de contacto, experiencia EPA Manabí, certificados y registro Senescyt.",
    archivoPdf: "/infimas/documentos/cv-luis-fernandez-guadamud.pdf?v=contacto-vextu-20261028",
    actualizado: "2026-10-28",
  },
  {
    id: "facturas-jbs-2026",
    titulo: "Facturas al consorcio — JBS (julio–septiembre 2026)",
    descripcion:
      "PDF único (3 hojas): facturas 001-100-000000097 (13/07/2026), 098 (05/08/2026) y 099 (29/09/2026).",
    archivoPdf: "/infimas/documentos/facturas-jbs-julio-agosto-septiembre-2026.pdf?v=corregidas-20261028b",
    actualizado: "2026-10-28",
  },
]
