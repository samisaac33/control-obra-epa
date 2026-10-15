import type { CanalTramo } from "@/src/data/tramos/types"
import { parseCoordenadasDesdeTexto } from "@/src/lib/coordenadas-evidencia"
import {
  detectarTramoDesdeCoordenada,
  DISTANCIA_MAX_DETECCION_M,
  evaluarPropuestaPuntoConAutoEnlace,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import proj4 from "proj4"

export type HemisferioUtm = "N" | "S"

export type CoordenadasUtm = {
  zona: number
  hemisferio: HemisferioUtm
  easting: number
  northing: number
}

export type CoordenadasMapaAplicables = {
  lat: number
  lng: number
  precision_m: number
  fuente: "imagen" | "texto"
  utm?: CoordenadasUtm
}

const PRECISION_MANUAL_M = 10

export function epsgUtmWgs84(zona: number, hemisferio: HemisferioUtm): string {
  if (!Number.isInteger(zona) || zona < 1 || zona > 60) {
    throw new Error("La zona UTM debe estar entre 1 y 60.")
  }
  return hemisferio === "S" ? `EPSG:327${String(zona).padStart(2, "0")}` : `EPSG:326${String(zona).padStart(2, "0")}`
}

export function utmToWgs84(utm: CoordenadasUtm): { lat: number; lng: number } {
  const from = epsgUtmWgs84(utm.zona, utm.hemisferio)
  const [lng, lat] = proj4(from, "EPSG:4326", [utm.easting, utm.northing])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("No se pudo convertir UTM a latitud/longitud.")
  }
  return { lat, lng }
}

function parseNumeroCoordenada(valor: string): number | null {
  const limpio = valor.replace(/\s/g, "").replace(/,/g, "")
  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}

/** Detecta UTM en texto libre (capturas o pegado manual). */
export function parseUtmDesdeTexto(texto: string): CoordenadasUtm | null {
  const t = texto.trim()
  if (!t) return null

  const zonaMatch = t.match(/\b(?:zona|zone|utm)\s*[:.]?\s*(\d{1,2})\s*([NS])?\b/i)
  const zona = zonaMatch ? Number(zonaMatch[1]) : null
  const hemisferioLetra = zonaMatch?.[2]?.toUpperCase()

  const eastingMatch = t.match(/(\d[\d,\s]{4,})\s*E\b/i)
  const northingMatch = t.match(/(\d[\d,\s]{4,})\s*N\b/i)
  if (!eastingMatch || !northingMatch) return null

  const easting = parseNumeroCoordenada(eastingMatch[1])
  const northing = parseNumeroCoordenada(northingMatch[1])
  if (easting === null || northing === null) return null

  const zonaFinal = zona ?? 17
  const hemisferio: HemisferioUtm =
    hemisferioLetra === "N" ? "N" : hemisferioLetra === "S" ? "S" : "S"

  return { zona: zonaFinal, hemisferio, easting, northing }
}

export function parsePrecisionDesdeTexto(texto: string): number | null {
  const m = texto.match(/(?:±|\+-\s*|\+\/-\s*|precisi[oó]n)\s*(\d+(?:[.,]\d+)?)\s*m/i)
  if (!m) return null
  const n = Number(m[1].replace(",", "."))
  return Number.isFinite(n) && n > 0 ? n : null
}

export type NormalizarCoordenadasResult =
  | { ok: true; coords: CoordenadasMapaAplicables }
  | { ok: false; error: string }

export function normalizarEntradaCoordenadas(
  texto: string,
  opts?: { precision_m?: number; fuente?: "imagen" | "texto"; utm?: CoordenadasUtm }
): NormalizarCoordenadasResult {
  const latLng = parseCoordenadasDesdeTexto(texto)
  if (latLng.ok) {
    return {
      ok: true,
      coords: {
        lat: latLng.lat,
        lng: latLng.lng,
        precision_m: opts?.precision_m ?? latLng.precision_m,
        fuente: opts?.fuente ?? "texto",
        utm: opts?.utm,
      },
    }
  }

  const utm = opts?.utm ?? parseUtmDesdeTexto(texto)
  if (!utm) {
    return { ok: false, error: latLng.error }
  }

  try {
    const { lat, lng } = utmToWgs84(utm)
    const precision =
      opts?.precision_m ?? parsePrecisionDesdeTexto(texto) ?? PRECISION_MANUAL_M
    return {
      ok: true,
      coords: {
        lat,
        lng,
        precision_m: precision,
        fuente: opts?.fuente ?? "texto",
        utm,
      },
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Conversión UTM inválida.",
    }
  }
}

export type ResumenPropuestaPuntoEnMapa = {
  titulo: string
  lineas: string[]
  puedeRegistrar: boolean
}

export function resumenPropuestaPuntoEnMapa(
  tramos: CanalTramo[],
  puntosAvance: TramoPuntoAvance[],
  lat: number,
  lng: number
): ResumenPropuestaPuntoEnMapa {
  const deteccion = detectarTramoDesdeCoordenada(lat, lng, tramos)
  if (!deteccion) {
    return {
      titulo: "Ubicación fuera del canal detectado",
      lineas: [
        `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        `No hay tramo dentro de ${DISTANCIA_MAX_DETECCION_M} m del trazado. Acérquese al canal para registrar un punto.`,
      ],
      puedeRegistrar: false,
    }
  }

  const puntosDelTramo = puntosAvance.filter(
    (p) => p.tramo_id === deteccion.tramo.id && p.confirmado
  )
  const evaluacion = evaluarPropuestaPuntoConAutoEnlace(
    deteccion.tramo,
    puntosDelTramo,
    lat,
    lng
  )

  const lineas = [
    `Coordenadas WGS84: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    `Tramo ${deteccion.tramo.codigo} · ${deteccion.proyeccion.distancia_m.toFixed(1)} m del eje del canal`,
  ]

  if (evaluacion.propuesta) {
    const minitramo =
      evaluacion.propuesta.letraParInicio != null
        ? `Minitramo ${evaluacion.propuesta.letraParInicio}–${evaluacion.propuesta.letra}`
        : `Punto ${evaluacion.propuesta.letra}`
    lineas.push(
      `${minitramo} · abscisa ~${evaluacion.propuesta.punto.abscisa_m.toFixed(1)} m`,
      "Al confirmar con «Registrar punto» se propondrá este avance GPS en el tramo indicado."
    )
    return {
      titulo: "Punto listo para registrar",
      lineas,
      puedeRegistrar: true,
    }
  }

  lineas.push(
    evaluacion.motivoBloqueo ??
      "No se pudo calcular una propuesta de punto en este tramo con la geometría actual."
  )
  return {
    titulo: "Coordenadas reconocidas, registro bloqueado",
    lineas,
    puedeRegistrar: false,
  }
}
