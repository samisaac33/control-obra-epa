import {
  FILAS_EQUIPOS_UTILIZADOS_EPA,
  FILAS_PERSONAL_UTILIZADO_EPA,
  type DatosHojaLibroObraEpa,
  type FilaCantidadEpa,
  type FilaHorasEquipoEpa,
} from "@/src/data/libro-obra-formato-epa"
import type { LibroObraLineaRegistro } from "@/src/lib/libro-obra"
import type { JornadaMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
import { detalleJornadasDia } from "@/src/lib/maquinaria-desasolve-resumen"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { nombreEquipoParaMostrar, mapaEquiposPorId } from "@/src/lib/tramo-maquinaria-historial"

function clasificarEquipoEpa(nombre: string): (typeof FILAS_EQUIPOS_UTILIZADOS_EPA)[number] | null {
  const n = nombre.toLowerCase()
  if (n.includes("excavad")) return "EXCAVADORAS"
  if (n.includes("volquet")) return "VOLQUETAS"
  if (n.includes("rtk") || n.includes("gps") || n.includes("sokkia") || n.includes("topo")) return "RTK"
  if (n.includes("camioneta")) return "CAMIONETA"
  if (n.includes("plataforma") || n.includes("cama baja")) return "CAMA BAJA / PLATAFORMA"
  return null
}

function filaHorasEquipo(nombre: string, horas: number): FilaHorasEquipoEpa {
  if (horas >= 7) {
    return {
      equipo: nombre,
      manana: "8:00 - 12:30",
      tarde: "13:00 - 17:30",
      total: `${formatearNumero(horas, 0)} horas`,
    }
  }
  return {
    equipo: nombre,
    manana: horas > 0 ? "Según registro" : "—",
    tarde: "—",
    total: horas > 0 ? `${formatearNumero(horas, 1)} h` : "—",
  }
}

function trabajosDesdeLineas(lineas: LibroObraLineaRegistro[]): string {
  const utiles = lineas.filter(
    (l) =>
      !l.texto.includes("pendiente de anexo manual") &&
      !l.texto.startsWith("Actividades contractuales programadas")
  )
  if (utiles.length === 0) {
    return "Se programaron actividades de desazolve, reconformación de taludes, desalojo (VAE) y trabajos en Severino / Trasvase Manabí según cronograma."
  }
  const bullets = utiles.map((l) => `• ${l.texto}`)
  return `Se realizaron trabajos de:\n${bullets.join("\n")}`
}

function novedadesDesdeLineas(lineas: LibroObraLineaRegistro[]): string {
  const paral = lineas.filter((l) => l.categoria === "paralizacion").map((l) => l.texto)
  return paral.join("\n")
}

export function armarDatosHojaLibroObraEpa(
  fecha: string,
  lineasRegistro: LibroObraLineaRegistro[],
  jornadas: JornadaMaquinariaProyecto[],
  equiposCatalogo: ProyectoEquipoMaquinaria[]
): DatosHojaLibroObraEpa {
  const detalle = detalleJornadasDia(fecha, jornadas, equiposCatalogo)
  const equiposPorId = mapaEquiposPorId(equiposCatalogo)

  const conteoEpa = new Map<string, number>()
  const unicosPorClase = new Map<string, Set<string>>()
  const horasPorNombre = new Map<string, number>()

  for (const j of jornadas.filter((x) => x.fecha === fecha && !x.es_incidencia)) {
    const nombre = nombreEquipoParaMostrar(j, equiposPorId)
    const clase = clasificarEquipoEpa(nombre)
    if (clase) {
      const set = unicosPorClase.get(clase) ?? new Set<string>()
      set.add(nombre)
      unicosPorClase.set(clase, set)
    }
    if (j.duracion_horas != null && j.duracion_horas > 0) {
      horasPorNombre.set(nombre, (horasPorNombre.get(nombre) ?? 0) + j.duracion_horas)
    }
  }
  for (const [clase, set] of unicosPorClase) {
    conteoEpa.set(clase, set.size)
  }

  const equiposUtilizados: FilaCantidadEpa[] = FILAS_EQUIPOS_UTILIZADOS_EPA.map((etiqueta) => ({
    etiqueta,
    cantidad: conteoEpa.get(etiqueta) ?? null,
  }))

  const extras = [...horasPorNombre.keys()].filter((n) => !clasificarEquipoEpa(n))
  for (const extra of extras) {
    equiposUtilizados.push({ etiqueta: extra.toUpperCase(), cantidad: 1 })
  }

  const operadores =
    detalle.equiposDistintos > 0 ? detalle.equiposDistintos : null
  const personalUtilizado: FilaCantidadEpa[] = FILAS_PERSONAL_UTILIZADO_EPA.map((etiqueta) => {
    if (etiqueta === "OPERADORES") return { etiqueta, cantidad: operadores }
    if (etiqueta === "RESIDENTES" && detalle.totalMetros > 0) return { etiqueta, cantidad: 1 }
    if (etiqueta === "TOPÓGRAFOS" && (conteoEpa.get("RTK") ?? 0) > 0) {
      return { etiqueta, cantidad: 1 }
    }
    if (etiqueta === "CHOFERES" && (conteoEpa.get("VOLQUETAS") ?? 0) > 0) {
      return { etiqueta, cantidad: 1 }
    }
    return { etiqueta, cantidad: null }
  })

  const horasEquipos: FilaHorasEquipoEpa[] = [...horasPorNombre.entries()].map(([nombre, horas]) =>
    filaHorasEquipo(nombre, horas)
  )

  return {
    equiposUtilizados,
    personalUtilizado,
    trabajosRealizados: trabajosDesdeLineas(lineasRegistro),
    horasEquipos,
    visitaProyecto: "",
    novedadesObservaciones: novedadesDesdeLineas(lineasRegistro),
    comunicaciones: "",
    clima: { manana: "", tarde: "", noche: "" },
  }
}

export function partesFechaLibroObra(fechaIso: string): { dia: string; mes: string; anio: string } {
  const [y, m, d] = fechaIso.split("-")
  return { dia: d ?? "", mes: m ?? "", anio: y ?? "" }
}
