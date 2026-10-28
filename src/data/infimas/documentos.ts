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
]
