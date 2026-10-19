import { getProyecto, PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"

export type ContextoDocumentalDesasolve = {
  terminosReferencia: string
  presupuesto: string
  cronograma: string
  glosario: string
}

/** Tope por defecto del bloque documental inyectado al asistente (~ tokens). */
export const MAX_CARACTERES_CONTEXTO_DOCUMENTAL = 6_000

const PLACEHOLDER_CONTRACTUAL =
  "[Pendiente: pegar aquí extracto contractual oficial (TDR / presupuesto / cronograma) acordado con EPA EP.]"

export const CONTEXTO_DOCUMENTAL_DESASOLVE: ContextoDocumentalDesasolve = {
  terminosReferencia: `
Objeto (catálogo app): desasolve de canales de riego con excavadoras en el Sistema Trasvase Manabí.
Cliente: Empresa Pública del Agua (EPA EP).
Alcance operativo en la app: seguimiento georreferenciado por tramos de canal (~31 tramos operativos en red completa, longitud total de referencia ~65,33 km según material de capacitación), registro de jornadas de maquinaria y evidencias fotográficas.
Entregables típicos: canales desasolados según longitudes ejecutadas, registro diario de equipos, puntos GPS de avance confirmados por el residente, informes de incidencias cuando aplique.
${PLACEHOLDER_CONTRACTUAL}
`.trim(),

  presupuesto: `
El módulo de presupuesto no está activo en la UI de desasolve-canales; las partidas contractuales deben documentarse aquí para consultas del asistente.
Unidades de obra relevantes: metros lineales desasolados por tramo/canal, horas-máquina de excavadoras y equipos de apoyo, transporte de material excavado cuando se registre.
${PLACEHOLDER_CONTRACTUAL}
`.trim(),

  cronograma: `
Programación en campo: el mapa permite asignar semana_programada y maquinaria_asignada por tramo (formato semana ISO, p. ej. 2025-W38).
Hitos operativos: avance por tramo (pendiente → en ejecución con frente en mapa → terminado al 100 % de longitud según GPS/minitramos).
${PLACEHOLDER_CONTRACTUAL}
`.trim(),

  glosario: `
- Tramo: segmento de canal georreferenciado (código, canal, longitud_m).
- Minitramo A/B/C: segmentos entre puntos GPS confirmados; el mapa calcula longitudes y estados.
- Estados en mapa (leyenda): pendiente (violeta), en ejecución (naranja, frente parpadeante), terminado (verde).
- Jornada de maquinaria: registro diario por tramo (metros desasolados, equipo, horas); distinto de incidencia (hecho extraordinario).
- Punto GPS: confirmado por el residente con «Registrar punto»; no se crea automáticamente desde el asistente.
`.trim(),
}

function recortarTexto(texto: string, max: number): string {
  if (texto.length <= max) return texto
  return `${texto.slice(0, max - 40).trimEnd()}\n\n[… contexto documental recortado por límite …]`
}

export function contextoDocumentalDesasolve(
  maxCaracteres = MAX_CARACTERES_CONTEXTO_DOCUMENTAL
): string {
  const proyecto = getProyecto(PROYECTO_DESASOLVE_CANALES)
  const bloques = [
    `### Contexto contractual (${proyecto.id})`,
    `Obra: ${proyecto.nombreObra}`,
    `Contrato: ${proyecto.numeroContrato}`,
    `Sistema: ${proyecto.sistema}`,
    "",
    "#### Términos de referencia (resumen)",
    CONTEXTO_DOCUMENTAL_DESASOLVE.terminosReferencia,
    "",
    "#### Presupuesto (referencia)",
    CONTEXTO_DOCUMENTAL_DESASOLVE.presupuesto,
    "",
    "#### Cronograma (referencia)",
    CONTEXTO_DOCUMENTAL_DESASOLVE.cronograma,
    "",
    "#### Glosario operativo",
    CONTEXTO_DOCUMENTAL_DESASOLVE.glosario,
  ]
  return recortarTexto(bloques.join("\n"), maxCaracteres)
}
