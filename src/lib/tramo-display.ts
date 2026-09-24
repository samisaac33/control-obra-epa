/** Evita títulos duplicados tipo «Tramo tramo 21» cuando el código ya incluye «tramo». */
export function tituloTramoMapa(codigo: string): string {
  const trimmed = codigo.trim()
  if (/^tramo\b/i.test(trimmed)) return trimmed
  return `Tramo ${trimmed}`
}
