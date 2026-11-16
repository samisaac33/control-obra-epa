/**
 * Imposición «libro» (saddle stitch) para N páginas interiores múltiplo de 4.
 * Cada entrada del arreglo es una hoja impresa en horizontal: [izquierda, derecha]
 * con números de página del contenido (1-based).
 */
export function imposicionCuadernillo(totalPaginas: number): [number, number][] {
  if (totalPaginas % 4 !== 0) {
    throw new Error(`El cuadernillo requiere un múltiplo de 4 páginas; recibido: ${totalPaginas}`)
  }

  const hojas = totalPaginas / 4
  const plan: [number, number][] = []

  for (let i = 0; i < hojas; i++) {
    plan.push([totalPaginas - 2 * i, 1 + 2 * i])
    plan.push([2 + 2 * i, totalPaginas - 1 - 2 * i])
  }

  return plan
}