import {
  FILAS_EQUIPOS_UTILIZADOS_EPA,
  FILAS_PERSONAL_UTILIZADO_EPA,
  type BloqueLibroObraFrenteEpa,
  type BloqueLibroObraSeverinoEpa,
  type DatosHojaLibroObraEpa,
  type FilaCantidadEpa,
  type FilaHorasEquipoEpa,
} from "@/src/data/libro-obra-formato-epa"
import type { EvidenciaGrupo } from "@/src/lib/evidencias-grupo"
import type { LibroObraLineaRegistro } from "@/src/lib/libro-obra"

function sumCantidad(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null
  return (a ?? 0) + (b ?? 0)
}

function mergeFilasCantidad(base: FilaCantidadEpa[], extra: FilaCantidadEpa[]): FilaCantidadEpa[] {
  return base.map((f) => {
    const o = extra.find((x) => x.etiqueta === f.etiqueta)
    if (!o) return f
    if (f.etiqueta === "RTK" || f.etiqueta === "TOPÓGRAFOS") {
      const m = Math.max(f.cantidad ?? 0, o.cantidad ?? 0)
      return { etiqueta: f.etiqueta, cantidad: m > 0 ? m : null }
    }
    return { etiqueta: f.etiqueta, cantidad: sumCantidad(f.cantidad, o.cantidad) }
  })
}

function mergeHorasEquipos(listas: FilaHorasEquipoEpa[][]): FilaHorasEquipoEpa[] {
  const map = new Map<string, FilaHorasEquipoEpa>()
  for (const lista of listas) {
    for (const f of lista) {
      const prev = map.get(f.equipo)
      if (!prev) {
        map.set(f.equipo, f)
        continue
      }
      if (f.equipo.toLowerCase().includes("volqueta")) {
        map.set(f.equipo, f)
      }
    }
  }
  return [...map.values()]
}

export function combinarDatosHojaLibroObraEpa(
  partes: DatosHojaLibroObraEpa[]
): DatosHojaLibroObraEpa {
  if (partes.length === 0) {
    return {
      equiposUtilizados: FILAS_EQUIPOS_UTILIZADOS_EPA.map((etiqueta) => ({ etiqueta, cantidad: null })),
      personalUtilizado: FILAS_PERSONAL_UTILIZADO_EPA.map((etiqueta) => ({ etiqueta, cantidad: null })),
      trabajosRealizados: "",
      horasEquipos: [],
      visitaProyecto: "",
      novedadesObservaciones: "",
      comunicaciones: "",
      clima: { manana: "", tarde: "", noche: "" },
    }
  }

  let merged = partes[0]!
  for (let i = 1; i < partes.length; i++) {
    const p = partes[i]!
    merged = {
      ...merged,
      equiposUtilizados: mergeFilasCantidad(merged.equiposUtilizados, p.equiposUtilizados),
      personalUtilizado: mergeFilasCantidad(merged.personalUtilizado, p.personalUtilizado),
      horasEquipos: mergeHorasEquipos([merged.horasEquipos, p.horasEquipos]),
      novedadesObservaciones: [merged.novedadesObservaciones, p.novedadesObservaciones]
        .filter(Boolean)
        .join("\n"),
      visitaProyecto: [merged.visitaProyecto, p.visitaProyecto].filter(Boolean).join("\n"),
      trabajosRealizados: [merged.trabajosRealizados, p.trabajosRealizados].filter(Boolean).join("\n\n"),
    }
  }
  return merged
}

export function armarTrabajosConsolidadosDesdeBloques(
  bloques: BloqueLibroObraFrenteEpa[],
  severino: BloqueLibroObraSeverinoEpa | null,
  registroCampo: string
): string {
  const partes: string[] = []
  for (const b of bloques) {
    partes.push(`【${b.titulo} — ${b.residente}】\n${b.trabajosRealizados}`)
  }
  if (severino) {
    partes.push(`【${severino.titulo} — ${severino.residente}】\n${severino.trabajosRealizados}`)
  }
  if (registroCampo.trim()) {
    partes.push(registroCampo)
  }
  return partes.join("\n\n")
}

const PATRON_SEVERINO = /severino|subestaci[oó]n el[eé]ctrica|rub\.?\s*(9|1[0-8])\b/i

export function evidenciasRelacionadasSeverino(evidencias: EvidenciaGrupo[]): EvidenciaGrupo[] {
  return evidencias.filter((g) => {
    const r = g.representante
    const blob = `${r.sector} ${r.actividad_especifica ?? ""} ${r.numero_rubro ?? ""} ${r.descripcion ?? ""}`
    return PATRON_SEVERINO.test(blob)
  })
}

export function lineasRelacionadasSeverino(lineas: LibroObraLineaRegistro[]): LibroObraLineaRegistro[] {
  return lineas.filter((l) => PATRON_SEVERINO.test(l.texto))
}

export function trabajosSeverinoDesdeRegistro(
  lineas: LibroObraLineaRegistro[],
  evidencias: EvidenciaGrupo[]
): string {
  const bullets: string[] = []
  for (const l of lineas) {
    bullets.push(l.texto)
  }
  for (const g of evidencias) {
    const r = g.representante
    const act = r.actividad_especifica?.trim() || r.sector
    bullets.push(act)
  }
  if (bullets.length === 0) return ""
  return bullets.map((b) => `- ${b}`).join("\n")
}
