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
