import type { Rubro } from "@/data/presupuesto"

/**
 * Presupuesto referencial — Emergencia Severino y Trasvase Manabí (desazolve / desalojo).
 * Ajustar cantidades y PU cuando el pliego oficial esté cargado en el módulo presupuesto.
 */
const C = {
  CANALES: "DESAZOLVE CANALES TRASVASE MANABÍ",
  SEVERINO: "MANTENIMIENTO SUBESTACIÓN SEVERINO",
  TRANSPORTE: "TRANSPORTE Y DESALOJO (RADIO 5 KM)",
} as const

export const presupuestoDesasolveEmergencia: Rubro[] = [
  {
    id: 101,
    categoria: C.CANALES,
    detalle: "Replanteo y nivelación con equipo topográfico (canales menores y Canal 2)",
    unidad: "m",
    cantidad: 45300,
    precioUnitario: 1.81,
  },
  {
    id: 102,
    categoria: C.CANALES,
    detalle: "Desazolve / excavación a máquina en canal (material sin clasificar)",
    unidad: "m3",
    cantidad: 597268.45,
    precioUnitario: 2.69,
  },
  {
    id: 103,
    categoria: C.TRANSPORTE,
    detalle: "Desalojo de material a botadero autorizado (hasta 5 km, volqueta 8 m³)",
    unidad: "m3",
    cantidad: 597268.45,
    precioUnitario: 1.03,
  },
  {
    id: 104,
    categoria: C.CANALES,
    detalle: "Horas-máquina excavadora (brazo corto / largo)",
    unidad: "h",
    cantidad: 4800,
    precioUnitario: 85.0,
  },
  {
    id: 105,
    categoria: C.TRANSPORTE,
    detalle: "Horas-máquina volqueta",
    unidad: "h",
    cantidad: 3600,
    precioUnitario: 42.0,
  },
  {
    id: 106,
    categoria: C.CANALES,
    detalle: "Control topográfico y cubicación por abscisas (método áreas medias)",
    unidad: "m3",
    cantidad: 597268.45,
    precioUnitario: 0.35,
  },
  {
    id: 201,
    categoria: C.SEVERINO,
    detalle: "Mantenimiento preventivo equipos de bombeo Severino",
    unidad: "global",
    cantidad: 1,
    precioUnitario: 45000.0,
  },
  {
    id: 202,
    categoria: C.SEVERINO,
    detalle: "Inspección y pruebas eléctricas subestación",
    unidad: "global",
    cantidad: 1,
    precioUnitario: 12000.0,
  },
]
