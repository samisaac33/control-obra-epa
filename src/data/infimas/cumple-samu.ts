export const CUMPLE_SAMU_PDF = "/infimas/cumple-samu/libro-colorear-samu.pdf"

export const CUMPLE_SAMU_PAGINAS = [
  "01-portada.png",
  "02-cookie-party.jpg",
  "03-cookie-monster-fiesta.jpg",
  "04-contar-alimentos.jpg",
  "05-torre-galletas.jpg",
  "06-laberinto.jpg",
  "07-elmo-panaderia.png",
  "08-elmo-musica.jpg",
  "09-unir-puntos.jpg",
  "10-elmo-alfabeto.jpg",
  "11-plaza-sesame.jpg",
  "12-galletas-cumple.jpg",
] as const

export const CUMPLE_SAMU_TOTAL_PAGINAS = CUMPLE_SAMU_PAGINAS.length

/** Hojas físicas A4 horizontal (dos láminas por cara, imposición tipo libro). */
export const CUMPLE_SAMU_HOJAS_IMPRESION = CUMPLE_SAMU_TOTAL_PAGINAS / 2

export const CUMPLE_SAMU_PDF_VERSION = "2"