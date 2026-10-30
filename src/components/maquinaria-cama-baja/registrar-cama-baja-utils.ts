import type {
  MovimientoCamaBaja,
  MovimientoCamaBajaInput,
} from "@/src/lib/maquinaria-cama-baja-movimientos"
import { EQUIPO_OTRO_VALUE } from "@/src/components/mapa/registrar-jornada-tramo-utils"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"

export type RegistrarCamaBajaFormState = {
  fecha: string
  cama_baja: string
  maquinaSeleccionId: string
  maquinaOtroTexto: string
  origen: string
  destino: string
  duracion_horas: string
  observaciones: string
}

export function estadoInicialCamaBaja(fechaIso?: string): RegistrarCamaBajaFormState {
  const hoy = fechaIso ?? new Date().toISOString().slice(0, 10)
  return {
    fecha: hoy,
    cama_baja: "",
    maquinaSeleccionId: "",
    maquinaOtroTexto: "",
    origen: "",
    destino: "",
    duracion_horas: "",
    observaciones: "",
  }
}

export function resolverNombreMaquinaTransportada(
  state: RegistrarCamaBajaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): string {
  if (state.maquinaSeleccionId === EQUIPO_OTRO_VALUE) {
    return state.maquinaOtroTexto.trim()
  }
  const eq = equipos.find((e) => e.id === state.maquinaSeleccionId)
  return eq?.nombre.trim() ?? ""
}

export function resolverMaquinaEquipoId(state: RegistrarCamaBajaFormState): string | null {
  if (!state.maquinaSeleccionId || state.maquinaSeleccionId === EQUIPO_OTRO_VALUE) return null
  return state.maquinaSeleccionId
}

export function validarCamaBajaFormState(
  state: RegistrarCamaBajaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): string | null {
  if (!state.fecha.trim()) return "Indique la fecha del movimiento."
  if (!state.cama_baja.trim()) return "Indique el nombre o placa de la cama baja."
  if (!state.maquinaSeleccionId) return "Seleccione la máquina transportada."

  const maquina = resolverNombreMaquinaTransportada(state, equipos)
  if (!maquina) {
    return state.maquinaSeleccionId === EQUIPO_OTRO_VALUE
      ? "Escriba el nombre de la máquina transportada."
      : "La máquina seleccionada no es válida."
  }

  if (state.duracion_horas.trim()) {
    const horas = Number(state.duracion_horas.replace(",", "."))
    if (!Number.isFinite(horas) || horas < 0) return "Las horas deben ser un número válido."
  }

  return null
}

export function camaBajaInputDesdeFormState(
  state: RegistrarCamaBajaFormState,
  equipos: ProyectoEquipoMaquinaria[]
): MovimientoCamaBajaInput | null {
  const error = validarCamaBajaFormState(state, equipos)
  if (error) return null

  const maquina = resolverNombreMaquinaTransportada(state, equipos)
  let duracion: number | null = null
  if (state.duracion_horas.trim()) {
    duracion = Number(state.duracion_horas.replace(",", "."))
  }

  return {
    fecha: state.fecha,
    cama_baja: state.cama_baja.trim(),
    maquina_transportada: maquina,
    maquina_equipo_id: resolverMaquinaEquipoId(state),
    origen: state.origen.trim() || null,
    destino: state.destino.trim() || null,
    duracion_horas: duracion,
    observaciones: state.observaciones.trim() || null,
  }
}

export function camaBajaFormDesdeMovimiento(
  movimiento: MovimientoCamaBaja,
  equipos: ProyectoEquipoMaquinaria[]
): RegistrarCamaBajaFormState {
  const porId =
    movimiento.maquina_equipo_id &&
    equipos.some((e) => e.id === movimiento.maquina_equipo_id)

  return {
    fecha: movimiento.fecha,
    cama_baja: movimiento.cama_baja,
    maquinaSeleccionId: porId
      ? movimiento.maquina_equipo_id!
      : EQUIPO_OTRO_VALUE,
    maquinaOtroTexto: porId ? "" : movimiento.maquina_transportada,
    origen: movimiento.origen ?? "",
    destino: movimiento.destino ?? "",
    duracion_horas:
      movimiento.duracion_horas != null ? String(movimiento.duracion_horas) : "",
    observaciones: movimiento.observaciones ?? "",
  }
}
