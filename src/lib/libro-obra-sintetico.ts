import type { Rubro } from "@/data/presupuesto"
import type { TicketDesalojo, EventoParalizacion } from "@/src/data/auditoria/types"
import {
  frenteLibroObra,
  frentesLibroObraProyecto,
  type LibroObraFrenteId,
} from "@/src/data/planilla/libro-obra-frentes"
import type { PlanillaNumero, PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import type { RegistroFotoBase } from "@/src/lib/evidencias-grupo"
import {
  cronogramaLibroObraFrente,
  type DiaCronogramaFrente,
} from "@/src/lib/libro-obra-cronograma-frente"
import {
  bloqueSeverinoProgramaticoDia,
  hitosSeverinoPorFechaPlanilla,
} from "@/src/lib/libro-obra-cronograma-severino"
import { enriquecerFormatoEpaProgramatico } from "@/src/lib/libro-obra-epa-enriquecimiento-dia"
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
import {
  armarTrabajosConsolidadosDesdeBloques,
  combinarDatosHojaLibroObraEpa,
} from "@/src/lib/libro-obra-epa-consolidado"
import { armarDatosHojaLibroObraEpa } from "@/src/lib/libro-obra-epa-datos"
import {
  etiquetaResidenteFrente,
} from "@/src/data/planilla/libro-obra-frentes"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

const AVISO_FOTOS_PENDIENTES =
  "Registro fotográfico: pendiente (cargar en módulo Fotos del proyecto)."

export type LibroObraPorFrente = Partial<Record<LibroObraFrenteId, LibroObraEntradaDia[]>>

function lineasDesalojoDia(fecha: string, tickets: TicketDesalojo[]): LibroObraLineaRegistro[] {
  const delDia = tickets.filter((t) => claveFechaLocal(t.fecha_hora_despacho) === fecha)
  if (delDia.length === 0) return []

  const m3 = delDia.reduce((s, t) => s + t.capacidad_m3, 0)
  const placas = [...new Set(delDia.map((t) => t.placa_volqueta))].join(", ")
  return [
    {
      categoria: "desalojo",
      texto: `Desalojo registrado: ${delDia.length} ticket(s), ${formatearNumero(m3, 0)} m³, placa(s) ${placas}.`,
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
      `Paralización (${ev.tipo_evento}) registrada en sistema.`
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
      texto: `Registro GPS/mapa: ${detalle.equiposDistintos} equipo(s), ${formatearNumero(detalle.totalHoras, 1)} h, ${formatearMetrosDesasolveResumen(detalle.totalMetros)}.`,
    },
  ]
  for (const t of detalle.porTramo.slice(0, 8)) {
    lineas.push({
      categoria: "maquinaria",
      texto: `Tramo ${t.tramo_codigo} (${t.tramo_canal}): ${formatearMetrosDesasolveResumen(t.metros)}${t.horas > 0 ? `, ${formatearNumero(t.horas, 1)} h` : ""}.`,
    })
  }
  if (detalle.incidencias > 0) {
    lineas.push({
      categoria: "maquinaria",
      texto: `Incidencias de maquinaria: ${detalle.incidencias}.`,
    })
  }
  return lineas
}

function diaTieneProduccion(
  cronograma: DiaCronogramaFrente | undefined,
  lineas: LibroObraLineaRegistro[]
): boolean {
  if (cronograma && cronograma.actividades.length > 0) return true
  return lineas.some((l) => l.categoria === "maquinaria" || l.categoria === "desalojo")
}

function consolidarFrente(
  frenteId: LibroObraFrenteId,
  desde: string,
  hasta: string,
  registrosFoto: RegistroFotoBase[],
  jornadas: JornadaMaquinariaProyecto[],
  tickets: TicketDesalojo[],
  eventosParalizacion: EventoParalizacion[],
  equipos: ProyectoEquipoMaquinaria[],
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero
): LibroObraEntradaDia[] {
  const cfg = frenteLibroObra(frenteId)
  const porFoto = new Map(consolidarLibroObra(registrosFoto).map((e) => [e.fecha, e]))
  const cronograma = cronogramaLibroObraFrente(
    frenteId,
    desde,
    hasta,
    rubros,
    config,
    periodo,
    planillaNumero,
    cfg.rubDesazolve
  )
  const cronogramaPorFecha = new Map(cronograma.map((d) => [d.fecha, d]))

  const entradas: LibroObraEntradaDia[] = []

  for (const fecha of fechasCalendarioInclusive(desde, hasta)) {
    const cronogramaDia = cronogramaPorFecha.get(fecha)
    const evidencias = porFoto.get(fecha)?.evidencias ?? []

    const lineasRegistro: LibroObraLineaRegistro[] = [
      ...lineasMaquinariaDia(fecha, jornadas, equipos),
      ...(frenteId === "trasvase" ? lineasDesalojoDia(fecha, tickets) : []),
      ...lineasParalizacionDia(fecha, eventosParalizacion),
    ]

    if (!diaTieneProduccion(cronogramaDia, lineasRegistro)) {
      continue
    }

    if (evidencias.length === 0) {
      lineasRegistro.push({ categoria: "actividad", texto: AVISO_FOTOS_PENDIENTES })
    }

    entradas.push({
      fecha,
      diaSemana: nombreDiaSemana(fecha),
      evidencias,
      lineasRegistro,
      frenteId,
      formatoEpa: armarDatosHojaLibroObraEpa(fecha, lineasRegistro, jornadas, equipos, {
        evidencias,
        cronogramaDia: cronogramaDia ?? null,
        frenteTitulo: cfg.titulo,
        rubDesazolve: cfg.rubDesazolve,
        rubDesalojo: cfg.rubDesalojo,
        rubTendido: cfg.rubTendido,
        ticketsDesalojoDia:
          frenteId === "trasvase"
            ? tickets.filter((t) => claveFechaLocal(t.fecha_hora_despacho) === fecha)
            : [],
      }),
    })
  }

  return entradas
}

/** Una hoja EPA por día: bloques Trasvase + San Antonio; Severino solo en hitos programados. */
export function consolidarLibroObraPeriodoPlanillaConsolidado(
  proyectoId: string,
  desde: string,
  hasta: string,
  registrosFoto: RegistroFotoBase[],
  jornadas: JornadaMaquinariaProyecto[],
  tickets: TicketDesalojo[],
  eventosParalizacion: EventoParalizacion[],
  equipos: ProyectoEquipoMaquinaria[],
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero
): LibroObraEntradaDia[] {
  const porFoto = new Map(consolidarLibroObra(registrosFoto).map((e) => [e.fecha, e]))
  const cronogramasPorFrente = new Map<LibroObraFrenteId, Map<string, DiaCronogramaFrente>>()

  for (const f of frentesLibroObraProyecto(proyectoId)) {
    const cfg = frenteLibroObra(f.id)
    const cronograma = cronogramaLibroObraFrente(
      f.id,
      desde,
      hasta,
      rubros,
      config,
      periodo,
      planillaNumero,
      cfg.rubDesazolve
    )
    cronogramasPorFrente.set(f.id, new Map(cronograma.map((d) => [d.fecha, d])))
  }

  const entradas: LibroObraEntradaDia[] = []
  const hitosSeverino = hitosSeverinoPorFechaPlanilla(periodo, planillaNumero)

  for (const fecha of fechasCalendarioInclusive(desde, hasta)) {
    const evidencias = porFoto.get(fecha)?.evidencias ?? []
    const lineasRegistro: LibroObraLineaRegistro[] = [
      ...lineasMaquinariaDia(fecha, jornadas, equipos),
      ...lineasDesalojoDia(fecha, tickets),
      ...lineasParalizacionDia(fecha, eventosParalizacion),
    ]

    const partesDatos = []
    const bloquesFrente = []

    for (const f of frentesLibroObraProyecto(proyectoId)) {
      const cfg = frenteLibroObra(f.id)
      const cronogramaDia = cronogramasPorFrente.get(f.id)?.get(fecha)
      const tieneCronograma = (cronogramaDia?.actividades.length ?? 0) > 0
      if (!tieneCronograma) continue

      const datosFrente = armarDatosHojaLibroObraEpa(fecha, [], [], [], {
        evidencias: [],
        cronogramaDia: cronogramaDia ?? null,
        frenteTitulo: cfg.titulo,
        rubDesazolve: cfg.rubDesazolve,
        rubDesalojo: cfg.rubDesalojo,
        rubTendido: cfg.rubTendido,
        soloProgramatico: true,
      })

      partesDatos.push(datosFrente)
      bloquesFrente.push({
        id: f.id,
        titulo: cfg.titulo,
        residente: etiquetaResidenteFrente(proyectoId, f.id),
        trabajosRealizados: datosFrente.trabajosRealizados,
      })
    }

    const hayProduccionCivil = partesDatos.length > 0
    const bloqueSeverino = bloqueSeverinoProgramaticoDia(
      fecha,
      hitosSeverino,
      proyectoId,
      rubros,
      planillaNumero
    )

    if (!hayProduccionCivil) {
      continue
    }

    let formatoEpa = combinarDatosHojaLibroObraEpa(partesDatos)
    formatoEpa = {
      ...formatoEpa,
      bloquesFrente: bloquesFrente,
      bloqueSeverino,
      registroCampoDia: undefined,
      visitaProyecto: bloquesFrente
        .map((b) => `${b.titulo} (${b.residente})`)
        .concat(bloqueSeverino ? [`${bloqueSeverino.titulo} (${bloqueSeverino.residente})`] : [])
        .join("; "),
      trabajosRealizados: armarTrabajosConsolidadosDesdeBloques(bloquesFrente, bloqueSeverino, ""),
    }

    const tramosActivos = bloquesFrente.reduce((n, b) => {
      const m = b.trabajosRealizados.match(/- Tramo «/g)
      return n + (m?.length ?? 0)
    }, 0)
    formatoEpa = enriquecerFormatoEpaProgramatico(formatoEpa, {
      fecha,
      excavadoras:
        formatoEpa.equiposUtilizados.find((e) => e.etiqueta === "EXCAVADORAS")?.cantidad ?? 0,
      volquetas: formatoEpa.equiposUtilizados.find((e) => e.etiqueta === "VOLQUETAS")?.cantidad ?? 0,
      tieneSeverino: Boolean(bloqueSeverino),
      tramosActivos: Math.max(tramosActivos, 1),
    })

    if (evidencias.length === 0) {
      lineasRegistro.push({ categoria: "actividad", texto: AVISO_FOTOS_PENDIENTES })
    }

    entradas.push({
      fecha,
      diaSemana: nombreDiaSemana(fecha),
      evidencias,
      lineasRegistro,
      formatoEpa,
    })
  }

  return entradas
}

export function consolidarLibroObraPeriodoPlanillaPorFrentes(
  proyectoId: string,
  desde: string,
  hasta: string,
  registrosFoto: RegistroFotoBase[],
  jornadas: JornadaMaquinariaProyecto[],
  tickets: TicketDesalojo[],
  eventosParalizacion: EventoParalizacion[],
  equipos: ProyectoEquipoMaquinaria[],
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero
): LibroObraPorFrente {
  const out: LibroObraPorFrente = {}
  for (const f of frentesLibroObraProyecto(proyectoId)) {
    out[f.id] = consolidarFrente(
      f.id,
      desde,
      hasta,
      registrosFoto,
      jornadas,
      tickets,
      eventosParalizacion,
      equipos,
      rubros,
      config,
      periodo,
      planillaNumero
    )
  }
  return out
}

/** Compatibilidad: libro único = frente Trasvase. */
export function consolidarLibroObraPeriodoPlanilla(
  desde: string,
  hasta: string,
  registrosFoto: RegistroFotoBase[],
  jornadas: JornadaMaquinariaProyecto[],
  tickets: TicketDesalojo[],
  eventosParalizacion: EventoParalizacion[],
  equipos: ProyectoEquipoMaquinaria[],
  opts?: {
    rubros?: Rubro[]
    config?: ProyectoPlanillaConfig
    periodo?: PlanillaPeriodo
    planillaNumero?: PlanillaNumero
    proyectoId?: string
  }
): LibroObraEntradaDia[] {
  if (opts?.rubros && opts.config && opts.periodo && opts.planillaNumero && opts.proyectoId) {
    return consolidarLibroObraPeriodoPlanillaConsolidado(
      opts.proyectoId,
      desde,
      hasta,
      registrosFoto,
      jornadas,
      tickets,
      eventosParalizacion,
      equipos,
      opts.rubros,
      opts.config,
      opts.periodo,
      opts.planillaNumero
    )
  }

  const porFoto = new Map(consolidarLibroObra(registrosFoto).map((e) => [e.fecha, e]))
  return fechasCalendarioInclusive(desde, hasta).map((fecha) => {
    const evidencias = porFoto.get(fecha)?.evidencias ?? []
    const lineasRegistro: LibroObraLineaRegistro[] = [
      ...lineasMaquinariaDia(fecha, jornadas, equipos),
      ...lineasDesalojoDia(fecha, tickets),
      ...lineasParalizacionDia(fecha, eventosParalizacion),
    ]
    return {
      fecha,
      diaSemana: nombreDiaSemana(fecha),
      evidencias,
      lineasRegistro,
      formatoEpa: armarDatosHojaLibroObraEpa(fecha, lineasRegistro, jornadas, equipos, { evidencias }),
    }
  })
}
