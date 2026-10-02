import type {
  RelojPublicoContratoConfig,
  RelojPublicoDocumento,
  RelojPublicoPeriodo,
  RelojPublicoPeriodoBundle,
} from "@/src/data/infimas/reloj-publico-types"
import { ORDEN_COMPRA_RELOJ_PUBLICO } from "@/src/data/infimas/reloj-publico-orden-compra"
import {
  construirTextosPeriodo,
  formatearFechaCarta,
  generarFilasInformePlantilla,
} from "@/src/lib/reloj-publico-periodos"

export const CONTRATO_RELOJ_PUBLICO_PORTOVIEJO: RelojPublicoContratoConfig = {
  codigo: ORDEN_COMPRA_RELOJ_PUBLICO.codigo,
  objetoContractual:
    "SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DEL RELOJ PÚBLICO UBICADO EN LA TERRAZA DEL EDIFICIO CENTRAL DEL GOBIERNO AUTÓNOMO DESCENTRALIZADO PROVINCIAL DE MANABÍ",
  ciudad: "Portoviejo",
  ordenCompra: {
    codigo: ORDEN_COMPRA_RELOJ_PUBLICO.codigo,
    fecha: ORDEN_COMPRA_RELOJ_PUBLICO.fecha,
    areaRequirente: ORDEN_COMPRA_RELOJ_PUBLICO.areaRequirente,
    certificacionPresupuestaria: ORDEN_COMPRA_RELOJ_PUBLICO.certificacionPresupuestaria,
    archivoPdf: ORDEN_COMPRA_RELOJ_PUBLICO.archivoPdf,
  },
  administrador: {
    nombre: "Denessis Michelle Briones Intriago",
    cargoLineas: [
      "ADMINISTRADOR",
      "DE LA ORDEN DE COMPRA",
      ORDEN_COMPRA_RELOJ_PUBLICO.codigo,
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

/** Periodo jul–ago 2026 (actividades del 7 jul al 6 ago 2026), alineado a la OC. */
export const PERIODO_RELOJ_2026_07 = construirPeriodo(2026, 7, {
  3: {
    observacion:
      "Limpieza y engrasada de cuerdas aceradas en cada carrete actividad que se realizó durante los días martes 28, miércoles 29 y jueves 30.\nAceitada de ruedas lunes 27 y viernes 31.",
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
      descripcion: `Registro semanal de mantenimiento — orden de compra ${codigo}.`,
    },
  ]
}

export const PERIODOS_RELOJ_PUBLICO: RelojPublicoPeriodo[] = [PERIODO_RELOJ_2026_07]

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
