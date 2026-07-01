import { notFound } from "next/navigation"

import { LibroObraPanel } from "@/components/sicc/libro-obra-panel"
import { ModulePlaceholder } from "@/components/sicc/module-placeholder"
import { MODULOS_SICC } from "@/lib/sicc/modules"
import type { ModuloId } from "@/lib/sicc/types"

export function generateStaticParams() {
  return MODULOS_SICC.map((modulo) => ({ modulo: modulo.id }))
}

export default async function SiccModuloPage({
  params,
}: {
  params: Promise<{ modulo: string }>
}) {
  const { modulo: slug } = await params
  const modulo = MODULOS_SICC.find((m) => m.id === slug)

  if (!modulo) notFound()

  if ((slug as ModuloId) === "libro-obra") {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <LibroObraPanel />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ModulePlaceholder modulo={modulo} />
    </div>
  )
}
