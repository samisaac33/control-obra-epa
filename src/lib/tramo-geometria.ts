import {
  etiquetaEstadoTramo,
  type CanalTramo,
  type EstadoTramo,
  type GeoJsonLineString,
  type OrigenExtremoTramo,
} from "@/src/data/tramos/types"
import { longitudDesdeGeometria, sincronizarAvanceDesdeMetros } from "@/src/lib/tramos-avance"

const EARTH_RADIUS_M = 6_371_000
export const DISTANCIA_MAX_DETECCION_M = 25
export const TOLERANCIA_CONTINUACION_M = 5

export function abscisaLogicaDesdeNatural(tramo: CanalTramo, abscisaNatural: number): number {
  if (tramo.origen_extremo === "geometria_fin") {
    return Math.max(0, Math.min(tramo.longitud_m, tramo.longitud_m - abscisaNatural))
  }
  return Math.max(0, Math.min(tramo.longitud_m, abscisaNatural))
}

export function abscisaNaturalDesdeLogica(tramo: CanalTramo, abscisaLogica: number): number {
  const log = Math.max(0, Math.min(tramo.longitud_m, abscisaLogica))
  if (tramo.origen_extremo === "geometria_fin") {
    return tramo.longitud_m - log
  }
  return log
}

export function abscisaNaturalExtremoInicio(tramo: CanalTramo): number {
  return tramo.origen_extremo === "geometria_fin" ? tramo.longitud_m : 0
}

export function extremoInicioCoord(tramo: CanalTramo): { lat: number; lng: number } {
  const coords = tramo.geometria.coordinates
  if (coords.length === 0) return { lat: 0, lng: 0 }
  if (tramo.origen_extremo === "geometria_fin") {
    const [lng, lat] = coords[coords.length - 1]
    return { lat, lng }
  }
  const [lng, lat] = coords[0]
  return { lat, lng }
}

export function extremoFinCoord(tramo: CanalTramo): { lat: number; lng: number } {
  const coords = tramo.geometria.coordinates
  if (coords.length === 0) return { lat: 0, lng: 0 }
  if (tramo.origen_extremo === "geometria_fin") {
    const [lng, lat] = coords[0]
    return { lat, lng }
  }
  const [lng, lat] = coords[coords.length - 1]
  return { lat, lng }
}

export function etiquetaOrigenExtremo(extremo: OrigenExtremoTramo): string {
  return extremo === "geometria_inicio"
    ? "Extremo inicial del KMZ"
    : "Extremo final del KMZ"
}

export function tramoRequiereConfigurarOrigen(
  tramo: CanalTramo,
  puntos: TramoPuntoAvance[]
): boolean {
  return puntosOrdenadosTramo(puntos, tramo.id).length === 0 && !tramo.origen_extremo
}

