import { resolverFechaCartaEmision } from "@/lib/infimas/reloj-publico-pdf/render-reloj-publico-pdf"
import { CONTRATO_RELOJ_PUBLICO_PORTOVIEJO, fechaCartaDocumento } from "@/src/data/infimas/reloj-publico-portoviejo"
import type {
  RelojPublicoCartaData,
  RelojPublicoDocumento,
  RelojPublicoInformeData,
  RelojPublicoPeriodo,
} from "@/src/data/infimas/reloj-publico-types"

export function construirCartaData(
  periodo: RelojPublicoPeriodo,
  tipo: RelojPublicoDocumento["tipo"],
  fechaEmisionIso?: string | null
): RelojPublicoCartaData | RelojPublicoInformeData {
  let fechaCarta: string

  if ((tipo === "entrega" || tipo === "informe") && fechaEmisionIso) {
    fechaCarta =
      resolverFechaCartaEmision(tipo, periodo.id, fechaEmisionIso) ??
      fechaCartaDocumento(tipo, periodo)
  } else {
    fechaCarta = fechaCartaDocumento(tipo, periodo)
  }

  return {
    contrato: CONTRATO_RELOJ_PUBLICO_PORTOVIEJO,
    periodo,
    fechaCarta,
  }
}

export function isoFechaLocalHoy(): string {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, "0")
  const d = String(hoy.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
