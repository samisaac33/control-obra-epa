/** Filas preimpresas del formulario EPA (libro de obra). */

export const PROVINCIA_LIBRO_OBRA_EPA = "MANABÍ"

export const FILAS_EQUIPOS_UTILIZADOS_EPA = [
  "EXCAVADORAS",
  "VOLQUETAS",
  "RTK",
  "CAMA BAJA / PLATAFORMA",
  "CAMIONETA",
] as const

export const FILAS_PERSONAL_UTILIZADO_EPA = [
  "OPERADORES",
  "CHOFERES",
  "RESIDENTES",
  "TOPÓGRAFOS",
  "CADENERO",
] as const

export type FilaCantidadEpa = {
  etiqueta: string
  cantidad: number | null
}

export type FilaHorasEquipoEpa = {
  equipo: string
  manana: string
  tarde: string
  total: string
}

export type BloqueLibroObraFrenteEpa = {
  id: string
  titulo: string
  residente: string
  trabajosRealizados: string
}

export type BloqueLibroObraSeverinoEpa = {
  titulo: string
  residente: string
  trabajosRealizados: string
}

export type DatosHojaLibroObraEpa = {
  equiposUtilizados: FilaCantidadEpa[]
  personalUtilizado: FilaCantidadEpa[]
  trabajosRealizados: string
  horasEquipos: FilaHorasEquipoEpa[]
  visitaProyecto: string
  novedadesObservaciones: string
  comunicaciones: string
  clima: { manana: string; tarde: string; noche: string }
  /** Libro consolidado: un bloque por frente civil con producción ese día. */
  bloquesFrente?: BloqueLibroObraFrenteEpa[]
  bloqueSeverino?: BloqueLibroObraSeverinoEpa | null
  /** Maquinaria / desalojo / paralización del día (fuera de cronograma VAE). */
  registroCampoDia?: string
}
