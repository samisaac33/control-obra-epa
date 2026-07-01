import type { ModuloId, ModuloSicc } from "@/lib/sicc/types"

export const SICC_BASE = "/sicc"

export const MODULOS_SICC: ModuloSicc[] = [
  {
    id: "presupuesto",
    titulo: "Presupuesto y costos",
    descripcion:
      "Rubros contractuales, presupuesto de ejecución, curva S y desviaciones por partida.",
    href: `${SICC_BASE}/presupuesto`,
    fase: 1,
    estado: "en_desarrollo",
    funcionalidades: [
      "Desglose por rubro y categoría",
      "Presupuesto de ejecución (PE)",
      "Curva S físico vs. financiero",
      "Alertas de sobre/sub ejecución",
    ],
  },
  {
    id: "metrados",
    titulo: "Metrados y avance",
    descripcion:
      "Registro de cantidades ejecutadas en campo vinculadas a rubros del contrato.",
    href: `${SICC_BASE}/metrados`,
    fase: 1,
    estado: "activo",
    funcionalidades: [
      "Metrado diario por frente",
      "Avance acumulado por rubro",
      "Evidencia fotográfica",
      "Comparativo ejecutado vs. contratado",
    ],
  },
  {
    id: "libro-obra",
    titulo: "Libro de obra",
    descripcion:
      "Bitácora diaria automatizada a partir del parte de obra del residente.",
    href: `${SICC_BASE}/libro-obra`,
    fase: 1,
    estado: "activo",
    funcionalidades: [
      "Parte diario de obra",
      "Generación automática de bitácora",
      "Registro de clima, personal y actividades",
      "Vista imprimible del libro",
    ],
  },
  {
    id: "certificaciones",
    titulo: "Certificaciones",
    descripcion:
      "Planillas de avance mensual y documentos para facturación al cliente.",
    href: `${SICC_BASE}/certificaciones`,
    fase: 2,
    estado: "proximamente",
    funcionalidades: [
      "Certificación por periodo",
      "Acumulados por rubro",
      "PDF para fiscalización",
      "Vinculación con metrados",
    ],
  },
  {
    id: "planificacion",
    titulo: "Planificación",
    descripcion: "Cronograma, programación semanal y asignación de frentes de trabajo.",
    href: `${SICC_BASE}/planificacion`,
    fase: 4,
    estado: "proximamente",
    funcionalidades: [
      "Cronograma Gantt",
      "Look-ahead 2–4 semanas",
      "Ruta crítica",
      "Restricciones de materiales y equipos",
    ],
  },
  {
    id: "compras",
    titulo: "Compras y almacén",
    descripcion:
      "Requisiciones desde obra, órdenes de compra e inventario por proyecto.",
    href: `${SICC_BASE}/compras`,
    fase: 3,
    estado: "proximamente",
    funcionalidades: [
      "Requisiciones de campo",
      "Órdenes de compra",
      "Inventario en bodega de obra",
      "Trazabilidad material–rubro",
    ],
  },
  {
    id: "calidad",
    titulo: "Calidad y HSE",
    descripcion:
      "Plan de calidad, ensayos de laboratorio, inspecciones y seguridad ocupacional.",
    href: `${SICC_BASE}/calidad`,
    fase: 2,
    estado: "proximamente",
    funcionalidades: [
      "Checklists de inspección",
      "Registro de ensayos",
      "No conformidades",
      "Accidentes y capacitaciones",
    ],
  },
  {
    id: "equipos",
    titulo: "Equipos y maquinaria",
    descripcion: "Flota propia y arrendada, horómetro y mantenimiento preventivo.",
    href: `${SICC_BASE}/equipos`,
    fase: 4,
    estado: "proximamente",
    funcionalidades: [
      "Disponibilidad por obra",
      "Costo hora-máquina",
      "Mantenimiento programado",
      "Asignación a frentes",
    ],
  },
  {
    id: "rrhh",
    titulo: "Personal de obra",
    descripcion: "Asistencia, planillas por obra y costo de mano de obra imputado.",
    href: `${SICC_BASE}/rrhh`,
    fase: 4,
    estado: "proximamente",
    funcionalidades: [
      "Cuadrillas por frente",
      "Control de asistencia",
      "Planilla por obra",
      "Capacitaciones obligatorias",
    ],
  },
  {
    id: "contratos",
    titulo: "Contratos y legal",
    descripcion: "Plazos, garantías, multas, ampliaciones y correspondencia oficial.",
    href: `${SICC_BASE}/contratos`,
    fase: 2,
    estado: "proximamente",
    funcionalidades: [
      "Garantías y fianzas",
      "Multas por atraso",
      "Órdenes de cambio",
      "Archivo de oficios",
    ],
  },
  {
    id: "finanzas",
    titulo: "Finanzas",
    descripcion: "Cuentas por cobrar/pagar, flujo de caja y retenciones por obra.",
    href: `${SICC_BASE}/finanzas`,
    fase: 3,
    estado: "proximamente",
    funcionalidades: [
      "Facturación vinculada a certificación",
      "Anticipos y amortizaciones",
      "Retenciones",
      "Flujo de caja proyectado",
    ],
  },
  {
    id: "reportes",
    titulo: "Reportes gerenciales",
    descripcion: "Panel multi-obra, KPIs y alertas para dirección de la constructora.",
    href: `${SICC_BASE}/reportes`,
    fase: 5,
    estado: "proximamente",
    funcionalidades: [
      "Dashboard corporativo",
      "Ranking de rentabilidad",
      "Alertas de desvío",
      "Histórico para licitaciones",
    ],
  },
]

export function obtenerModulo(id: ModuloId): ModuloSicc | undefined {
  return MODULOS_SICC.find((m) => m.id === id)
}

export function modulosPorFase(fase: ModuloSicc["fase"]): ModuloSicc[] {
  return MODULOS_SICC.filter((m) => m.fase === fase)
}

export function modulosActivos(): ModuloSicc[] {
  return MODULOS_SICC.filter((m) => m.estado === "activo")
}
