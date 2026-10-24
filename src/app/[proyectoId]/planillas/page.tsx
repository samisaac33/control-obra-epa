import { PlanillasHubClient } from "@/src/components/planilla/PlanillasHubClient"
import { ProyectoModuloGuard } from "@/src/components/ProyectoModuloGuard"

export const dynamic = "force-dynamic"

export default function PlanillasPage() {
  return (
    <ProyectoModuloGuard modulo="planillaPago">
      <PlanillasHubClient />
    </ProyectoModuloGuard>
  )
}
