import type { SupabaseClient } from "@supabase/supabase-js"

import type { DailyReportCgeData } from "@/src/components/pdf/DailyReportCGE"
import { SECTORES_FRENTE } from "@/src/data/contrato-emergencia-severino-trasvase"
import { cargarCanalAbscisasProyecto } from "@/src/lib/cargar-canal-abscisas"
import { cargarTicketsDesalojoProyecto } from "@/src/lib/cargar-tickets-desalojo"
import { cargarRegistrosMaquinariaJornadaProyecto } from "@/src/lib/cargar-maquinaria-jornada"

export async function cargarDailyReportCgeData(
  supabase: SupabaseClient,
  proyectoId: string,
  fecha: string,
  condicionesClimaticas = "Según registro de campo / libro de obra"
): Promise<DailyReportCgeData> {
  const rango = { desde: fecha, hasta: fecha }
  const [abscisas, tickets, jornadas] = await Promise.all([
    cargarCanalAbscisasProyecto(supabase, proyectoId),
    cargarTicketsDesalojoProyecto(supabase, proyectoId, rango),
    cargarRegistrosMaquinariaJornadaProyecto(supabase, proyectoId, rango),
  ])

  const abscisasDia = abscisas.filter((a) => a.fecha_ejecucion === fecha)

  return {
    fecha,
    frenteTrabajo: SECTORES_FRENTE.slice(0, 2).join(" · "),
    condicionesClimaticas,
    abscisasDia,
    ticketsDia: tickets,
    jornadasDia: jornadas,
    generadoEnIso: new Date().toISOString(),
  }
}
