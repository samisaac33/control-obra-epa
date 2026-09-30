export function validarCoordenadasOpcionales(
  lat: string,
  lng: string
): { lat: number | null; lng: number | null; error?: string } {
  const latTrim = lat.trim()
  const lngTrim = lng.trim()

  if (!latTrim && !lngTrim) {
    return { lat: null, lng: null }
  }

  if (!latTrim || !lngTrim) {
    return {
      lat: null,
      lng: null,
      error: "Ingresa latitud y longitud, o deja ambos campos vacíos.",
    }
  }

  const latNum = Number(latTrim)
  const lngNum = Number(lngTrim)

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return { lat: null, lng: null, error: "Las coordenadas deben ser números válidos." }
  }

  return { lat: latNum, lng: lngNum }
}

const PRECISION_MANUAL_M = 10

export type ParseCoordenadasResult =
  | { ok: true; lat: number; lng: number; precision_m: number }
  | { ok: false; error: string }

/** Parsea un texto tipo `-0.846327, -80.512136` (lat, lng). */
export function parseCoordenadasDesdeTexto(texto: string): ParseCoordenadasResult {
  const trimmed = texto.trim()
  if (!trimmed) {
    return { ok: false, error: "Ingrese latitud y longitud separadas por coma." }
  }

  const partes = trimmed.split(",").map((p) => p.trim())
  if (partes.length !== 2 || !partes[0] || !partes[1]) {
    return {
      ok: false,
      error: "Use el formato latitud, longitud (ej.: -0.846327, -80.512136).",
    }
  }

  const lat = Number(partes[0])
  const lng = Number(partes[1])

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: "Las coordenadas deben ser números válidos." }
  }

  if (lat < -90 || lat > 90) {
    return { ok: false, error: "La latitud debe estar entre -90 y 90." }
  }

  if (lng < -180 || lng > 180) {
    return { ok: false, error: "La longitud debe estar entre -180 y 180." }
  }

  return { ok: true, lat, lng, precision_m: PRECISION_MANUAL_M }
}
