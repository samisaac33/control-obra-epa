import { SalvaPlazosClient } from "@/src/components/salva-plazos/SalvaPlazosClient"
import { ProyectoModuloGuard } from "@/src/components/ProyectoModuloGuard"

export const dynamic = "force-dynamic"

export default function SalvaPlazosPage() {
  return (
    <ProyectoModuloGuard modulo="salvaPlazos">
      <SalvaPlazosClient />
    </ProyectoModuloGuard>
  )
}