export function tramoListoParaMarcar(tramo: CanalTramo, puntos: TramoPuntoAvance[]): boolean {
  return puntosOrdenadosTramo(puntos, tramo.id).length >= 1
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

export function distanciaHaversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function aMetrosLocales(lat: number, lng: number, lat0: number, lng0: number): { x: number; y: number } {
  const cosLat = Math.cos(toRad(lat0))
  return {
    x: toRad(lng - lng0) * cosLat * EARTH_RADIUS_M,
    y: toRad(lat - lat0) * EARTH_RADIUS_M,
  }
}

function desdeMetrosLocales(x: number, y: number, lat0: number, lng0: number): { lat: number; lng: number } {
  const cosLat = Math.cos(toRad(lat0))
  const lat = lat0 + toDeg(y / EARTH_RADIUS_M)
  const lng = lng0 + toDeg(x / (EARTH_RADIUS_M * cosLat))
  return { lat, lng }
}

export type PuntoProyectado = {
  abscisa_m: number
  distancia_m: number
  lat: number
  lng: number
}

export function proyectarPuntoEnLinea(
  lat: number,
  lng: number,
  geometria: GeoJsonLineString
): PuntoProyectado | null {
  const coords = geometria.coordinates
  if (coords.length < 2) return null

  let mejor: PuntoProyectado | null = null
  let abscisaAcumulada = 0

  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1]
    const [lng2, lat2] = coords[i]
    const segmentoM = distanciaHaversineM(lat1, lng1, lat2, lng2)

    const origen = aMetrosLocales(lat1, lng1, lat1, lng1)
    const fin = aMetrosLocales(lat2, lng2, lat1, lng1)
    const punto = aMetrosLocales(lat, lng, lat1, lng1)

    const dx = fin.x - origen.x
    const dy = fin.y - origen.y
    const lenSq = dx * dx + dy * dy

    let t = 0
    let distancia_m = distanciaHaversineM(lat, lng, lat1, lng1)
    let latProy = lat1
    let lngProy = lng1

    if (lenSq > 0) {
      t = Math.max(0, Math.min(1, (punto.x * dx + punto.y * dy) / lenSq))
      const projX = t * dx
      const projY = t * dy
      distancia_m = Math.hypot(punto.x - projX, punto.y - projY)
      const proyectado = desdeMetrosLocales(projX, projY, lat1, lng1)
      latProy = proyectado.lat
      lngProy = proyectado.lng
    }

    const abscisa_m = abscisaAcumulada + t * segmentoM

    if (!mejor || distancia_m < mejor.distancia_m) {
      mejor = { abscisa_m, distancia_m, lat: latProy, lng: lngProy }
    }

    abscisaAcumulada += segmentoM
  }

  return mejor
}

export function coordenadaDesdeAbscisa(
  geometria: GeoJsonLineString,
  abscisa_m: number
): { lat: number; lng: number } | null {
  const coords = geometria.coordinates
  if (coords.length < 2) return null

  const objetivo = Math.max(0, abscisa_m)
  let abscisaAcumulada = 0

  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1]
    const [lng2, lat2] = coords[i]
    const segmentoM = distanciaHaversineM(lat1, lng1, lat2, lng2)

    if (objetivo <= abscisaAcumulada + segmentoM || i === coords.length - 1) {
      const restante = Math.max(0, objetivo - abscisaAcumulada)
      const t = segmentoM > 0 ? Math.min(1, restante / segmentoM) : 0
      const origen = aMetrosLocales(lat1, lng1, lat1, lng1)
      const fin = aMetrosLocales(lat2, lng2, lat1, lng1)
      const dx = fin.x - origen.x
      const dy = fin.y - origen.y
      const proyectado = desdeMetrosLocales(t * dx, t * dy, lat1, lng1)
      return { lat: proyectado.lat, lng: proyectado.lng }
    }

    abscisaAcumulada += segmentoM
  }

  const [lngFinal, latFinal] = coords[coords.length - 1]
  return { lat: latFinal, lng: lngFinal }
}

function localizarCoordenadasEnAbscisa(
  geometria: GeoJsonLineString,
  abscisa_m: number
): { coordsHasta: [number, number][]; coordsDesde: [number, number][] } | null {
  const coords = geometria.coordinates
  if (coords.length < 2) return null

  const objetivo = Math.max(0, abscisa_m)
  let abscisaAcumulada = 0

  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1]
    const [lng2, lat2] = coords[i]
    const segmentoM = distanciaHaversineM(lat1, lng1, lat2, lng2)

    if (objetivo <= abscisaAcumulada + segmentoM || i === coords.length - 1) {
      const restante = Math.max(0, objetivo - abscisaAcumulada)
      const t = segmentoM > 0 ? Math.min(1, restante / segmentoM) : 0
      const origen = aMetrosLocales(lat1, lng1, lat1, lng1)
      const fin = aMetrosLocales(lat2, lng2, lat1, lng1)
      const dx = fin.x - origen.x
      const dy = fin.y - origen.y
      const proyectado = desdeMetrosLocales(t * dx, t * dy, lat1, lng1)
      const puntoCorte: [number, number] = [proyectado.lng, proyectado.lat]

      const coordsHasta = [...coords.slice(0, i), puntoCorte]
      const coordsDesde = [puntoCorte, ...coords.slice(i)]

      if (coordsHasta.length < 2 || coordsDesde.length < 2) return null
      return { coordsHasta, coordsDesde }
    }

    abscisaAcumulada += segmentoM
  }

  return null
}

