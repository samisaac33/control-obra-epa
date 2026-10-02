import type {
  RelojPublicoContratoConfig,
  RelojPublicoDocumento,
  RelojPublicoPeriodo,
  RelojPublicoPeriodoBundle,
} from "@/src/data/infimas/reloj-publico-types"
import {
  construirTextosPeriodo,
  formatearFechaCarta,
  generarFilasInformePlantilla,
} from "@/src/lib/reloj-publico-periodos"

export const CONTRATO_RELOJ_PUBLICO_PORTOVIEJO: RelojPublicoContratoConfig = {
  codigo: "IC-GADPDM-2025-025",
  objetoContractual:
    "SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DEL RELOJ PÚBLICO UBICADO EN LA TERRAZA DEL EDIFICIO CENTRAL DEL GOBIERNO PROVINCIAL DE MANABÍ",
  ciudad: "Portoviejo",
  administrador: {
    nombre: "Denessis Briones Intriago",
    cargoLineas: [
      "ADMINISTRADOR",
      "DEL CONTRATO",
      "IC-GADPDM-2025-025",
      "DEL",
      "GOBIERNO PROVINCIAL",
      "DE",
      "MANABÍ",
    ],
  },
  proveedor: {
    nombre: "Pedro Eker Guadamud Farías",
    ruc: "1303270761001",
  },
}

const BASE_PDF = "/infimas/reloj-publico-portoviejo"

function construirPeriodo(anioInicio: number, mesInicio: number, overrides?: Parameters<typeof generarFilasInformePlantilla>[2]): RelojPublicoPeriodo {
  const meta = construirTextosPeriodo(anioInicio, mesInicio)
  return {
    id: meta.id,
    etiqueta: meta.etiqueta,
    fechas: meta.fechas,
    fechasTexto: meta.fechasTexto,
    filasInforme: generarFilasInformePlantilla(meta.fechas.inicio, meta.fechas.fin, overrides),
  }
}

/** Periodo feb–mar 2026 (actividades del 7 feb al 6 mar 2026). */
export const PERIODO_RELOJ_2026_02 = construirPeriodo(2026, 2, {
  3: {
    observacion:
      "Limpieza y engrasada de cuerdas aceradas en cada carrete actividad que se realizó durante los días martes 25, miércoles 26 y jueves 27.\nAceitada de ruedas lunes 23 y viernes 27.",
  },
})

function documentosDePeriodo(periodo: RelojPublicoPeriodo): RelojPublicoDocumento[] {
  const prefix = `${BASE_PDF}/${periodo.id}`
  const codigo = CONTRATO_RELOJ_PUBLICO_PORTOVIEJO.codigo

  return [
    {
      id: `${periodo.id}-notificacion`,
      slug: `${periodo.id}-notificacion`,
      tipo: "notificacion",
      titulo: "Oficio de notificación",
      periodoId: periodo.id,
      fecha: periodo.fechasTexto.notificacion,
      archivoPdf: `${prefix}/oficio-notificacion.pdf`,
      descripcion: `Notificación previa al inicio de actividades (${periodo.fechasTexto.periodoCorto}).`,
    },
    {
      id: `${periodo.id}-entrega`,
      slug: `${periodo.id}-entrega`,
      tipo: "entrega",
      titulo: "Oficio de entrega",
      periodoId: periodo.id,
      fecha: periodo.fechasTexto.entregaInforme,
      archivoPdf: `${prefix}/oficio-entrega.pdf`,
      descripcion: `Entrega del informe del periodo ${periodo.etiqueta}.`,
    },
    {
      id: `${periodo.id}-informe`,
      slug: `${periodo.id}-informe`,
      tipo: "informe",
      titulo: "Informe de actividades",
      periodoId: periodo.id,
      fecha: periodo.fechasTexto.entregaInforme,
      archivoPdf: `${prefix}/informe-actividades.pdf`,
      descripcion: `Registro semanal de mantenimiento — contrato ${codigo}.`,
    },
  ]
}

export const PERIODOS_RELOJ_PUBLICO: RelojPublicoPeriodo[] = [PERIODO_RELOJ_2026_02]

export const BUNDLES_RELOJ_PUBLICO: RelojPublicoPeriodoBundle[] = PERIODOS_RELOJ_PUBLICO.map(
  (periodo) => ({
    periodo,
    documentos: documentosDePeriodo(periodo),
  })
)

export function obtenerBundleRelojPublico(periodoId: string): RelojPublicoPeriodoBundle | undefined {
  return BUNDLES_RELOJ_PUBLICO.find((b) => b.periodo.id === periodoId)
}

export function obtenerDocumentoRelojPublico(slug: string): {
  documento: RelojPublicoDocumento
  periodo: RelojPublicoPeriodo
} | undefined {
  for (const bundle of BUNDLES_RELOJ_PUBLICO) {
    const documento = bundle.documentos.find((d) => d.slug === slug)
    if (documento) {
      return { documento, periodo: bundle.periodo }
    }
  }
  return undefined
}

export function fechaCartaDocumento(tipo: RelojPublicoDocumento["tipo"], periodo: RelojPublicoPeriodo): string {
  if (tipo === "notificacion") {
    return formatearFechaCarta(periodo.fechas.notificacion, CONTRATO_RELOJ_PUBLICO_PORTOVIEJO.ciudad)
  }
  return formatearFechaCarta(periodo.fechas.entregaInforme, CONTRATO_RELOJ_PUBLICO_PORTOVIEJO.ciudad)
}
