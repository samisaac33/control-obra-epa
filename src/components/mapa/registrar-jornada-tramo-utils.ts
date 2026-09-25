import type { TramoRegistroMaquinariaInput } from "@/src/lib/tramo-maquinaria-historial"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"

export const EQUIPO_OTRO_VALUE = "__otro__"

export type RegistrarJornadaFormState = {
  fecha: string
  metros: string
  equipoSeleccionId: string
  equipoOtroTexto: string
  horas: string
  observaciones: string
}

export function estadoInicialJornada(fechaIso?: string): RegistrarJornadaFormState {
  const hoy = fechaIso ?? new Date().toISOString().slice(0, 10)
  return {
    fecha: hoy,
    metros: "",
    equipoSeleccionId: "",
    equipoOtroTexto: "",
    horas: "",
    observaciones: "",
  }
}

export function resolverNombreEquipoJornada(
  state: RegistrarJornadaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): string {
  if (state.equipoSeleccionId === EQUIPO_OTRO_VALUE) {
    return state.equipoOtroTexto.trim()
  }
  const encontrado = equipos.find((e) => e.id === state.equipoSeleccionId)
  return encontrado?.nombre.trim() ?? ""
}

export function validarJornadaFormState(
  state: RegistrarJornadaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): string | null {
  const equipoFinal = resolverNombreEquipoJornada(state, equipos)
  const metrosNum = Number(state.metros.replace(",", "."))

  if (!state.fecha || !state.equipoSeleccionId || !equipoFinal) {
    return "Complete fecha y equipo de la jornada."
  }
  if (!Number.isFinite(metrosNum) || metrosNum < 0) {
    return "Indique metros desasolados válidos."
  }

  const horasNum = state.horas.trim() ? Number(state.horas.replace(",", ".")) : null
  if (horasNum != null && (!Number.isFinite(horasNum) || horasNum < 0)) {
    return "Las horas de trabajo no son válidas."
  }

  return null
}

export function jornadaInputDesdeFormState(
  state: RegistrarJornadaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): TramoRegistroMaquinariaInput | null {
  const error = validarJornadaFormState(state, equipos)
  if (error) return null

  const metrosNum = Number(state.metros.replace(",", "."))
  const horasNum = state.horas.trim() ? Number(state.horas.replace(",", ".")) : null
  const equipo = resolverNombreEquipoJornada(state, equipos)

  return {
    fecha: state.fecha,
    metros_desasolados: metrosNum,
    equipo,
    duracion_horas: horasNum,
    observaciones: state.observaciones.trim() || null,
  }
}
