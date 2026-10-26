/** Formato numérico alineado al cronograma valorado VAE (es-EC, 2 decimales). */
export function formatearNumeroCronograma(value: number, decimales = 2): string {
  return value.toLocaleString("es-EC", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export function formatearUsdCronograma(value: number): string {
  return `$ ${formatearNumeroCronograma(value, 2)}`
}

export const CRONOGRAMA_EJECUTADO_DECIMALES = 5

export function esResumenCronogramaEjecutadoEpa(tituloVertical: string): boolean {
  return tituloVertical === "CRONOGRAMA EJECUTADO"
}

/** Cantidad (columna CANT.) — cronograma ejecutado: 5 decimales. */
export function formatearCantidadCeldaCronogramaEpa(tituloVertical: string, value: number): string {
  const dec = esResumenCronogramaEjecutadoEpa(tituloVertical)
    ? CRONOGRAMA_EJECUTADO_DECIMALES
    : 2
  return formatearNumeroCronograma(value, dec)
}

/** Montos USD en tabla (P. UNIT., TOTAL, DIAS, totales) — ejecutado: $ y 5 decimales. */
export function formatearUsdCeldaCronogramaEpa(tituloVertical: string, value: number): string {
  const dec = esResumenCronogramaEjecutadoEpa(tituloVertical)
    ? CRONOGRAMA_EJECUTADO_DECIMALES
    : 2
  return `$ ${formatearNumeroCronograma(value, dec)}`
}

/** Porcentajes de avance (sin $). */
export function formatearPctCeldaCronogramaEpa(value: number): string {
  return formatearNumeroCronograma(value, 2)
}
