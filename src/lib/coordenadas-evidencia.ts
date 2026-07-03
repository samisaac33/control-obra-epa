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
