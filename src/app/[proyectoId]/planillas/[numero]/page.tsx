import { PlanillaDetalleClient } from "@/src/components/planilla/PlanillaDetalleClient"
import { cargarContextoPlanilla } from "@/src/lib/planilla-server-context"

type PageProps = {
  params: Promise<{ proyectoId: string; numero: string }>
}

export const dynamic = "force-dynamic"

export default async function PlanillaNumeroPage({ params }: PageProps) {
  const { proyectoId, numero } = await params
  const { config, periodo } = await cargarContextoPlanilla(proyectoId, numero)

  return <PlanillaDetalleClient config={config} periodo={periodo} />
}
