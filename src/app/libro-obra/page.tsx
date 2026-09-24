import type { Metadata } from "next"

import { LibroObraClient } from "@/src/components/LibroObraClient"
import { ProyectoModuloGuard } from "@/src/components/ProyectoModuloGuard"
import { PROYECTO_EMERGENCIA_MANABI } from "@/src/data/proyectos/catalog"
import { cargarEvidenciasLibroObra } from "@/src/lib/cargar-evidencias-libro-obra"
import { consolidarLibroObra } from "@/src/lib/libro-obra"
import { createClient } from "@/src/lib/supabase/server"

export const metadata: Metadata = {
  title: "Informe de evidencias de obra",
}

export const dynamic = "force-dynamic"

export default async function LibroObraPage() {
  const generadoEn = new Date().toISOString()
  let errorCarga: string | null = null
  let entradas = consolidarLibroObra([])

  try {
    const supabase = await createClient()
    const registros = await cargarEvidenciasLibroObra(supabase, PROYECTO_EMERGENCIA_MANABI)
    entradas = consolidarLibroObra(registros)
  } catch (error) {
    errorCarga = error instanceof Error ? error.message : "No se pudieron cargar las evidencias."
    entradas = consolidarLibroObra([])
  }

  return (
    <ProyectoModuloGuard modulo="libroObra">
      <LibroObraClient entradas={entradas} generadoEn={generadoEn} errorCarga={errorCarga} />
    </ProyectoModuloGuard>
  )
}
