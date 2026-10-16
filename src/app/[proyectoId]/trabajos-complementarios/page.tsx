import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { TrabajosComplementariosPageClient } from "@/src/components/TrabajosComplementariosPageClient"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"

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

  return <TrabajosComplementariosPageClient />
}
