import { notFound } from "next/navigation"

import { ProyectoShell } from "@/src/components/ProyectoShell"
import { PROYECTOS } from "@/src/data/proyectos/catalog"

type ProyectoLayoutProps = {
  children: React.ReactNode
  params: Promise<{ proyectoId: string }>
}

export default async function ProyectoLayout({ children, params }: ProyectoLayoutProps) {
  const { proyectoId } = await params
  if (!(proyectoId in PROYECTOS)) {
    notFound()
  }

  return <ProyectoShell proyectoId={proyectoId}>{children}</ProyectoShell>
}
