import {
  ajustarDiaLaborable,
  esDiaLaborable,
  isoDeFecha,
  parseIsoLocal,
} from "@/src/data/feriados-ecuador"
import type { RelojPublicoInformeFila } from "@/src/data/infimas/reloj-publico-types"

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const

export type EstadoEngrasada = {
  ultimaEngrasada: string | null
}

const ACTIVIDAD_BASE = `Limpieza total del reloj (ruedas, engranajes, cuerdas, pesas).
Suministro de cuerda a las pesas, campanas y reloj.`

const TEXTO_CARRETES =
  "Limpieza y engrasada de cuerdas aceradas en cada carrete actividad que se realizó durante los días"

function nombreDia(fecha: Date): string {
  const nombres = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
  return nombres[fecha.getDay()]
}

function formatearDiaObs(fecha: Date): string {
  return `${nombreDia(fecha)} ${fecha.getDate()}`
}

function lunesDeSemana(fecha: Date): Date {
  const d = new Date(fecha)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function domingoDeSemana(lunes: Date): Date {
  const d = new Date(lunes)
  d.setDate(d.getDate() + 6)
  return d
}

function etiquetaSemana(lunes: Date, domingo: Date): string {
  const iniMes = MESES_CORTOS[lunes.getMonth()]
  const finMes = MESES_CORTOS[domingo.getMonth()]
  if (iniMes === finMes) {
    return `${lunes.getDate()} ${iniMes} - ${domingo.getDate()} ${finMes}`
  }
  return `${lunes.getDate()} ${iniMes} - ${domingo.getDate()} ${finMes}`
}

function semanasCalendarioEnPeriodo(inicioIso: string, finIso: string): { lunes: Date; domingo: Date }[] {
  const inicio = parseIsoLocal(inicioIso)
  const fin = parseIsoLocal(finIso)
  const semanas: { lunes: Date; domingo: Date }[] = []
  let lunes = lunesDeSemana(inicio)

  while (lunes <= fin) {
    const domingo = domingoDeSemana(lunes)
    if (domingo >= inicio) {
      semanas.push({ lunes: new Date(lunes), domingo: new Date(domingo) })
    }
    lunes = new Date(lunes)
    lunes.setDate(lunes.getDate() + 7)
  }

  return semanas
}

function diasEnRango(inicio: Date, fin: Date): Date[] {
  const dias: Date[] = []
  const cursor = new Date(inicio)
  while (cursor <= fin) {
    dias.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dias
}

function diaEnPeriodo(fecha: Date, inicio: Date, fin: Date): boolean {
  return fecha >= inicio && fecha <= fin
}

function aceitadaEnSemana(lunes: Date, domingo: Date, inicio: Date, fin: Date): Date[] {
  const objetivos = [1, 4] // lunes y jueves
  const resultados: Date[] = []

  for (const targetDay of objetivos) {
    const candidato = new Date(lunes)
    const offset = targetDay - lunes.getDay()
    candidato.setDate(candidato.getDate() + (offset < 0 ? offset + 7 : offset))
    if (candidato > domingo) continue
    if (!diaEnPeriodo(candidato, inicio, fin)) continue

    let dia = new Date(candidato)
    if (!esDiaLaborable(dia)) {
      const ajustado = ajustarDiaLaborable(dia, 2)
      if (!ajustado || ajustado > domingo || !diaEnPeriodo(ajustado, inicio, fin)) continue
      dia = ajustado
    }
    if (dia.getDay() >= 1 && dia.getDay() <= 5) {
      resultados.push(dia)
    }
  }

  return resultados.sort((a, b) => a.getTime() - b.getTime())
}

function planificarEngrasadasPeriodo(
  inicioIso: string,
  finIso: string,
  estado: EstadoEngrasada
): { fechas: Date[]; estado: EstadoEngrasada } {
  const inicio = parseIsoLocal(inicioIso)
  const fin = parseIsoLocal(finIso)
  const fechas: Date[] = []
  let ultima = estado.ultimaEngrasada ? parseIsoLocal(estado.ultimaEngrasada) : null

  if (!ultima) {
    let cursor = new Date(inicio)
    while (cursor <= fin) {
      if (cursor.getDay() === 3 && esDiaLaborable(cursor) && diaEnPeriodo(cursor, inicio, fin)) {
        fechas.push(new Date(cursor))
        ultima = new Date(cursor)
        break
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    if (!ultima) {
      cursor = new Date(inicio)
      while (cursor <= fin) {
        if (esDiaLaborable(cursor)) {
          fechas.push(new Date(cursor))
          ultima = new Date(cursor)
          break
        }
        cursor.setDate(cursor.getDate() + 1)
      }
    }
  }

  if (!ultima) {
    return { fechas, estado: { ultimaEngrasada: null } }
  }

  while (true) {
    const candidatoBase = new Date(ultima)
    candidatoBase.setDate(candidatoBase.getDate() + 15)
    const ajustado = ajustarDiaLaborable(candidatoBase, 3)
    if (!ajustado) break
    if (ajustado > fin) break
    if (ajustado < inicio) {
      ultima = ajustado
      continue
    }
    fechas.push(new Date(ajustado))
    ultima = ajustado
  }

  return {
    fechas,
    estado: { ultimaEngrasada: isoDeFecha(ultima) },
  }
}

function contarLaborablesEnPeriodo(lunes: Date, domingo: Date, inicio: Date, fin: Date): number {
  return diasEnRango(lunes, domingo).filter((d) => diaEnPeriodo(d, inicio, fin) && esDiaLaborable(d)).length
}

function elegirSemanaCarretes(
  semanas: { lunes: Date; domingo: Date }[],
  inicio: Date,
  fin: Date
): { lunes: Date; domingo: Date } | null {
  if (semanas.length === 0) return null

  const conConteo = semanas.map((s) => ({
    ...s,
    laborables: contarLaborablesEnPeriodo(s.lunes, s.domingo, inicio, fin),
  }))

  const ultima = conConteo[conConteo.length - 1]
  if (ultima.laborables >= 4) return { lunes: ultima.lunes, domingo: ultima.domingo }

  if (conConteo.length >= 2) {
    const penultima = conConteo[conConteo.length - 2]
    if (penultima.laborables >= 4) return { lunes: penultima.lunes, domingo: penultima.domingo }
  }

  return { lunes: ultima.lunes, domingo: ultima.domingo }
}

function tresDiasCarretes(lunes: Date, domingo: Date, inicio: Date, fin: Date): Date[] {
  const dias = diasEnRango(lunes, domingo).filter((d) => diaEnPeriodo(d, inicio, fin) && esDiaLaborable(d))
  for (let i = 0; i <= dias.length - 3; i++) {
    const a = dias[i]
    const b = dias[i + 1]
    const c = dias[i + 2]
    const diff1 = (b.getTime() - a.getTime()) / 86400000
    const diff2 = (c.getTime() - b.getTime()) / 86400000
    if (diff1 === 1 && diff2 === 1) {
      return [a, b, c]
    }
  }
  return dias.slice(0, 3)
}

function fechasEnSemana(fechas: Date[], lunes: Date, domingo: Date): Date[] {
  return fechas.filter((f) => f >= lunes && f <= domingo)
}

function formatearListaDias(fechas: Date[]): string {
  if (fechas.length === 0) return ""
  if (fechas.length === 1) return formatearDiaObs(fechas[0])
  if (fechas.length === 2) return `${formatearDiaObs(fechas[0])} y ${formatearDiaObs(fechas[1])}`
  return `${fechas.slice(0, -1).map(formatearDiaObs).join(", ")} y ${formatearDiaObs(fechas[fechas.length - 1])}`
}

export function generarInformePeriodo(
  inicioIso: string,
  finIso: string,
  estadoEngrasada: EstadoEngrasada
): { filas: RelojPublicoInformeFila[]; estadoEngrasada: EstadoEngrasada } {
  const inicio = parseIsoLocal(inicioIso)
  const fin = parseIsoLocal(finIso)
  const semanas = semanasCalendarioEnPeriodo(inicioIso, finIso)
  const { fechas: engrasadas, estado } = planificarEngrasadasPeriodo(inicioIso, finIso, estadoEngrasada)
  const semCarretes = elegirSemanaCarretes(semanas, inicio, fin)
  const diasCarretes = semCarretes ? tresDiasCarretes(semCarretes.lunes, semCarretes.domingo, inicio, fin) : []

  const filas: RelojPublicoInformeFila[] = semanas.map(({ lunes, domingo }) => {
    const aceites = aceitadaEnSemana(lunes, domingo, inicio, fin)
    const engrasadasSem = fechasEnSemana(engrasadas, lunes, domingo)
    const partes: string[] = []

    if (aceites.length > 0) {
      partes.push(`Aceitada de ruedas ${formatearListaDias(aceites)}.`)
    }
    if (engrasadasSem.length > 0) {
      partes.push(`Engrasada de ruedas ${formatearListaDias(engrasadasSem)}.`)
    }

    const esSemanaCarretes =
      semCarretes &&
      lunes.getTime() === semCarretes.lunes.getTime() &&
      domingo.getTime() === semCarretes.domingo.getTime()

    if (esSemanaCarretes && diasCarretes.length >= 3) {
      partes.push(`${TEXTO_CARRETES} ${formatearListaDias(diasCarretes)}.`)
    }

    return {
      semanaLabel: etiquetaSemana(lunes, domingo),
      anio: lunes.getFullYear(),
      actividad: ACTIVIDAD_BASE,
      observacion: partes.join("\n"),
    }
  })

  return { filas, estadoEngrasada: estado }
}

export function generarFilasInformeEncadenado(
  periodos: { inicio: string; fin: string }[]
): { filasPorPeriodo: RelojPublicoInformeFila[][]; estadoFinal: EstadoEngrasada } {
  let estado: EstadoEngrasada = { ultimaEngrasada: null }
  const filasPorPeriodo: RelojPublicoInformeFila[][] = []

  for (const p of periodos) {
    const result = generarInformePeriodo(p.inicio, p.fin, estado)
    filasPorPeriodo.push(result.filas)
    estado = result.estadoEngrasada
  }

  return { filasPorPeriodo, estadoFinal: estado }
}
