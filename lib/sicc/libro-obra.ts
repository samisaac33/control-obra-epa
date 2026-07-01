import type { EntradaLibroObra, ObraSicc } from "@/lib/sicc/types"
import { formatearFecha } from "@/lib/sicc/format"

export function generarTextoLibroObra(
  obra: ObraSicc,
  entradas: EntradaLibroObra[]
): string {
  const ordenadas = [...entradas].sort((a, b) => a.fecha.localeCompare(b.fecha))

  const encabezado = [
    "LIBRO DE OBRA",
    "═".repeat(56),
    `Obra: ${obra.nombre}`,
    `Contrato: ${obra.numeroContrato}`,
    `Cliente: ${obra.cliente}`,
    `Ubicación: ${obra.ubicacion}`,
    `Residente: ${obra.residente}`,
    `Total de registros: ${ordenadas.length}`,
    "",
  ].join("\n")

  const cuerpo = ordenadas
    .map((entrada, index) => {
      const lineas = [
        `REGISTRO Nº ${index + 1}`,
        "─".repeat(56),
        `Fecha: ${formatearFecha(entrada.fecha)}`,
        `Clima: ${entrada.clima}${entrada.temperatura ? ` · ${entrada.temperatura}` : ""}`,
        `Personal en obra: ${entrada.personal} personas`,
        "",
        "Actividades ejecutadas:",
        entrada.actividades,
      ]

      if (entrada.materiales) {
        lineas.push("", "Materiales:", entrada.materiales)
      }
      if (entrada.equipos) {
        lineas.push("", "Equipos:", entrada.equipos)
      }
      if (entrada.incidencias) {
        lineas.push("", "Incidencias:", entrada.incidencias)
      }
      if (entrada.observaciones) {
        lineas.push("", "Observaciones:", entrada.observaciones)
      }

      lineas.push("", `Firma residente: ${entrada.residente}`, "")
      return lineas.join("\n")
    })
    .join("\n")

  return `${encabezado}${cuerpo}`
}
