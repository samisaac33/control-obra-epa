export function crearId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function fechaReferenciaDesdeMetrados(
  fechas: string[],
  fallback: string
): string {
  if (fechas.length === 0) return fallback
  return fechas.reduce((max, f) => (f > max ? f : max), fechas[0])
}
