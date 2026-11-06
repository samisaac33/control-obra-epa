import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { rutaObra } from "@/src/lib/rutas-proyecto"

type PageProps = {
  params: Promise<{ proyectoId: string }>
}

export const metadata: Metadata = {
  title: "Trabajos complementarios",
  robots: { index: false, follow: false },
}

export default async function TrabajosComplementariosPage({ params }: PageProps) {
  const { proyectoId } = await params
  if (proyectoId !== PROYECTO_DESASOLVE_CANALES) {
    notFound()
  }

  redirect(`${rutaObra(proyectoId, "maquinaria")}#trabajos-complementarios`)
}
