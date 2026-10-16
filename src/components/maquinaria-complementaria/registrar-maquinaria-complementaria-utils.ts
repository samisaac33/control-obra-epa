import type { RegistroMaquinariaComplementaria, RegistroMaquinariaComplementariaInput } from "@/src/lib/maquinaria-complementaria"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import { EQUIPO_OTRO_VALUE } from "@/src/components/mapa/registrar-jornada-tramo-utils"

export type RegistrarComplementariaFormState = {
  fecha: string
  equipoSeleccionId: string
  equipoOtroTexto: string
  horas: string
  descripcionTrabajo: string
  ubicacionReferencia: string
  observaciones: string
}

export function estadoInicialComplementaria(fechaIso?: string): RegistrarComplementariaFormState {
  const hoy = fechaIso ?? new Date().toISOString().slice(0, 10)
  return {
    fecha: hoy,
    equipoSeleccionId: "",
    equipoOtroTexto: "",
    horas: "",
    descripcionTrabajo: "",
    ubicacionReferencia: "",
    observaciones: "",
  }
}

export function resolverNombreEquipoComplementaria(
  state: RegistrarComplementariaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): string {
  if (state.equipoSeleccionId === EQUIPO_OTRO_VALUE) {
    return state.equipoOtroTexto.trim()
  }
  const encontrado = equipos.find((e) => e.id === state.equipoSeleccionId)
  return encontrado?.nombre.trim() ?? ""
}

export function validarComplementariaFormState(
  state: RegistrarComplementariaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): string | null {
  const equipoFinal = resolverNombreEquipoComplementaria(state, equipos)

  if (!state.fecha || !state.equipoSeleccionId || !equipoFinal) {
    return "Complete fecha y equipo."
  }
  if (!state.descripcionTrabajo.trim()) {
    return "Indique la descripción del trabajo complementario."
  }

  const horasNum = state.horas.trim() ? Number(state.horas.replace(",", ".")) : null
  if (horasNum != null && (!Number.isFinite(horasNum) || horasNum < 0)) {
    return "Las horas de trabajo no son válidas."
  }

  return null
}

export function complementariaInputDesdeFormState(
  state: RegistrarComplementariaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): RegistroMaquinariaComplementariaInput | null {
  const error = validarComplementariaFormState(state, equipos)
  if (error) return null

  const horasNum = state.horas.trim() ? Number(state.horas.replace(",", ".")) : null
  const equipo = resolverNombreEquipoComplementaria(state, equipos)
  const equipoId =
    state.equipoSeleccionId === EQUIPO_OTRO_VALUE ? null : state.equipoSeleccionId

  return {
    fecha: state.fecha,
    equipo,
    equipo_id: equipoId,
    duracion_horas: horasNum,
    descripcion_trabajo: state.descripcionTrabajo.trim(),
    ubicacion_referencia: state.ubicacionReferencia.trim() || null,
    observaciones: state.observaciones.trim() || null,
  }
}

export function complementariaFormDesdeRegistro(
  registro: RegistroMaquinariaComplementaria,
  equipos: ProyectoEquipoMaquinaria[]
): RegistrarComplementariaFormState {
  let equipoSeleccionId = ""
  let equipoOtroTexto = ""

  if (registro.equipo_id && equipos.some((e) => e.id === registro.equipo_id)) {
    equipoSeleccionId = registro.equipo_id
  } else {
    const porNombre = equipos.find(
      (e) => e.nombre.trim().toLowerCase() === registro.equipo.trim().toLowerCase()
    )
    if (porNombre) {
      equipoSeleccionId = porNombre.id
    } else {
      equipoSeleccionId = EQUIPO_OTRO_VALUE
      equipoOtroTexto = registro.equipo
    }
  }

  return {
    fecha: registro.fecha,
    equipoSeleccionId,
    equipoOtroTexto,
    horas: registro.duracion_horas != null ? String(registro.duracion_horas) : "",
    descripcionTrabajo: registro.descripcion_trabajo,
    ubicacionReferencia: registro.ubicacion_referencia ?? "",
    observaciones: registro.observaciones ?? "",
  }
}
