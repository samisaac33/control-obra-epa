const STORAGE_KEY = "sicc-datos-v1"

export interface SiccPersistedData {
  metrados: import("@/lib/sicc/types").EntradaMetrado[]
  libroObra: import("@/lib/sicc/types").EntradaLibroObra[]
}

export function cargarDatosSicc(): SiccPersistedData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SiccPersistedData
    if (!Array.isArray(parsed.metrados) || !Array.isArray(parsed.libroObra)) return null
    return parsed
  } catch {
    return null
  }
}

export function guardarDatosSicc(data: SiccPersistedData): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Almacenamiento no disponible; el estado en memoria sigue activo en la sesión.
  }
}

export function reiniciarDatosSicc(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
