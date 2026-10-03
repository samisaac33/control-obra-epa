import type { CanalTramo } from "@/src/data/tramos/types"
import type { TramoRegistroMaquinaria, TramoRegistroMaquinariaInput } from "@/src/lib/tramo-maquinaria-historial"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

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
    return "Indique metros desazolvados válidos."
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

  const equipoId =
    state.equipoSeleccionId === EQUIPO_OTRO_VALUE ? null : state.equipoSeleccionId

  return {
    fecha: state.fecha,
    metros_desasolados: metrosNum,
    equipo,
    equipo_id: equipoId,
    duracion_horas: horasNum,
    observaciones: state.observaciones.trim() || null,
  }
}

function fechaIsoDesdeCreatedAt(createdAt: string): string {
  return createdAt.slice(0, 10)
}

export function jornadaFormDesdeRegistro(
  registro: TramoRegistroMaquinaria,
  equipos: ProyectoEquipoMaquinaria[]
): RegistrarJornadaFormState {
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
    metros: String(registro.metros_desasolados),
    equipoSeleccionId,
    equipoOtroTexto,
    horas: registro.duracion_horas != null ? String(registro.duracion_horas) : "",
    observaciones: registro.observaciones ?? "",
  }
}

function registroCoincideLegacy(
  registro: TramoRegistroMaquinaria,
  puntoFin: TramoPuntoAvance,
  longitudMinitramo_m: number
): boolean {
  if (registro.punto_avance_id && registro.punto_avance_id !== puntoFin.id) return false

  const fechaPunto = fechaIsoDesdeCreatedAt(puntoFin.created_at)
  if (registro.fecha === fechaPunto) return true

  if (longitudMinitramo_m <= 0) return false
  const tolerancia = Math.max(1, longitudMinitramo_m * 0.05)
  return Math.abs(registro.metros_desasolados - longitudMinitramo_m) <= tolerancia
}

/** Busca jornada antigua sin punto_avance_id vinculado a este punto final. */
export function buscarRegistroJornadaLegacyParaPunto(
  _tramo: Pick<CanalTramo, "id">,
  puntoFin: TramoPuntoAvance,
  registrosTramo: TramoRegistroMaquinaria[],
  longitudMinitramo_m: number
): TramoRegistroMaquinaria | null {
  const candidatos = registrosTramo.filter(
    (r) =>
      !r.punto_avance_id &&
      registroCoincideLegacy(r, puntoFin, longitudMinitramo_m)
  )

  if (candidatos.length === 1) return candidatos[0]!
  return null
}
