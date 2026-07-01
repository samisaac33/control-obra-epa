import type { EntradaLibroObra, KpiObra, ObraSicc } from "@/lib/sicc/types"

export const OBRA_DEMO: ObraSicc = {
  id: "obra-severino-2026",
  nombre: "Obra civil — Sistema de bombeo Severino",
  numeroContrato: "CTO-2026-EP-0142",
  cliente: "Ente Público de Agua (EPA)",
  ubicacion: "Manabí, Ecuador",
  residente: "Ing. Residente de obra",
  fechaInicio: "2026-01-15",
  plazoDias: 240,
  montoContrato: 1_847_320.5,
  avanceFisico: 18.4,
  avanceFinanciero: 14.2,
}

export const KPIS_OBRA_DEMO: KpiObra[] = [
  {
    etiqueta: "Avance físico",
    valor: `${OBRA_DEMO.avanceFisico}%`,
    detalle: "Metrados acumulados certificables",
    tendencia: "positiva",
  },
  {
    etiqueta: "Avance financiero",
    valor: `${OBRA_DEMO.avanceFinanciero}%`,
    detalle: "Según curva S contractual",
    tendencia: "neutral",
  },
  {
    etiqueta: "Días transcurridos",
    valor: "47",
    detalle: `Plazo contractual: ${OBRA_DEMO.plazoDias} días`,
    tendencia: "neutral",
  },
  {
    etiqueta: "Metrados registrados",
    valor: "11",
    detalle: "Entradas vinculadas a rubros",
    tendencia: "positiva",
  },
]

export const ENTRADAS_LIBRO_DEMO: EntradaLibroObra[] = [
  {
    id: "lo-001",
    fecha: "2026-02-10",
    clima: "Soleado",
    temperatura: "28 °C",
    personal: 24,
    actividades:
      "Replanteo y nivelación en frente de cárcamo EB Severino. Excavación a máquina en material sin clasificar (sector norte).",
    materiales: "Estacas, pintura de marcación",
    equipos: "1 excavadora, 2 volquetes",
    observaciones: "Trabajo conforme a planos estructurales rev. B.",
    residente: OBRA_DEMO.residente,
  },
  {
    id: "lo-002",
    fecha: "2026-02-11",
    clima: "Parcialmente nublado",
    temperatura: "27 °C",
    personal: 22,
    actividades:
      "Continuación de excavación. Colocación de piedra escollera en protección de talud provisional.",
    incidencias: "Lluvia ligera 14:30–15:00 h. Se suspendió excavación por seguridad.",
    residente: OBRA_DEMO.residente,
  },
  {
    id: "lo-003",
    fecha: "2026-02-12",
    clima: "Nublado",
    temperatura: "26 °C",
    personal: 26,
    actividades:
      "Tendido y compactación de material de préstamo en plataforma de acceso. Control de humedad óptima.",
    equipos: "1 rodillo vibratorio, 1 motoniveladora",
    observaciones: "Ensayo de compactación programado para el día siguiente.",
    residente: OBRA_DEMO.residente,
  },
]
