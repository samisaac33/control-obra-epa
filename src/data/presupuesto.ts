export interface Rubro {
  id: number
  categoria: string
  detalle: string
  unidad: string
  cantidad: number
  precioUnitario: number
}

/** Monto parcial del rubro: cantidad × precio unitario */
export function subtotalRubro(r: Rubro): number {
  return r.cantidad * r.precioUnitario
}

/** Suma (cantidad × precio unitario) de todos los rubros. */
export function montoTotalContrato(rubros: Rubro[]): number {
  return rubros.reduce((sum, r) => sum + subtotalRubro(r), 0)
}

const C = {
  REPARACION_SEVERINO: "REPARACION DE BOMBAS Y MOTORES DE LA EB SEVERINO",
  TABLAS_MADERA: "SUMINISTRO DE TABLAS Y PORTICOS DE MADERA",
  POZA_HONDA: "EXTRACCIÓN DE LECHUGUINES POZA HONDA",
  PESPERANZA: "EXTRACCIÓN DE LECHUGUINES LA PESPERANZA",
  PENICHE: "PROTECCIÓN DE TALUDES COMPUERTA PENICHE",
  CIENEGA: "PROTECCIÓN DE TALUDES COMPUERTA CIÉNEGA",
  TERRAZAMIENTO: "RECONFORMACION DE TERRAZAMIENTO EN SITIO",
  INABRONCO_DESAZOLVE: "DESAZOLVE DEL CANAL DE HORMIGON INABRONCO",
  INABRONCO_RECONS: "RECONSTRUCCIÓN DE CANAL INABRONCO",
} as const

/**
 * Presupuesto de obra: 39 rubros (categoría + detalle según pliego / tablas aportadas).
 */
