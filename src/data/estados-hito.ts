export type EstadoHitoId = "inicial" | "en_ejecucion" | "culminado"

export type EstadoHitoMeta = {
  id: EstadoHitoId
  label: string
  badgeClass: string
}

export const ESTADOS_HITO: EstadoHitoMeta[] = [
  {
    id: "inicial",
    label: "Inicial",
    badgeClass:
      "border-slate-500/50 bg-slate-100 text-slate-900 ring-1 ring-slate-500/15 dark:bg-slate-900/40 dark:text-slate-100",
  },
  {
    id: "en_ejecucion",
    label: "En ejecución",
    badgeClass:
      "border-blue-600/50 bg-blue-50 text-blue-950 ring-1 ring-blue-600/15 dark:bg-blue-950/40 dark:text-blue-100",
  },
  {
    id: "culminado",
    label: "Culminado",
    badgeClass:
      "border-green-600/50 bg-green-50 text-green-950 ring-1 ring-green-600/15 dark:bg-green-950/40 dark:text-green-100",
  },
]

const ESTADO_HITO_POR_ID = new Map(ESTADOS_HITO.map((estado) => [estado.id, estado]))

function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

export function esEstadoHitoId(valor: string): valor is EstadoHitoId {
  return ESTADO_HITO_POR_ID.has(valor as EstadoHitoId)
}

export function normalizarEstadoHito(valor?: string | null): EstadoHitoId | null {
  if (!valor?.trim()) return null

  const trimmed = valor.trim()
  if (esEstadoHitoId(trimmed)) return trimmed

  const clave = normalizarTexto(trimmed)

  if (
    clave === "inicial" ||
    clave === "inicio" ||
    clave === "pendiente"
  ) {
    return "inicial"
  }

  if (
    clave === "en ejecucion" ||
    clave === "ejecucion" ||
    clave.startsWith("en ejec")
  ) {
    return "en_ejecucion"
  }

  if (
    clave === "culminado" ||
    clave === "culminada" ||
    clave === "terminado" ||
    clave === "terminada" ||
    clave === "finalizado" ||
    clave === "finalizada"
  ) {
    return "culminado"
  }

  return null
}

export function etiquetaEstadoHito(valor?: string | null): string | null {
  const id = normalizarEstadoHito(valor)
  if (!id) return null
  return ESTADO_HITO_POR_ID.get(id)?.label ?? null
}

export function clasesBadgeEstadoHito(valor?: string | null): string | null {
  const id = normalizarEstadoHito(valor)
  if (!id) return null
  return ESTADO_HITO_POR_ID.get(id)?.badgeClass ?? null
}

export function estadoHitoParaGuardar(valor: string): EstadoHitoId | null {
  const trimmed = valor.trim()
  if (!trimmed) return null
  if (esEstadoHitoId(trimmed)) return trimmed
  return normalizarEstadoHito(valor)
}
