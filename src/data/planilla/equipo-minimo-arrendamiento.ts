/**
 * Compromisos de arrendamiento / disponibilidad — oferta Consorcio STH Manabí.
 * Contrato EPA-EPA-2026-00134-RES-001 · octubre 2026.
 */

export const CONTRATO_REFERENCIA_OFERTA = "EPA-EPA-2026-00134-RES-001"

export const CONSORCIO_OFERENTE = {
  razonSocial: "CONSORCIO STH MANABI",
  ruc: "1391940120001",
} as const

export type CategoriaEquipoMinimo =
  | "topografia"
  | "desazolve"
  | "desalojo"
  | "tendido"
  | "pruebas_electricas_severino"

export type EquipoMinimoArrendamiento = {
  id: string
  categoria: CategoriaEquipoMinimo
  nombre: string
  cantidad: number
  marca?: string
  modelo?: string
  placa?: string
  detalle?: string
  arrendador: string
  arrendadorRuc?: string
  arrendadorCedula?: string
  fechaCompromiso?: string
  rubrosRelacionados?: number[]
}

export const EQUIPO_MINIMO_ARRENDAMIENTO: EquipoMinimoArrendamiento[] = [
  {
    id: "topo-estacion-sokkia",
    categoria: "topografia",
    nombre: "Estación total",
    cantidad: 1,
    marca: "SOKKIA",
    modelo: "CX-107",
    detalle:
      "Trípode aluminio, 2 juegos de bastón, soporte y prisma. Operador: topógrafo de obra.",
    arrendador: "Yandry Patricio Chancay García",
    arrendadorCedula: "1309566824",
    fechaCompromiso: "2026-10-16",
    rubrosRelacionados: [1, 5],
  },
  {
    id: "topo-gps-fjd",
    categoria: "topografia",
    nombre: "GPS GNSS RTK",
    cantidad: 1,
    marca: "FJD",
    modelo: "V10t base / V10i rover + E800",
    detalle:
      "Kit RTK UHF, controlador, licencias TRION SURVEY y FGO, nube FJD Trion Survey.",
    arrendador: "Yandry Patricio Chancay García",
    arrendadorCedula: "1309566824",
    fechaCompromiso: "2026-10-16",
    rubrosRelacionados: [1, 5],
  },
  {
    id: "exc-doosan-225",
    categoria: "desazolve",
    nombre: "Excavadora de oruga",
    cantidad: 1,
    marca: "DOOSAN",
    modelo: "SOLAR 225 LC",
    placa: "7.1-13-002238",
    arrendador: "Rosa Moreira Sornoza",
    arrendadorRuc: "1303632366001",
    fechaCompromiso: "2026-10-16",
    rubrosRelacionados: [2, 6],
  },
  {
    id: "exc-volvo-ec210",
    categoria: "desazolve",
    nombre: "Excavadora de oruga",
    cantidad: 1,
    marca: "VOLVO",
    modelo: "EC210BLR",
    placa: "7.1-13-001853",
    arrendador: "Rosa Moreira Sornoza",
    arrendadorRuc: "1303632366001",
    fechaCompromiso: "2026-10-16",
    rubrosRelacionados: [2, 6],
  },
  {
    id: "volqueta-mack",
    categoria: "desalojo",
    nombre: "Volqueta",
    cantidad: 1,
    marca: "MACK",
    modelo: "DM690S",
    placa: "MBA8941",
    detalle: "Capacidad referencial 27 t (compromiso de arrendamiento).",
    arrendador: "Rosa Moreira Sornoza",
    arrendadorRuc: "1303632366001",
    fechaCompromiso: "2026-10-16",
    rubrosRelacionados: [3, 7],
  },
  {
    id: "tractor-d7g",
    categoria: "tendido",
    nombre: "Tractor de oruga",
    cantidad: 1,
    marca: "CATERPILLAR",
    modelo: "D7G",
    placa: "3.2-13-000597",
    arrendador: "Rosa Moreira Sornoza",
    arrendadorRuc: "1303632366001",
    fechaCompromiso: "2026-10-16",
    rubrosRelacionados: [4, 8],
  },
  {
    id: "moto-niveladora-120g",
    categoria: "tendido",
    nombre: "Motoniveladora",
    cantidad: 1,
    marca: "CATERPILLAR",
    modelo: "120G",
    placa: "6.0-13-003288",
    arrendador: "Rosa Moreira Sornoza",
    arrendadorRuc: "1303632366001",
    fechaCompromiso: "2026-10-16",
    rubrosRelacionados: [4, 8],
  },
  {
    id: "ttr-metrel",
    categoria: "pruebas_electricas_severino",
    nombre: "Medidor TTR y resistencia óhmica de devanados",
    cantidad: 1,
    marca: "METREL",
    modelo: "MI 3280 DT",
    detalle: "Relación de transformación, fase, corriente de excitación; IP65.",
    arrendador: "ELECTRIC-TRANSFORMER S.A.S.",
    arrendadorRuc: "0993391765001",
    fechaCompromiso: "2026-10-20",
    rubrosRelacionados: [9, 17],
  },
  {
    id: "megger-mit1020",
    categoria: "pruebas_electricas_severino",
    nombre: "Megóhmetro",
    cantidad: 1,
    marca: "MEGGER",
    modelo: "MIT 1020",
    detalle: "Prueba CC hasta 10 kV; IP y DAR; terminal de guarda.",
    arrendador: "PORTOTRANSFORMADORES S.A.",
    arrendadorRuc: "1391830564001",
    fechaCompromiso: "2026-10-20",
    rubrosRelacionados: [9, 17],
  },
]

export function equipoMinimoPorCategoria(
  categoria: CategoriaEquipoMinimo
): EquipoMinimoArrendamiento[] {
  return EQUIPO_MINIMO_ARRENDAMIENTO.filter((e) => e.categoria === categoria)
}

export function equipoMinimoPorRubro(rubroId: number): EquipoMinimoArrendamiento[] {
  return EQUIPO_MINIMO_ARRENDAMIENTO.filter((e) => e.rubrosRelacionados?.includes(rubroId))
}
