import type { Rubro } from "@/data/presupuesto"
import { presupuestoData } from "@/data/presupuesto"
import { presupuestoDesasolveEmergencia } from "@/src/data/planilla/presupuesto-desasolve-emergencia"
import {
  PROYECTO_DESASOLVE_CANALES,
  PROYECTO_EMERGENCIA_MANABI,
} from "@/src/data/proyectos/catalog"

export function presupuestoRubrosPorProyecto(proyectoId: string): Rubro[] {
  if (proyectoId === PROYECTO_DESASOLVE_CANALES) {
    return presupuestoDesasolveEmergencia
  }
  if (proyectoId === PROYECTO_EMERGENCIA_MANABI) {
    return presupuestoData
  }
  return presupuestoDesasolveEmergencia
}