export const presupuestoData: Rubro[] = [
  { id: 1, categoria: C.REPARACION_SEVERINO, detalle: "Desmontaje de motores de Severino", unidad: "u", cantidad: 4, precioUnitario: 2984.0 },
  { id: 2, categoria: C.REPARACION_SEVERINO, detalle: "Desmontaje de bombas de Severino", unidad: "u", cantidad: 4, precioUnitario: 14785.57 },
  { id: 3, categoria: C.REPARACION_SEVERINO, detalle: "Corrección de pandeo de ejes de motor", unidad: "u", cantidad: 15, precioUnitario: 667.81 },
  { id: 4, categoria: C.REPARACION_SEVERINO, detalle: "Mantenimiento de motor", unidad: "u", cantidad: 2, precioUnitario: 15457.42 },
  { id: 5, categoria: C.REPARACION_SEVERINO, detalle: "Limpieza de cárcamos de bombeo mediante trabajo subacuático", unidad: "m3", cantidad: 100, precioUnitario: 164.19 },
  { id: 6, categoria: C.REPARACION_SEVERINO, detalle: "Montaje, alineación y puesta en marcha de bomba de Severino", unidad: "u", cantidad: 2, precioUnitario: 21510.04 },
  { id: 7, categoria: C.REPARACION_SEVERINO, detalle: "Montaje, alineación y puesta en marcha de motor de Severino", unidad: "u", cantidad: 2, precioUnitario: 5000.3 },
  { id: 8, categoria: C.TABLAS_MADERA, detalle: "Suministro y transporte de pórticos de madera", unidad: "u", cantidad: 260, precioUnitario: 81.25 },
  { id: 9, categoria: C.TABLAS_MADERA, detalle: "Suministro y transporte de tablas de madera", unidad: "u", cantidad: 909, precioUnitario: 8.25 },
  { id: 10, categoria: C.POZA_HONDA, detalle: "Mejoramiento de vía de acceso (Inc. Material)", unidad: "m3", cantidad: 1000, precioUnitario: 6.78 },
  { id: 11, categoria: C.POZA_HONDA, detalle: "Extracción de lechuguines o jacintos de agua", unidad: "ha", cantidad: 90, precioUnitario: 1012.27 },
  { id: 12, categoria: C.PESPERANZA, detalle: "Mejoramiento de vía de acceso (Inc. Material)", unidad: "m3", cantidad: 1000, precioUnitario: 6.78 },
  { id: 13, categoria: C.PESPERANZA, detalle: "Extracción de lechuguines o jacintos de agua", unidad: "ha", cantidad: 120, precioUnitario: 1025.08 },
  { id: 14, categoria: C.PENICHE, detalle: "Replanteo y nivelación con equipo topógrafico", unidad: "m2", cantidad: 3172, precioUnitario: 1.81 },
  { id: 15, categoria: C.PENICHE, detalle: "Limpieza y desbroce", unidad: "m2", cantidad: 3172, precioUnitario: 0.89 },
  { id: 16, categoria: C.PENICHE, detalle: "Excavación a máquina sin clasificar", unidad: "m3", cantidad: 1595.59, precioUnitario: 2.69 },
  { id: 17, categoria: C.PENICHE, detalle: "Suministro y colocación de piedra escollera", unidad: "m3", cantidad: 2778.34, precioUnitario: 19.36 },
  { id: 18, categoria: C.PENICHE, detalle: "Transporte de materiales", unidad: "m3-km", cantidad: 41675.13, precioUnitario: 0.28 },
  { id: 19, categoria: C.PENICHE, detalle: "Suministro e instalación de Geotextil NT-1600", unidad: "m2", cantidad: 2897.89, precioUnitario: 1.65 },
  { id: 20, categoria: C.CIENEGA, detalle: "Replanteo y nivelación con equipo topógrafico", unidad: "m2", cantidad: 9179, precioUnitario: 1.81 },
  { id: 21, categoria: C.CIENEGA, detalle: "Limpieza y desbroce", unidad: "m2", cantidad: 9179, precioUnitario: 0.89 },
  { id: 22, categoria: C.CIENEGA, detalle: "Excavación a máquina sin clasificar", unidad: "m3", cantidad: 2219.22, precioUnitario: 2.69 },
  { id: 23, categoria: C.CIENEGA, detalle: "Suministro y colocación de piedra escollera", unidad: "m3", cantidad: 3864.23, precioUnitario: 19.36 },
  { id: 24, categoria: C.CIENEGA, detalle: "Transporte de materiales", unidad: "m3-km", cantidad: 57963.47, precioUnitario: 0.28 },
  { id: 25, categoria: C.CIENEGA, detalle: "Suministro e instalación de Geotextil NT-1600", unidad: "m2", cantidad: 4030.51, precioUnitario: 1.65 },
  { id: 26, categoria: C.CIENEGA, detalle: "Relleno compactado con material de préstamo importado", unidad: "m3", cantidad: 600, precioUnitario: 4.82 },
  { id: 27, categoria: C.CIENEGA, detalle: "Relleno compactado con material del sitio", unidad: "m3", cantidad: 740, precioUnitario: 3.93 },
  { id: 28, categoria: C.CIENEGA, detalle: "Transporte de materiales", unidad: "m3-km", cantidad: 3000, precioUnitario: 0.28 },
  { id: 29, categoria: C.TERRAZAMIENTO, detalle: "Replanteo y nivelación con equipo topógrafico", unidad: "m2", cantidad: 2707.26, precioUnitario: 1.81 },
  { id: 30, categoria: C.TERRAZAMIENTO, detalle: "Excavación a máquina sin clasificar", unidad: "m3", cantidad: 4060.89, precioUnitario: 2.69 },
  { id: 31, categoria: C.TERRAZAMIENTO, detalle: "Desalojo de material distancia hasta 5km", unidad: "m3", cantidad: 4060.89, precioUnitario: 1.03 },
  { id: 32, categoria: C.TERRAZAMIENTO, detalle: "Mejoramiento de vía de acceso (Inc. Material)", unidad: "global", cantidad: 1200, precioUnitario: 6.78 },
  { id: 33, categoria: C.INABRONCO_DESAZOLVE, detalle: "Replanteo y nivelación con equipo topógrafico", unidad: "m2", cantidad: 42000, precioUnitario: 1.81 },
  { id: 34, categoria: C.INABRONCO_DESAZOLVE, detalle: "Excavación a máquina sin clasificar", unidad: "m3", cantidad: 24000, precioUnitario: 2.69 },
  { id: 35, categoria: C.INABRONCO_DESAZOLVE, detalle: "Desalojo de material distancia hasta 5km", unidad: "m3", cantidad: 24000, precioUnitario: 1.03 },
  { id: 36, categoria: C.INABRONCO_DESAZOLVE, detalle: "Tendido de material", unidad: "m3", cantidad: 24000, precioUnitario: 0.88 },
  { id: 37, categoria: C.INABRONCO_RECONS, detalle: "Replanteo y nivelación con equipo topógrafico", unidad: "m2", cantidad: 525, precioUnitario: 1.81 },
  { id: 38, categoria: C.INABRONCO_RECONS, detalle: "Reconformación de base, perfilado y refino", unidad: "m2", cantidad: 862.5, precioUnitario: 1.87 },
  { id: 39, categoria: C.INABRONCO_RECONS, detalle: "Suministro de tuberia de hormigon armado d=500mm", unidad: "m", cantidad: 150, precioUnitario: 300.24 },
]
