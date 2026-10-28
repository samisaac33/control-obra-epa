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
    archivoPdf: "/infimas/documentos/cv-luis-fernandez-guadamud.pdf",
    actualizado: "2026-10-28",
  },
  {
    id: "facturas-jbs-2026",
    titulo: "Facturas al consorcio — JBS (julio–septiembre 2026)",
    descripcion:
      "PDF único con la primera hoja de cada factura: página 1 julio, página 2 agosto, página 3 septiembre.",
    archivoPdf: "/infimas/documentos/facturas-jbs-julio-agosto-septiembre-2026.pdf",
    actualizado: "2026-10-28",
  },
]
