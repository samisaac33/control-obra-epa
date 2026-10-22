import type { SupabaseClient } from "@supabase/supabase-js"

import { contextoDocumentalDesasolve } from "@/src/data/desasolve/contexto-obra"
import { getProyecto } from "@/src/data/proyectos/catalog"
import type { MapaAsistentePerfil } from "@/src/lib/mapa-asistente-auth"
import { tramosMapaDesasolveSinExcluidos } from "@/src/data/tramos/tramos-excluidos"
import type { CanalTramo } from "@/src/data/tramos/types"
import { cargarTramosMapaProyecto } from "@/src/lib/cargar-tramos-mapa-proyecto"
import {
  detectarIntencionFechaConsulta,
  etiquetaZonaHorariaAsistente,
  fechaCalendarioDesdeIso,
  fechaCalendarioEcuador,
  fechasEnRango,
  type IntencionFechaConsulta,
} from "@/src/lib/mapa-asistente-fechas"
import {
  agruparJornadasPorFecha,
  detalleJornadasDia,
  formatearDetalleJornadasDia,
  formatearMetrosDesasolveResumen,
  kpisMaquinariaDesasolve,
  type DetalleJornadasDia,
} from "@/src/lib/maquinaria-desasolve-resumen"
import {
  cargarJornadasMaquinariaProyecto,
  periodoDesdeJornadas,
} from "@/src/lib/maquinaria-desasolve-proyecto"
import { cargarEquiposMaquinariaProyecto } from "@/src/lib/proyecto-equipos-maquinaria"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import {
  avanceDesasolveTramo,
  calcularKpisTramos,
  estadoOperativoMapa,
} from "@/src/lib/tramos-avance"
import { etiquetaEstadoTramo } from "@/src/data/tramos/types"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

const MAX_CARACTERES_CONTEXTO_OPERATIVO = 10_000
const MAX_CARACTERES_CONTEXTO_VISITANTE = 4_000
const MAX_LINEAS_PUNTOS_GPS = 25

function contextoIntroVisitante(proyectoId: string): string {
  const proyecto = getProyecto(proyectoId)
  return [
    "### Consulta visitante (solo lectura)",
    `Obra: ${proyecto.nombreObra}`,
    `Sistema: ${proyecto.sistema}`,
    "Leyenda mapa: pendiente (violeta), en ejecución (naranja), terminado (verde).",
    "Los KPIs y maquinaria provienen del mismo registro público del mapa.",
  ].join("\n")
}

function formatearMaquinariaBreveVisitante(detalle: DetalleJornadasDia): string {
  const tramos =
    detalle.porTramo.length > 0
      ? detalle.porTramo.map((t) => `tramo ${t.tramo_codigo}`).join(", ")
      : "ninguno"
  return [
    `Fecha ${detalle.fecha}:`,
    `- Equipos distintos: ${detalle.equiposDistintos}`,
    `- Horas: ${formatearNumero(detalle.totalHoras, 1)} h`,
    `- Metros: ${formatearMetrosDesasolveResumen(detalle.totalMetros)}`,
    `- Tramos intervenidos: ${tramos}`,
  ].join("\n")
}

function recortarTexto(texto: string, max: number): string {
  if (texto.length <= max) return texto
  return `${texto.slice(0, max - 48).trimEnd()}\n\n[… datos operativos recortados por límite …]`
}

function resumenTramoLinea(tramo: CanalTramo, puntos: TramoPuntoAvance[]): string {
  const { metrosEjecutados, metrosTotales, avancePct } = avanceDesasolveTramo(tramo, puntos)
  const estado = estadoOperativoMapa(tramo, puntos)
  const sem = tramo.semana_programada ? ` sem=${tramo.semana_programada}` : ""
  const maq = tramo.maquinaria_asignada ? ` maq=${tramo.maquinaria_asignada}` : ""
  const obs = tramo.observaciones?.trim()
    ? ` obs=${tramo.observaciones.trim().slice(0, 80)}`
    : ""
  return `tramo ${tramo.codigo} | ${tramo.canal} | ${etiquetaEstadoTramo(estado)} | ${formatearNumero(metrosEjecutados, 0)}/${formatearNumero(metrosTotales, 0)} m (${formatearNumero(avancePct, 1)}%)${sem}${maq}${obs}`
}

