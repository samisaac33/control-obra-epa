import { rutaObra } from "@/src/lib/rutas-proyecto"

export type ProyectoSeccionInfo = {
  titulo: string
  segment: string
}

const SECCIONES: { segment: string; titulo: string }[] = [
  { segment: "", titulo: "Inicio" },
  { segment: "mapa", titulo: "Mapa de avance" },
  { segment: "fotos", titulo: "Registro fotográfico" },
  { segment: "maquinaria", titulo: "Maquinaria y transporte" },
  { segment: "emergencia", titulo: "Informe de afectación" },
  { segment: "presupuesto", titulo: "Presupuesto" },
  { segment: "libro-obra", titulo: "Informe de evidencias de obra" },
]

export function seccionDesdePathname(pathname: string, proyectoId: string): ProyectoSeccionInfo {
  const base = rutaObra(proyectoId)
  if (pathname === base || pathname === `${base}/`) {
    return { titulo: "Inicio", segment: "" }
  }

  for (const { segment, titulo } of SECCIONES) {
    if (!segment) continue
    const href = rutaObra(proyectoId, segment)
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return { titulo, segment }
    }
  }

  return { titulo: "Inicio", segment: "" }
}

export const SECCIONES_NAV_INFERIOR_DESASOLVE = [
  { segment: "", titulo: "Inicio", labelCorto: "Inicio" },
  { segment: "mapa", titulo: "Mapa de avance", labelCorto: "Mapa" },
  { segment: "fotos", titulo: "Registro fotográfico", labelCorto: "Fotos" },
  { segment: "maquinaria", titulo: "Maquinaria y transporte", labelCorto: "Maquinaria" },
] as const
