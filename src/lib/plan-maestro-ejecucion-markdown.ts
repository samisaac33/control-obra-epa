import { FLUJO_MATERIAL_DESASOLVE } from "@/src/data/planilla/flujo-material-desasolve"
import {
  diasPlanMaestroEjecucion,
  diaSemanaPlan,
  metadatosPlanMaestro,
  PCT_AVANCE_PLANILLA_1_REF,
  seccionesFijasPlanMaestro,
} from "@/src/data/planilla/plan-maestro-ejecucion-desasolve"
import type { ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"

export function lineasMarkdownPlanMaestro(config: ProyectoPlanillaConfig): string[] {
  const meta = metadatosPlanMaestro(config)
  const [p1, p2] = meta.periodos
  const dias = diasPlanMaestroEjecucion(config)
  const lines: string[] = []

  lines.push("# Plan maestro de ejecución — Emergencia Severino y Trasvase Manabí")
  lines.push("")
  lines.push(`**Resolución:** ${meta.resolucion} · **Proyecto:** ${PROYECTO_DESASOLVE_CANALES}`)
  lines.push(
    `**Inicio plazo:** ${meta.fechaInicioPlazo} · **Fin plazo:** ${meta.fechaFinPlazo} (${meta.plazoDias} días)`
  )
  lines.push(
    `**Anticipo:** ${meta.anticipoPct} % (${meta.fechaAnticipo}) · **Oferta ref.:** USD ${meta.montoOfertaSinIva.toLocaleString("en-US")} sin IVA`
  )
  if (p1 && p2) {
    lines.push(
      `**Planilla 1:** ${p1.fecha_inicio} → ${p1.fecha_fin} (meta **${PCT_AVANCE_PLANILLA_1_REF} %** acumulado)`
    )
    lines.push(`**Planilla 2:** ${p2.fecha_inicio} → ${p2.fecha_fin} (meta **100 %** acumulado)`)
  }
  lines.push("")
  lines.push("---")
  lines.push("")

  for (const sec of seccionesFijasPlanMaestro()) {
    lines.push(`## ${sec.titulo}`)
    lines.push("")
    for (const p of sec.parrafos) lines.push(p)
    lines.push("")
    if (sec.viñetas?.length) {
      for (const v of sec.viñetas) lines.push(`- ${v}`)
      lines.push("")
    }
    lines.push("---")
    lines.push("")
  }

  lines.push("## Cronograma diario (" + meta.plazoDias + " días)")
  lines.push("")
  lines.push(FLUJO_MATERIAL_DESASOLVE.titulo + ": ver sección anterior.")
  lines.push("")

  let semana = 0
  for (const d of dias) {
    const w = Math.floor((d.diaObra - 1) / 7) + 1
    if (w !== semana) {
      semana = w
      lines.push("")
      lines.push("### Semana " + w)
      lines.push("")
    }
    lines.push(
      "#### Día " +
        d.diaObra +
        " — " +
        d.fecha +
        " (" +
        diaSemanaPlan(d.fecha) +
        ") · Planilla " +
        d.planilla
    )
    lines.push("")
    lines.push("**Foco:** " + d.foco)
    lines.push("")
    lines.push("- **Trasvase:** " + d.trasvase.join(" "))
    lines.push("- **San Antonio:** " + d.sanAntonio.join(" "))
    lines.push("- **Severino:** " + d.severino.join(" "))
    lines.push("- **Transversal:** " + d.transversal.join(" "))
    lines.push("")
  }

  return lines
}
