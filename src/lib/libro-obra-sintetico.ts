import type { TicketDesalojo, EventoParalizacion } from "@/src/data/auditoria/types"
import type { RegistroFotoBase } from "@/src/lib/evidencias-grupo"
import type { JornadaMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
import {
  detalleJornadasDia,
  formatearMetrosDesasolveResumen,
} from "@/src/lib/maquinaria-desasolve-resumen"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import {
  claveFechaLocal,
  consolidarLibroObra,
  fechasCalendarioInclusive,
  nombreDiaSemana,
  type LibroObraEntradaDia,
  type LibroObraLineaRegistro,
} from "@/src/lib/libro-obra"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

const PLANTILLA_ACTIVIDAD_DIA =
  "Actividades contractuales programadas: replanteo y nivelación, limpieza y desazolve de canales con reconformación de taludes in situ, desalojo de material excedente (rub. 3/7 según VAE) y tendido cuando aplique. Coordinación residente de obra, topografía y registro en sistema de control."

const AVISO_FOTOS_PENDIENTES =
  "Registro fotográfico: pendiente de anexo manual (cargar en módulo Fotos del proyecto)."

function lineasDesalojoDia(fecha: string, tickets: TicketDesalojo[]): LibroObraLineaRegistro[] {
  const delDia = tickets.filter((t) => claveFechaLocal(t.fecha_hora_despacho) === fecha)
  if (delDia.length === 0) return []

  const m3 = delDia.reduce((s, t) => s + t.capacidad_m3, 0)
  const placas = [...new Set(delDia.map((t) => t.placa_volqueta))].join(", ")
  return [
    {
      categoria: "desalojo",
      texto: `Desalojo: ${delDia.length} ticket(s), ${formatearNumero(m3, 0)} m³ declarados, placa(s) ${placas}.`,
    },
  ]
}

function lineasParalizacionDia(fecha: string, eventos: EventoParalizacion[]): LibroObraLineaRegistro[] {
  const lineas: LibroObraLineaRegistro[] = []
  for (const ev of eventos) {
    const inicio = claveFechaLocal(ev.fecha_inicio)
    const fin = ev.fecha_fin ? claveFechaLocal(ev.fecha_fin) : inicio
    if (fecha < inicio || fecha > fin) continue
    const texto =
      ev.texto_libro_obra?.trim() ||
      ev.descripcion?.trim() ||
      `Evento de paralización (${ev.tipo_evento}) registrado en sistema.`
    lineas.push({ categoria: "paralizacion", texto })
  }
  return lineas
}

function lineasMaquinariaDia(
  fecha: string,
  jornadas: JornadaMaquinariaProyecto[],
  equipos: ProyectoEquipoMaquinaria[]
): LibroObraLineaRegistro[] {
  const detalle = detalleJornadasDia(fecha, jornadas, equipos)
  if (detalle.equiposDistintos === 0 && detalle.incidencias === 0) return []

  const lineas: LibroObraLineaRegistro[] = [
    {
      categoria: "maquinaria",
      texto: `Maquinaria (mapa): ${detalle.equiposDistintos} equipo(s), ${formatearNumero(detalle.totalHoras, 1)} h, ${formatearMetrosDesasolveResumen(detalle.totalMetros)} desasolados.`,
    },
  ]
  for (const t of detalle.porTramo.slice(0, 6)) {
    lineas.push({
      categoria: "maquinaria",
      texto: `Tramo ${t.tramo_codigo} (${t.tramo_canal}): ${formatearMetrosDesasolveResumen(t.metros)}${t.horas > 0 ? `, ${formatearNumero(t.horas, 1)} h` : ""}.`,
    })
  }
  if (detalle.incidencias > 0) {
    lineas.push({
      categoria: "maquinaria",
      texto: `Incidencias de maquinaria registradas: ${detalle.incidencias}.`,
    })
  }
  return lineas
}

/**
 * Libro de obra del periodo de planilla: un día por fecha del rango,
 * con datos de app + plantilla; fotos se anexan cuando existan.
 */
export function consolidarLibroObraPeriodoPlanilla(
  desde: string,
  hasta: string,
  registrosFoto: RegistroFotoBase[],
  jornadas: JornadaMaquinariaProyecto[],
  tickets: TicketDesalojo[],
  eventosParalizacion: EventoParalizacion[],
  equipos: ProyectoEquipoMaquinaria[]
): LibroObraEntradaDia[] {
  const porFoto = new Map(consolidarLibroObra(registrosFoto).map((e) => [e.fecha, e]))

  return fechasCalendarioInclusive(desde, hasta).map((fecha) => {
    const base = porFoto.get(fecha)
    const evidencias = base?.evidencias ?? []

    const lineasRegistro: LibroObraLineaRegistro[] = [
      { categoria: "actividad", texto: PLANTILLA_ACTIVIDAD_DIA },
      ...lineasMaquinariaDia(fecha, jornadas, equipos),
      ...lineasDesalojoDia(fecha, tickets),
      ...lineasParalizacionDia(fecha, eventosParalizacion),
    ]

    if (evidencias.length === 0) {
      lineasRegistro.push({ categoria: "actividad", texto: AVISO_FOTOS_PENDIENTES })
    }

    return {
      fecha,
      diaSemana: nombreDiaSemana(fecha),
      evidencias,
      lineasRegistro,
    }
  })
}
