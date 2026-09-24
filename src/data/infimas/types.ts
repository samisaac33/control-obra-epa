export type InfimaDatoGeneral = {
  etiqueta: string
  valor: string
}

export type InfimaSubseccion = {
  titulo: string
  parrafos?: string[]
  items?: string[]
}

export type InfimaSeccion = {
  titulo: string
  parrafos?: string[]
  items?: string[]
  subsecciones?: InfimaSubseccion[]
}

export type InfimaAnexoFotografico = {
  numero: number
  descripcion: string
  archivo: string
}

export type InfimaInformeData = {
  titulo: string
  fecha: string
  para: string
  de: string
  asunto: string
  datosGenerales: InfimaDatoGeneral[]
  secciones: InfimaSeccion[]
  anexosFotograficos: InfimaAnexoFotografico[]
  firma: {
    nombre: string
    ruc: string
    cargo: string
  }
}

export type InfimaDocumentoCatalogo = {
  id: string
  slug: string
  titulo: string
  ordenCompra: string
  fecha: string
  archivoPdf: string
  descripcion: string
}
