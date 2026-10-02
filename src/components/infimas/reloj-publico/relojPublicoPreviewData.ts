import {
  CONTRATO_RELOJ_PUBLICO_PORTOVIEJO,
  fechaCartaDocumento,
} from "@/src/data/infimas/reloj-publico-portoviejo"
import type {
  RelojPublicoCartaData,
  RelojPublicoDocumento,
  RelojPublicoInformeData,
  RelojPublicoPeriodo,
} from "@/src/data/infimas/reloj-publico-types"

export function construirCartaData(
  periodo: RelojPublicoPeriodo,
  tipo: RelojPublicoDocumento["tipo"]
): RelojPublicoCartaData | RelojPublicoInformeData {
  return {
    contrato: CONTRATO_RELOJ_PUBLICO_PORTOVIEJO,
    periodo,
    fechaCarta: fechaCartaDocumento(tipo, periodo),
  }
}
