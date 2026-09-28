import { PROYECTOS } from "@/src/data/proyectos/catalog"

export function rutaObra(proyectoId: string, segmento = ""): string {
  const base = `/${proyectoId}`
  if (!segmento) return base
  return `${base}${segmento.startsWith("/") ? segmento : `/${segmento}`}`
}

export function esProyectoIdValido(segmento: string | undefined): segmento is keyof typeof PROYECTOS {
  return Boolean(segmento && segmento in PROYECTOS)
}

export function proyectoIdDesdePathname(pathname: string): string | null {
  const segmento = pathname.split("/").filter(Boolean)[0]
  return esProyectoIdValido(segmento) ? segmento : null
}

export function esRutaMapaObra(pathname: string): boolean {
  return /\/mapa\/?$/.test(pathname)
}
