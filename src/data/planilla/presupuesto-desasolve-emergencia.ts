import type { Rubro } from "@/data/presupuesto"
import { montoTotalContrato } from "@/data/presupuesto"

/**
 * Oferta adjudicada — Formulario 1, PRESUPUESTO_EMERGENCIA_VAE (Consorcio, 31/08/2026).
 * Precios unitarios = valor ofertado por rubro; montos sin IVA.
 */
export const PRESUPUESTO_OFERTA_SIN_IVA_USD = 1_793_881.01
export const PRESUPUESTO_OFERTA_IVA_USD = 269_082.15
export const PRESUPUESTO_OFERTA_CON_IVA_USD = 2_062_963.16

const C = {
  TRASVASE: "CANALES DEL SISTEMA TRASVASE MANABÍ",
  SAN_ANTONIO: "CANAL DE ENCAUZAMIENTO SAN ANTONIO",
  SEVERINO: "SUBESTACIÓN ELÉCTRICA SEVERINO",
} as const

export const presupuestoDesasolveEmergencia: Rubro[] = [
  {
    id: 1,
    categoria: C.TRASVASE,
    detalle: "REPLANTEO Y NIVELACIÓN",
    unidad: "Km",
    cantidad: 43.8,
    precioUnitario: 151.9,
  },
  {
    id: 2,
    categoria: C.TRASVASE,
    detalle:
      "LIMPIEZA Y DESAZOLVE DE CANALES MENORES (INCLUYE RECONFORMACIÓN DE TALUDES)",
    unidad: "m3",
    cantidad: 525_576,
    precioUnitario: 2,
  },
  {
    id: 3,
    categoria: C.TRASVASE,
    detalle: "DESALOJO DE MATERIAL (DIST. 5KM)",
    unidad: "m3",
    cantidad: 525_576,
    precioUnitario: 0.38,
  },
  {
    id: 4,
    categoria: C.TRASVASE,
    detalle: "TENDIDO DE MATERIAL DESALOJADO",
    unidad: "m3",
    cantidad: 525_576,
    precioUnitario: 0.53,
  },
  {
    id: 5,
    categoria: C.SAN_ANTONIO,
    detalle: "REPLANTEO Y NIVELACIÓN",
    unidad: "Km",
    cantidad: 1.5,
    precioUnitario: 151.9,
  },
  {
    id: 6,
    categoria: C.SAN_ANTONIO,
    detalle:
      "LIMPIEZA Y DESAZOLVE DE CANALES MAYORES (INCLUYE RECONFORMACIÓN DE TALUDES)",
    unidad: "m3",
    cantidad: 71_692.45141,
    precioUnitario: 2.28,
  },
  {
    id: 7,
    categoria: C.SAN_ANTONIO,
    detalle: "DESALOJO DE MATERIAL (DIST. 5KM)",
    unidad: "m3",
    cantidad: 71_692.45141,
    precioUnitario: 0.38,
  },
  {
    id: 8,
    categoria: C.SAN_ANTONIO,
    detalle: "TENDIDO DE MATERIAL DESALOJADO",
    unidad: "m3",
    cantidad: 71_692.45141,
    precioUnitario: 0.53,
  },
  {
    id: 9,
    categoria: C.SEVERINO,
    detalle:
      "PRUEBAS ELÉCTRICAS INICIALES DEL TRANSFORMADOR: TTR, RESISTENCIA DE DEVANADOS, RESISTENCIA DE AISLAMIENTO, ÍNDICE DE POLARIZACIÓN",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 2_736.73,
  },
  {
    id: 10,
    categoria: C.SEVERINO,
    detalle:
      "ANÁLISIS INICIAL DE ACEITE DIELÉCTRICO: RIGIDEZ DIELÉCTRICA, HUMEDAD, ACIDEZ, TENSIÓN INTERFACIAL, FACTOR DE DISIPACIÓN, RESISTIVIDAD, COLOR Y APARIENCIA",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 718.18,
  },
  {
    id: 11,
    categoria: C.SEVERINO,
    detalle:
      "ANÁLISIS DE GASES DISUELTOS (DGA) Y COMPUESTOS FURÁNICOS (2-FAL) DEL ACEITE DIELÉCTRICO",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 647.81,
  },
  {
    id: 12,
    categoria: C.SEVERINO,
    detalle:
      "TRASVASE, ALMACENAMIENTO TEMPORAL, FILTRADO, DESGASIFICACIÓN Y TRATAMIENTO DEL ACEITE DIELÉCTRICO MEDIANTE SISTEMA DE TERMOVACÍO",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 5_692.14,
  },
  {
    id: 13,
    categoria: C.SEVERINO,
    detalle:
      "APERTURA, LEVANTAMIENTO DE TAPA Y PREPARACIÓN DEL TRANSFORMADOR PARA INSPECCIÓN INTERNA",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 4_358.87,
  },
  {
    id: 14,
    categoria: C.SEVERINO,
    detalle:
      "INSPECCIÓN INTERNA DE NÚCLEO, DEVANADOS, AISLAMIENTO, CONEXIONES, PUESTA A TIERRA, ESTRUCTURAS, SUJECIONES, TERMINALES Y CAMBIADOR DE TOMAS",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 2_549.76,
  },
  {
    id: 15,
    categoria: C.SEVERINO,
    detalle:
      "AJUSTES Y MANTENIMIENTO MECÁNICO INTERNO: APRIETE DE CONEXIONES Y ESTRUCTURAS, CORRECCIÓN DE HOLGURAS, LIMPIEZA, REVISIÓN DE EMPAQUES Y ELEMENTOS DE FIJACIÓN",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 3_151.87,
  },
  {
    id: 16,
    categoria: C.SEVERINO,
    detalle:
      "CIERRE Y SELLADO DEL TRANSFORMADOR, INSTALACIÓN DE EMPAQUETADURAS, PRUEBA DE ESTANQUEIDAD, LLENADO Y TRATAMIENTO FINAL DEL ACEITE DIELÉCTRICO",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 4_735.49,
  },
  {
    id: 17,
    categoria: C.SEVERINO,
    detalle:
      "PRUEBAS ELÉCTRICAS FINALES DEL TRANSFORMADOR: TTR, RESISTENCIA DE DEVANADOS, RESISTENCIA DE AISLAMIENTO, ÍNDICE DE POLARIZACIÓN",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 2_724.73,
  },
  {
    id: 18,
    categoria: C.SEVERINO,
    detalle:
      "ANÁLISIS FINAL DEL ACEITE, COMPARACIÓN DE RESULTADOS, PROTOCOLO DE ACEPTACIÓN PARA ENERGIZACIÓN",
    unidad: "glb",
    cantidad: 1,
    precioUnitario: 1_559.28,
  },
]

/** Verificación contra subtotal del formulario (tolerancia centavos por redondeo). */
export function verificarTotalPresupuestoOferta(): {
  calculado: number
  declarado: number
  ok: boolean
} {
  const calculado = montoTotalContrato(presupuestoDesasolveEmergencia)
  const declarado = PRESUPUESTO_OFERTA_SIN_IVA_USD
  return {
    calculado,
    declarado,
    ok: Math.abs(calculado - declarado) < 0.02,
  }
}