function puntosGpsPorFechas(
  puntos: TramoPuntoAvance[],
  tramoPorId: Map<string, CanalTramo>,
  fechas: Set<string>
): string[] {
  const lineas: string[] = []
  for (const p of puntos) {
    const f = fechaCalendarioDesdeIso(p.created_at)
    if (!fechas.has(f)) continue
    const tramo = tramoPorId.get(p.tramo_id)
    const codigo = tramo?.codigo ?? p.tramo_id
    const canal = tramo?.canal ?? "—"
    lineas.push(
      `- ${f}: tramo ${codigo} (${canal}), abscisa ${formatearNumero(p.abscisa_m, 1)} m, lat ${formatearNumero(p.lat, 6)}, lng ${formatearNumero(p.lng, 6)}`
    )
  }
  return lineas.sort()
}

function fechasObjetivo(intencion: IntencionFechaConsulta, ahora: Date): Set<string> {
  if (intencion.tipo === "dia") return new Set(intencion.fechas)
  if (intencion.tipo === "rango") return new Set(fechasEnRango(intencion.desde, intencion.hasta))
  const hasta = fechaCalendarioEcuador(ahora, 0)
  const desde = fechaCalendarioEcuador(ahora, -6)
  return new Set(fechasEnRango(desde, hasta))
}

function bloqueResumenUltimosDias(
  jornadas: Awaited<ReturnType<typeof cargarJornadasMaquinariaProyecto>>,
  fechas: Set<string>
): string {
  const agrupado = agruparJornadasPorFecha(jornadas).filter((g) => fechas.has(g.fecha))
  if (agrupado.length === 0) {
    return "Sin jornadas de maquinaria en el rango reciente consultado."
  }
  const lineas = ["Resumen diario (maquinaria, jornadas operativas):"]
  for (const { fecha, jornadas: delDia } of agrupado) {
    const k = kpisMaquinariaDesasolve(delDia)
    lineas.push(
      `- ${fecha}: ${k.totalJornadas} jornada(s), ${formatearNumero(k.totalHoras, 1)} h, ${formatearMetrosDesasolveResumen(k.totalMetros)}, ${k.tramosConJornada} tramo(s)`
    )
  }
  return lineas.join("\n")
}

