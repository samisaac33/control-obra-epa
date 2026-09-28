import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProyectoShell } from "@/src/components/ProyectoShell"
import { getProyecto, PROYECTOS } from "@/src/data/proyectos/catalog"

type ProyectoLayoutProps = {
  children: React.ReactNode
  params: Promise<{ proyectoId: string }>
}

export async function generateMetadata({ params }: ProyectoLayoutProps): Promise<Metadata> {
  const { proyectoId } = await params
  if (!(proyectoId in PROYECTOS)) {
    return {}
  }
  const proyecto = getProyecto(proyectoId)
  return {
    title: proyecto.nombreObra,
    description: `${proyecto.nombreObra} — ${proyecto.objeto}`,
    openGraph: {
      title: `${proyecto.nombreObra} | Control de Obra EPA`,
      description: proyecto.objeto,
    },
  }
}

export default async function ProyectoLayout({ children, params }: ProyectoLayoutProps) {
  const { proyectoId } = await params
  if (!(proyectoId in PROYECTOS)) {
    notFound()
  }

  return <ProyectoShell proyectoId={proyectoId}>{children}</ProyectoShell>
}
