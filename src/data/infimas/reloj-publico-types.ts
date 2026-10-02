export type RelojPublicoDocumentoTipo = "notificacion" | "entrega" | "informe"

export type RelojPublicoFirma = {
  nombre: string
  ruc: string
  cargo?: string
}

export type RelojPublicoContratoConfig = {
  codigo: string
  objetoContractual: string
  ciudad: string
  administrador: {
    nombre: string
    cargoLineas: string[]
  }
  proveedor: RelojPublicoFirma
}

export type RelojPublicoFechasPeriodo = {
  inicio: string
  fin: string
  notificacion: string
  entregaInforme: string
}

export type RelojPublicoInformeFila = {
  semanaLabel: string
  anio: number
  actividad: string
  observacion: string
}

export type RelojPublicoPeriodo = {
  id: string
  etiqueta: string
  fechas: RelojPublicoFechasPeriodo
  fechasTexto: {
    periodoLargo: string
    periodoCorto: string
    notificacion: string
    entregaInforme: string
  }
  filasInforme: RelojPublicoInformeFila[]
}

export type RelojPublicoDocumento = {
  id: string
  slug: string
  tipo: RelojPublicoDocumentoTipo
  titulo: string
  periodoId: string
  fecha: string
  archivoPdf: string
  descripcion: string
}

export type RelojPublicoPeriodoBundle = {
  periodo: RelojPublicoPeriodo
  documentos: RelojPublicoDocumento[]
}

export type RelojPublicoCartaData = {
  contrato: RelojPublicoContratoConfig
  periodo: RelojPublicoPeriodo
  fechaCarta: string
}

export type RelojPublicoInformeData = RelojPublicoCartaData