export async function construirContextoAsistenteDesasolve(
  supabase: SupabaseClient,
  proyectoId: string,
  ultimoTextoUsuario: string,
  options?: {
    ahora?: Date
    perfil?: MapaAsistentePerfil
  }
): Promise<string> {
  const ahora = options?.ahora ?? new Date()
  const perfil = options?.perfil ?? "residente"
  const esVisitante = perfil === "visitante"
  const intencion = detectarIntencionFechaConsulta(ultimoTextoUsuario, ahora)
  const fechas = fechasObjetivo(intencion, ahora)

  const tramosMapa = await cargarTramosMapaProyecto(supabase, proyectoId)
  const { tramos, puntosAvance } = tramosMapa
  const [jornadas, equipos] = await Promise.all([
    cargarJornadasMaquinariaProyecto(supabase, proyectoId, tramosMapa),
    cargarEquiposMaquinariaProyecto(supabase, proyectoId, { soloActivos: false }),
  ])

  const tramosVisibles = tramosMapaDesasolveSinExcluidos(tramos)
  const tramoPorId = new Map(tramosVisibles.map((t) => [t.id, t]))
  const kpisMapa = calcularKpisTramos(tramosVisibles, puntosAvance)
  const kpisMaq = kpisMaquinariaDesasolve(jornadas)
  const periodoMaq = periodoDesdeJornadas(jornadas)

  const tramoIdsActivos = new Set(
    jornadas.filter((j) => fechas.has(j.fecha) && !j.es_incidencia).map((j) => j.tramo_id)
  )

  const lineasTramos: string[] = []
  const soloTramosConActividad =
    intencion.tipo === "dia" ||
    ((intencion.tipo === "rango" || intencion.tipo === "reciente") && tramoIdsActivos.size > 0)

  for (const tramo of tramosVisibles) {
    if (soloTramosConActividad && !tramoIdsActivos.has(tramo.id)) continue
    lineasTramos.push(resumenTramoLinea(tramo, puntosAvance))
  }

  if (lineasTramos.length === 0 && intencion.tipo !== "dia") {
    for (const tramo of tramosVisibles) {
      lineasTramos.push(resumenTramoLinea(tramo, puntosAvance))
    }
  }

  const partes: string[] = esVisitante
    ? [contextoIntroVisitante(proyectoId), ""]
    : [contextoDocumentalDesasolve(), ""]

  partes.push(
    "### Datos operativos (snapshot al momento de la consulta)",
    `Zona horaria de fechas: ${etiquetaZonaHorariaAsistente()}`,
    `Interpretación temporal de la pregunta: ${JSON.stringify(intencion)}`,
    "",
    "#### KPIs mapa (tramos visibles en app)",
    `- Tramos: ${kpisMapa.totalTramos}`,
    `- Km totales: ${formatearNumero(kpisMapa.kmTotales, 2)} km`,
    `- Km ejecutados (GPS/minitramos cuando aplica): ${formatearNumero(kpisMapa.kmEjecutados, 2)} km`,
    `- Avance global: ${formatearNumero(kpisMapa.avanceGlobalPct, 1)} %`,
    `- Por estado operativo: pendiente ${kpisMapa.tramosPorEstado.pendiente}, en ejecución ${kpisMapa.tramosPorEstado.en_ejecucion}, terminado ${kpisMapa.tramosPorEstado.terminado}`,
    "",
    "#### KPIs maquinaria (histórico completo en BD)",
    `- Periodo con registros: ${periodoMaq.etiqueta}`,
    `- Jornadas operativas: ${kpisMaq.totalJornadas}`,
    `- Horas registradas: ${formatearNumero(kpisMaq.totalHoras, 1)} h`,
    `- Metros desasolados: ${formatearMetrosDesasolveResumen(kpisMaq.totalMetros)}`,
    `- Tramos con al menos una jornada: ${kpisMaq.tramosConJornada}`,
    `- Incidencias: ${kpisMaq.totalIncidencias}`
  )

  if (!esVisitante) {
    partes.push("", "#### Tramos (mapa)", ...lineasTramos.map((l) => `- ${l}`))
  }

  if (intencion.tipo === "dia") {
    const detalle = detalleJornadasDia(intencion.fechas[0], jornadas, equipos)
    partes.push(
      "",
      "#### Maquinaria — día solicitado",
      esVisitante ? formatearMaquinariaBreveVisitante(detalle) : formatearDetalleJornadasDia(detalle)
    )
  } else if (intencion.tipo === "rango") {
    partes.push("", "#### Maquinaria — rango de fechas", bloqueResumenUltimosDias(jornadas, fechas))
    if (!esVisitante) {
      for (const f of [...fechas].sort()) {
        const detalle = detalleJornadasDia(f, jornadas, equipos)
        if (detalle.lineasJornada.length === 0 && detalle.incidencias === 0) continue
        partes.push("", formatearDetalleJornadasDia(detalle))
      }
    }
  } else {
    partes.push("", "#### Maquinaria — últimos 7 días", bloqueResumenUltimosDias(jornadas, fechas))
  }

  if (!esVisitante) {
    const puntosLineas = puntosGpsPorFechas(puntosAvance, tramoPorId, fechas)
    const puntosMostrar =
      puntosLineas.length > MAX_LINEAS_PUNTOS_GPS
        ? [
            ...puntosLineas.slice(0, MAX_LINEAS_PUNTOS_GPS),
            `… y ${puntosLineas.length - MAX_LINEAS_PUNTOS_GPS} punto(s) más (ver mapa).`,
          ]
        : puntosLineas
    partes.push(
      "",
      "#### Puntos GPS confirmados en fechas relevantes",
      puntosMostrar.length > 0
        ? puntosMostrar.join("\n")
        : "Ningún punto GPS confirmado en esas fechas (según created_at en zona Ecuador)."
    )
  }

  partes.push(
    "",
    esVisitante
      ? "Instrucción interna: responda en forma breve; solo cifras presentes arriba."
      : "Instrucción interna: responda solo con cifras y tramos presentes arriba; si falta un dato, indíquelo."
  )

  const maxChars = esVisitante ? MAX_CARACTERES_CONTEXTO_VISITANTE : MAX_CARACTERES_CONTEXTO_OPERATIVO
  return recortarTexto(partes.join("\n"), maxChars)
}
