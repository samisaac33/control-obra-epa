import type { RelojPublicoRubroOc } from "@/src/data/infimas/reloj-publico-types"

const MESES_EJECUCION = 12

export function mensualizarCantidad(cantidadAnual: number): number {
  return cantidadAnual / MESES_EJECUCION
}

export function mensualizarValor(valorAnual: number): number {
  return Math.round((valorAnual / MESES_EJECUCION) * 100) / 100
}

export const ORDEN_COMPRA_RELOJ_PUBLICO = {
  codigo: "IC-GADPDM-2026-042",
  fecha: "07 de julio de 2026",
  areaRequirente: "Dirección Administrativa",
  certificacionPresupuestaria: "CER-2026-01179 y CERPLU-1176",
  proforma: "#000213",
  proformaFecha: "02/07/2026",
  vigenciaProformaDias: 60,
  plazoEjecucionDias: 365,
  archivoPdf: "/infimas/reloj-publico-portoviejo/orden-de-compra-ic-gadpdm-2026-042.pdf",
} as const

export const DESCRIPCION_PREVENTIVO_OC = `MANTENIMIENTO PREVENTIVO: El mantenimiento preventivo deberá ejecutarse una vez por semana, utilizando aceites técnicos especializados y utensilios adecuados para este tipo de mecanismo.

- Mantenimiento y engrasamiento de las cuerdas del reloj (limpieza, revestimiento de aceite y grasa; tres rollos: máquina del reloj, cuarto de hora y sonido de la hora).
- Mantenimiento y engrase de carretes.
- Limpieza general del reloj (ruedas dentadas, engranajes, mecanismo de disparo, campanas, cuerdas y pesas).`

export const DESCRIPCION_CORRECTIVO_OC = `MANTENIMIENTO CORRECTIVO:
- Cambio y suministro de cuerda del mecanismo del reloj, carretes, pesas y campanadas.
- Cambio y suministro de piezas menores, accesorios y elementos mecánicos con desgaste.
- Mantenimiento correctivo de paredes externas del área del reloj (fisuras, pintura, preparación y acabado).`

export const RUBROS_ORDEN_COMPRA_RELOJ: RelojPublicoRubroOc[] = [
  {
    item: 1,
    cpc: "872200012",
    titulo: "Mantenimiento preventivo",
    descripcion: DESCRIPCION_PREVENTIVO_OC,
    descripcionResumen:
      "Mantenimiento semanal preventivo: cuerdas (3 rollos), carretes, limpieza interna y lubricación.",
    unidad: "unidad",
    cantidadAnual: 48,
    precioUnitario: 75,
    valorTotalAnual: 3600,
    cantidadMensual: mensualizarCantidad(48),
    valorMensual: mensualizarValor(3600),
  },
  {
    item: 2,
    cpc: "872200012",
    titulo: "Mantenimiento correctivo",
    descripcion: DESCRIPCION_CORRECTIVO_OC,
    descripcionResumen:
      "Correctivo: cuerdas, piezas menores y mantenimiento de área externa/pintura según necesidad.",
    unidad: "unidad",
    cantidadAnual: 12,
    precioUnitario: 400,
    valorTotalAnual: 4800,
    cantidadMensual: mensualizarCantidad(12),
    valorMensual: mensualizarValor(4800),
  },
]

export const PRESUPUESTO_ANUAL_RELOJ = RUBROS_ORDEN_COMPRA_RELOJ.reduce(
  (sum, rubro) => sum + rubro.valorTotalAnual,
  0
)

export const PRESUPUESTO_MENSUAL_RELOJ = mensualizarValor(PRESUPUESTO_ANUAL_RELOJ)
