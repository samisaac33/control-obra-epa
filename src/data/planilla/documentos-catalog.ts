import type { DocumentoPlanillaCatalogo, TipoDocumentoPlanilla } from "@/src/data/planilla/types"

export const DOCUMENTOS_PLANILLA_CATALOGO: DocumentoPlanillaCatalogo[] = [
  {
    id: "libro_obra",
    titulo: "Libro de obra (periodo)",
    descripcion:
      "Libro de obra del periodo: una entrada por día (actividades, maquinaria, desalojo) y fotos al cargarlas.",
    estado: "disponible",
    rutaGenerador: "planillas/documentos/libro-obra",
  },
  {
    id: "informe_avance",
    titulo: "Informe de avance físico",
    descripcion:
      "Síntesis de avance vs objetivo de planilla, tramos/abscisas y volumetría del periodo.",
    estado: "disponible",
    rutaGenerador: "planillas/documentos/informe-avance",
  },
  {
    id: "memorando_presentacion",
    titulo: "Memorando de presentación",
    descripcion: "Memorando formal de entrega de planilla a la fiscalización EPA EP.",
    estado: "disponible",
    rutaGenerador: "planillas/documentos/memorando",
  },
  {
    id: "reporte_diario_cge",
    titulo: "Reportes diarios CGE (índice)",
    descripcion: "Listado y descarga de reportes diarios de conciliación dentro del periodo.",
    estado: "disponible",
    rutaGenerador: "planillas/documentos/reportes-diarios",
  },
  {
    id: "auditoria_volumetrica",
    titulo: "Conciliación antiglosa (periodo)",
    descripcion: "Triangulación V₁/V₂/V₃ acumulada para el rango de fechas de la planilla.",
    estado: "disponible",
    rutaGenerador: "planillas/documentos/auditoria",
  },
  {
    id: "maquinaria_consolidado",
    titulo: "Informe consolidado de maquinaria",
    descripcion: "Horas-máquina y equipos imputables al periodo de la planilla.",
    estado: "disponible",
    rutaGenerador: "planillas/documentos/maquinaria-consolidado",
  },
  {
    id: "anexo_fotografico",
    titulo: "Anexo fotográfico",
    descripcion: "Paquete de evidencias georreferenciadas del periodo.",
    estado: "proximamente",
  },
  {
    id: "requerimiento_pago",
    titulo: "Requerimiento de pago / medición",
    descripcion: "Formato de medición vinculado a rubros del presupuesto contractual.",
    estado: "disponible",
    rutaGenerador: "planillas/documentos/requerimiento-pago",
  },
  {
    id: "cronograma_valorado_vigente",
    titulo: "Cronograma valorado de trabajos vigente",
    descripcion:
      "Oferta adjudicada VAE: rubros, precios, totales e inversión por planilla 1 y 2. Incluye PDF firmado contractual.",
    estado: "disponible",
    rutaGenerador: "planillas/documentos/cronograma-valorado-vigente",
  },
]

export function documentoPlanillaPorId(id: TipoDocumentoPlanilla): DocumentoPlanillaCatalogo | undefined {
  return DOCUMENTOS_PLANILLA_CATALOGO.find((d) => d.id === id)
}
