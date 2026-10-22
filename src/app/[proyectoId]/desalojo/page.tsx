import { Suspense } from "react"

import { DespachoVolquetasClient } from "@/src/components/desalojo/DespachoVolquetasClient"
import { ProyectoModuloGuard } from "@/src/components/ProyectoModuloGuard"

export const dynamic = "force-dynamic"

export default function DesalojoPage() {
  return (
    <ProyectoModuloGuard modulo="desalojo">
      <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Cargando despacho…</p>}>
        <DespachoVolquetasClient />
      </Suspense>
    </ProyectoModuloGuard>
  )
}