export function geometriaHastaAbscisa(
  geometria: GeoJsonLineString,
  abscisa_m: number
): GeoJsonLineString | null {
  if (abscisa_m <= 0) return null

  const split = localizarCoordenadasEnAbscisa(geometria, abscisa_m)
  if (!split) return null

  return { type: "LineString", coordinates: split.coordsHasta }
}

export function geometriaDesdeAbscisa(
  geometria: GeoJsonLineString,
  abscisa_m: number
): GeoJsonLineString | null {
  if (abscisa_m <= 0) {
    return geometria.coordinates.length >= 2 ? geometria : null
  }

  const split = localizarCoordenadasEnAbscisa(geometria, abscisa_m)
  if (!split) return null

  return { type: "LineString", coordinates: split.coordsDesde }
}

export function geometriaEntreAbscisas(
  geometria: GeoJsonLineString,
  abscisaA: number,
  abscisaB: number
): GeoJsonLineString | null {
  const inicio = Math.min(abscisaA, abscisaB)
  const fin = Math.max(abscisaA, abscisaB)
  if (fin <= inicio + 0.01) return null

  const hastaFin = geometriaHastaAbscisa(geometria, fin)
  if (!hastaFin) return null
  if (inicio <= 0.01) return hastaFin

  return geometriaDesdeAbscisa(hastaFin, inicio)
}

export type IntervaloAbscisa = [number, number]

export function unirIntervalos(intervalos: IntervaloAbscisa[]): IntervaloAbscisa[] {
  if (intervalos.length === 0) return []

  const ordenados = [...intervalos].sort((a, b) => a[0] - b[0])
  const unidos: IntervaloAbscisa[] = [ordenados[0]]

  for (let i = 1; i < ordenados.length; i++) {
    const ultimo = unidos[unidos.length - 1]
    const actual = ordenados[i]
    if (actual[0] <= ultimo[1] + 0.01) {
      ultimo[1] = Math.max(ultimo[1], actual[1])
    } else {
      unidos.push(actual)
    }
  }

  return unidos
}

export function intervalosDesdePuntos(
  puntos: TramoPuntoAvance[],
  tramoId?: string
): IntervaloAbscisa[] {
  if (!tramoId) {
    const tramoIds = [
      ...new Set(puntos.filter((p) => p.confirmado).map((p) => p.tramo_id)),
    ]
    return unirIntervalos(tramoIds.flatMap((id) => intervalosDesdePuntos(puntos, id)))
  }

  return minitramosDesdePuntos(puntos, tramoId).map((mt) => {
    const inicio = Math.min(mt.puntoInicio.abscisa_m, mt.puntoFin.abscisa_m)
    const fin = Math.max(mt.puntoInicio.abscisa_m, mt.puntoFin.abscisa_m)
    return [inicio, fin] as IntervaloAbscisa
  })
}

export function metrosDesdeIntervalos(
  intervalos: IntervaloAbscisa[],
  longitud_m: number
): number {
  const total = intervalos.reduce((sum, [inicio, fin]) => sum + Math.max(0, fin - inicio), 0)
  return Math.min(longitud_m, total)
}

export type SegmentoVisualTramo = {
  tramo: CanalTramo
  tipo: "minitramo" | "pendiente"
  geometria: GeoJsonLineString
  estadoSegmento?: EstadoTramo
  longitud_m: number
  letraInicio?: string
  letraFin?: string
}

export type InfoSegmentoMapa = {
  titulo: string
  estadoLabel: string
  longitudTexto: string
  longitud_m: number
  esMinitramo: boolean
  etiquetaMinitramo: string | null
  canal: string
}

export function formatLongitudSegmentoMapa(metros: number): string {
  if (metros >= 1000) return `${(metros / 1000).toFixed(2)} km`
  return `${metros.toFixed(0)} m`
}

export function infoSegmentoMapa(segmento: SegmentoVisualTramo): InfoSegmentoMapa {
  const esMinitramo = segmento.tipo === "minitramo"
  const estado =
    segmento.estadoSegmento ?? (esMinitramo ? "en_ejecucion" : segmento.tramo.estado)
  const etiquetaMinitramo =
    esMinitramo && segmento.letraInicio && segmento.letraFin
      ? `${etiquetaLetra(segmento.letraInicio)}–${etiquetaLetra(segmento.letraFin)}`
      : null

  return {
    titulo: segmento.tramo.codigo,
    estadoLabel: etiquetaEstadoTramo(estado),
    longitud_m: segmento.longitud_m,
    longitudTexto: formatLongitudSegmentoMapa(segmento.longitud_m),
    esMinitramo,
    etiquetaMinitramo,
    canal: segmento.tramo.canal,
  }
}

function escapeHtmlTexto(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function htmlTooltipVisitanteSegmento(segmento: SegmentoVisualTramo): string {
  const info = infoSegmentoMapa(segmento)
  const minitramoLine = info.etiquetaMinitramo
    ? `<p class="mapa-segmento-tooltip__row"><span class="mapa-segmento-tooltip__label">Minitramo</span> ${escapeHtmlTexto(info.etiquetaMinitramo)}</p>`
    : ""
  return `<div class="mapa-segmento-tooltip__inner">
    <p class="mapa-segmento-tooltip__title">${escapeHtmlTexto(info.titulo)}</p>
    ${minitramoLine}
    <p class="mapa-segmento-tooltip__row"><span class="mapa-segmento-tooltip__label">Estado</span> ${escapeHtmlTexto(info.estadoLabel)}</p>
    <p class="mapa-segmento-tooltip__row"><span class="mapa-segmento-tooltip__label">Longitud</span> ${escapeHtmlTexto(info.longitudTexto)}</p>
  </div>`
}

function segmentoVisualDesdeGeometria(
  tramo: CanalTramo,
  tipo: SegmentoVisualTramo["tipo"],
  geometria: GeoJsonLineString,
  extras?: Pick<SegmentoVisualTramo, "estadoSegmento" | "letraInicio" | "letraFin">
): SegmentoVisualTramo {
  return {
    tramo,
    tipo,
    geometria,
    longitud_m: longitudDesdeGeometria(geometria),
    estadoSegmento:
      extras?.estadoSegmento ?? (tipo === "pendiente" ? ("pendiente" as EstadoTramo) : undefined),
    letraInicio: extras?.letraInicio,
    letraFin: extras?.letraFin,
  }
}

export function estadoEfectivoMinitramo(punto: TramoPuntoAvance): EstadoTramo {
  return punto.estado_minitramo ?? "en_ejecucion"
}

/** Punto marcado explícitamente en ejecución (parpadeo en mapa). */
export function puntoEnEjecucionOperativo(punto: TramoPuntoAvance): boolean {
  return punto.estado_minitramo === "en_ejecucion"
}

/** Longitud sobre el trazado de minitramos confirmados en estado terminado (base del mapa). */
export function metrosMinitramosTerminadosTramo(
  tramo: CanalTramo,
  puntosAvance: TramoPuntoAvance[]
): number {
  const minitramos = minitramosDesdePuntos(puntosAvance, tramo.id)
  let total = 0
  for (const mt of minitramos) {
    if (estadoEfectivoMinitramo(mt.puntoFin) !== "terminado") continue
    const inicio = Math.min(mt.puntoInicio.abscisa_m, mt.puntoFin.abscisa_m)
    const fin = Math.max(mt.puntoInicio.abscisa_m, mt.puntoFin.abscisa_m)
    const geometria = geometriaEntreAbscisas(tramo.geometria, inicio, fin)
    if (geometria) total += longitudDesdeGeometria(geometria)
  }
  return Math.min(tramo.longitud_m, total)
}

export function segmentosVisualesTramo(
  tramo: CanalTramo,
  puntosAvance?: TramoPuntoAvance[]
): SegmentoVisualTramo[] {
  const minitramos =
    puntosAvance && puntosAvance.some((p) => p.tramo_id === tramo.id)
      ? minitramosDesdePuntos(puntosAvance, tramo.id)
      : []

  if (minitramos.length === 0) {
    return [segmentoVisualDesdeGeometria(tramo, "pendiente", tramo.geometria)]
  }

  const segmentos: SegmentoVisualTramo[] = []
  let cursor = 0

  const ordenados = [...minitramos].sort((a, b) => {
    const inicioA = Math.min(a.puntoInicio.abscisa_m, a.puntoFin.abscisa_m)
    const inicioB = Math.min(b.puntoInicio.abscisa_m, b.puntoFin.abscisa_m)
    return inicioA - inicioB
  })

  for (const mt of ordenados) {
    const inicio = Math.min(mt.puntoInicio.abscisa_m, mt.puntoFin.abscisa_m)
    const fin = Math.max(mt.puntoInicio.abscisa_m, mt.puntoFin.abscisa_m)

    if (inicio > cursor + 0.01) {
      const pendiente = geometriaEntreAbscisas(tramo.geometria, cursor, inicio)
      if (pendiente) segmentos.push(segmentoVisualDesdeGeometria(tramo, "pendiente", pendiente))
    }

    const minitramo = geometriaEntreAbscisas(tramo.geometria, inicio, fin)
    if (minitramo) {
      segmentos.push(
        segmentoVisualDesdeGeometria(tramo, "minitramo", minitramo, {
          estadoSegmento: estadoEfectivoMinitramo(mt.puntoFin),
          letraInicio: mt.letraInicio,
          letraFin: mt.letraFin,
        })
      )
    }
    cursor = fin
  }

  if (cursor < tramo.longitud_m - 0.01) {
    const pendienteFinal = geometriaDesdeAbscisa(tramo.geometria, cursor)
    if (pendienteFinal) {
      segmentos.push(segmentoVisualDesdeGeometria(tramo, "pendiente", pendienteFinal))
    }
  }

  return segmentos.length > 0
    ? segmentos
    : [segmentoVisualDesdeGeometria(tramo, "pendiente", tramo.geometria)]
}

export type TramoDetectado = {
  tramo: CanalTramo
  proyeccion: PuntoProyectado
}

export function detectarTramoDesdeCoordenada(
  lat: number,
  lng: number,
  tramos: CanalTramo[],
  maxDistM = DISTANCIA_MAX_DETECCION_M
): TramoDetectado | null {
  let mejor: TramoDetectado | null = null

  for (const tramo of tramos) {
    const proyeccion = proyectarPuntoEnLinea(lat, lng, tramo.geometria)
    if (!proyeccion || proyeccion.distancia_m > maxDistM) continue

    if (!mejor || proyeccion.distancia_m < mejor.proyeccion.distancia_m) {
      mejor = { tramo, proyeccion }
    }
  }

  return mejor
}

export type RolPuntoAvance = string

export type TramoPuntoAvance = {
  id: string
  tramo_id: string
  registro_foto_id: string | null
  lat: number
  lng: number
  abscisa_m: number
  confirmado: boolean
  created_at: string
  rol?: RolPuntoAvance | null
  grupo_id?: string | null
  estado_minitramo?: EstadoTramo | null
}

export type PuntoMarcado = {
  lat: number
  lng: number
  abscisa_m: number
}

export type MinitramoTramo = {
  grupo_id: string
  letraInicio: string
  letraFin: string
  puntoInicio: TramoPuntoAvance
  puntoFin: TramoPuntoAvance
  longitud_m: number
  created_at: string
}

export type ItemResumenMinitramo =
  | {
      tipo: "completo"
      letraInicio: string
      letraFin: string
      abscisaInicio: number
      abscisaFin: number
      longitud_m: number
      grupo_id: string
      puntoFinId: string
      estado: EstadoTramo
    }
  | {
      tipo: "huérfano"
      letra: string
      abscisa_m: number
      puntoId: string
    }

export type PropuestaPuntoMinitramo = {
  tramo: CanalTramo
  punto: PuntoMarcado
  rol: string
  orden: number
  letra: string
  distancia_m: number
  cierraMinitramo: boolean
  letraParInicio?: string
  metros_ejecutados_propuestos: number
  avance_pct_propuesto: number
  estado_sugerido: EstadoTramo
  mensaje: string
}

export type ModoMarcadoTramo = "nuevo" | "corregir"

export function esRolValido(rol: string | null | undefined): rol is string {
  return typeof rol === "string" && /^[a-z]$/.test(rol)
}

export function letraDesdeOrden(orden: number): string {
  const idx = ((orden - 1) % 26) + 1
  return String.fromCharCode(96 + idx)
}

export function etiquetaLetra(rol: string): string {
  return rol.toUpperCase()
}

export function ordenDesdeRol(rol: string): number {
  if (!esRolValido(rol)) return 0
  return rol.charCodeAt(0) - 96
}

export function esFinPar(orden: number): boolean {
  return orden > 0 && orden % 2 === 0
}

export function puntosOrdenadosTramo(
  puntos: TramoPuntoAvance[],
  tramoId: string
): TramoPuntoAvance[] {
  return puntos
    .filter((p) => p.confirmado && p.tramo_id === tramoId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function siguienteOrdenPunto(puntos: TramoPuntoAvance[], tramoId: string): number {
  return puntosOrdenadosTramo(puntos, tramoId).length + 1
}

export function siguienteLetraPunto(puntos: TramoPuntoAvance[], tramoId: string): string {
  return letraDesdeOrden(siguienteOrdenPunto(puntos, tramoId))
}

export function ultimoPuntoConfirmadoTramo(
  puntos: TramoPuntoAvance[],
  tramoId: string
): TramoPuntoAvance | null {
  const ordenados = puntosOrdenadosTramo(puntos, tramoId)
  return ordenados.at(-1) ?? null
}

export function puntoHuérfanoTramo(
  puntos: TramoPuntoAvance[],
  tramoId: string
): TramoPuntoAvance | null {
  const ultimo = ultimoPuntoConfirmadoTramo(puntos, tramoId)
  if (!ultimo || ultimo.grupo_id) return null
  return ultimo
}

function estadoSugeridoDesdeAvance(avancePct: number, estadoActual: EstadoTramo): EstadoTramo {
  if (avancePct >= 100) return "terminado"
  if (avancePct > 0) return estadoActual === "programado" ? "programado" : "pendiente"
  return estadoActual === "programado" ? "programado" : "pendiente"
}

export function minitramosDesdePuntos(
  puntos: TramoPuntoAvance[],
  tramoId: string
): MinitramoTramo[] {
  const ordenados = puntosOrdenadosTramo(puntos, tramoId)
  const minitramos: MinitramoTramo[] = []

  for (let i = 1; i < ordenados.length; i++) {
    const puntoInicio = ordenados[i - 1]
    const puntoFin = ordenados[i]
    if (!puntoInicio.rol || !puntoFin.rol) continue
    const inicio = Math.min(puntoInicio.abscisa_m, puntoFin.abscisa_m)
    const fin = Math.max(puntoInicio.abscisa_m, puntoFin.abscisa_m)
    minitramos.push({
      grupo_id: puntoFin.id,
      letraInicio: puntoInicio.rol,
      letraFin: puntoFin.rol,
      puntoInicio,
      puntoFin,
      longitud_m: fin - inicio,
      created_at: puntoFin.created_at,
    })
  }

  return minitramos
}

export function resumenMinitramos(
  puntos: TramoPuntoAvance[],
  tramoId: string
): ItemResumenMinitramo[] {
  const items: ItemResumenMinitramo[] = []
  for (const mt of minitramosDesdePuntos(puntos, tramoId)) {
    const inicio = Math.min(mt.puntoInicio.abscisa_m, mt.puntoFin.abscisa_m)
    const fin = Math.max(mt.puntoInicio.abscisa_m, mt.puntoFin.abscisa_m)
    items.push({
      tipo: "completo",
      letraInicio: mt.letraInicio,
      letraFin: mt.letraFin,
      abscisaInicio: inicio,
      abscisaFin: fin,
      longitud_m: mt.longitud_m,
      grupo_id: mt.grupo_id,
      puntoFinId: mt.puntoFin.id,
      estado: estadoEfectivoMinitramo(mt.puntoFin),
    })
  }
  return items
}

/** Siguiente posición válida (mínimo avance lógico) después del último punto confirmado. */
export function posicionMinimaDespuesUltimoPunto(
  tramo: CanalTramo,
  puntos: TramoPuntoAvance[]
): PuntoMarcado | null {
  const ultimo = ultimoPuntoConfirmadoTramo(puntos, tramo.id)
  if (!ultimo) return null

  const logUlt = abscisaLogicaDesdeNatural(tramo, ultimo.abscisa_m)
  const salto = Math.max(TOLERANCIA_CONTINUACION_M, 50, tramo.longitud_m * 0.05)
  const logSig = Math.min(tramo.longitud_m, logUlt + salto)
  const abscisa = abscisaNaturalDesdeLogica(tramo, logSig)
  const coord = coordenadaDesdeAbscisa(tramo.geometria, abscisa)
  return {
    lat: coord?.lat ?? ultimo.lat,
    lng: coord?.lng ?? ultimo.lng,
    abscisa_m: abscisa,
  }
}

export function posicionInicialPunto(
  tramo: CanalTramo,
  puntos: TramoPuntoAvance[]
): PuntoMarcado {
  const despuesUltimo = posicionMinimaDespuesUltimoPunto(tramo, puntos)
  if (despuesUltimo) {
    return despuesUltimo
  }

  const abscisa = abscisaNaturalExtremoInicio(tramo)
  const coord = coordenadaDesdeAbscisa(tramo.geometria, abscisa)
  const inicio = extremoInicioCoord(tramo)
  return {
    lat: coord?.lat ?? inicio.lat,
    lng: coord?.lng ?? inicio.lng,
    abscisa_m: abscisa,
  }
}

export type EvaluacionPropuestaPunto = {
  propuesta: PropuestaPuntoMinitramo | null
  motivoBloqueo: string | null
}

export function evaluarPropuestaPunto(
  tramo: CanalTramo,
  puntosPrevios: TramoPuntoAvance[],
  lat: number,
  lng: number,
  opciones?: { orden?: number; excluirPuntoId?: string; excluirGrupoId?: string }
): EvaluacionPropuestaPunto {
  const proyeccion = proyectarPuntoEnLinea(lat, lng, tramo.geometria)
  if (!proyeccion) {
    return {
      propuesta: null,
      motivoBloqueo:
        "La ubicación está lejos de la geometría del tramo. Arrastre el marcador sobre la línea del canal.",
    }
  }

  const puntoExcluido = opciones?.excluirPuntoId
    ? puntosPrevios.find((p) => p.id === opciones.excluirPuntoId)
    : null

  const puntosBase = puntosPrevios.filter((p) => {
    if (opciones?.excluirPuntoId && p.id === opciones.excluirPuntoId) return false
    if (opciones?.excluirGrupoId && p.grupo_id === opciones.excluirGrupoId) return false
    if (puntoExcluido?.grupo_id && p.grupo_id === puntoExcluido.grupo_id) return false
    return true
  })

  const orden =
    opciones?.orden ??
    (opciones?.excluirPuntoId
      ? ordenDesdeRol(
          puntosPrevios.find((p) => p.id === opciones.excluirPuntoId)?.rol ?? "a"
        )
      : siguienteOrdenPunto(puntosBase, tramo.id))

  const rol = letraDesdeOrden(orden)
  const letra = etiquetaLetra(rol)
  const abscisa = Math.min(tramo.longitud_m, Math.max(0, proyeccion.abscisa_m))

  if (orden === 1) {
    return {
      propuesta: null,
      motivoBloqueo:
        "El punto A se registra al confirmar el inicio del tramo. Use «Restablecer todo» si debe cambiar el extremo.",
    }
  }

  const ordenados = puntosOrdenadosTramo(puntosBase, tramo.id)
  const anterior = ordenados.at(-1) ?? null
  if (anterior) {
    const logAnterior = abscisaLogicaDesdeNatural(tramo, anterior.abscisa_m)
    const logNueva = abscisaLogicaDesdeNatural(tramo, abscisa)
    if (logNueva < logAnterior + TOLERANCIA_CONTINUACION_M - 0.01) {
      const letraAnterior = anterior.rol ? etiquetaLetra(anterior.rol) : "anterior"
      return {
        propuesta: null,
        motivoBloqueo: `Mueva el punto ${letra} hacia adelante en la dirección del desasolve (al menos ${TOLERANCIA_CONTINUACION_M} m después del punto ${letraAnterior} en abscisa lógica). Use «Corregir último punto» si el ${letraAnterior} está mal ubicado, o «Restablecer todo» para elegir el otro extremo.`,
      }
    }
  }

  const cierraMinitramo = orden >= 2
  let intervalosPropuestos = intervalosDesdePuntos(puntosBase, tramo.id)
  if (cierraMinitramo && anterior) {
    intervalosPropuestos = unirIntervalos([
      ...intervalosPropuestos,
      [Math.min(anterior.abscisa_m, abscisa), Math.max(anterior.abscisa_m, abscisa)],
    ])
  }

  const metros = metrosDesdeIntervalos(intervalosPropuestos, tramo.longitud_m)
  const avancePct = sincronizarAvanceDesdeMetros(tramo.longitud_m, metros)
  const letraParInicio = cierraMinitramo ? etiquetaLetra(letraDesdeOrden(orden - 1)) : undefined

  const abscisaLogica = abscisaLogicaDesdeNatural(tramo, abscisa)
  let mensaje = `Punto ${letra} a ${abscisaLogica.toFixed(1)} m del inicio del tramo.`
  if (cierraMinitramo && letraParInicio) {
    mensaje = `Al confirmar el punto ${letra} se enlazará el minitramo ${letraParInicio}–${letra}. Avance acumulado propuesto: ${avancePct.toFixed(1)}%.`
  }

  return {
    propuesta: {
      tramo,
      punto: { lat: proyeccion.lat, lng: proyeccion.lng, abscisa_m: abscisa },
      rol,
      orden,
      letra,
      distancia_m: proyeccion.distancia_m,
      cierraMinitramo,
      letraParInicio,
      metros_ejecutados_propuestos: metros,
      avance_pct_propuesto: avancePct,
      estado_sugerido: estadoSugeridoDesdeAvance(avancePct, tramo.estado),
      mensaje,
    },
    motivoBloqueo: null,
  }
}

export function calcularPropuestaPunto(
  tramo: CanalTramo,
  puntosPrevios: TramoPuntoAvance[],
  lat: number,
  lng: number,
  opciones?: { orden?: number; excluirPuntoId?: string; excluirGrupoId?: string }
): PropuestaPuntoMinitramo | null {
  return evaluarPropuestaPunto(tramo, puntosPrevios, lat, lng, opciones).propuesta
}

/** Pre-carga coordenadas GPS como siguiente punto en secuencia. */
export function calcularPropuestaPuntoDesdeGps(
  tramo: CanalTramo,
  puntosPrevios: TramoPuntoAvance[],
  lat: number,
  lng: number
): PropuestaPuntoMinitramo | null {
  return calcularPropuestaPunto(tramo, puntosPrevios, lat, lng)
}
