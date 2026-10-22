import { AuditConsistencyCard } from "@/src/components/auditoria/AuditConsistencyCard"
import { ReporteDiarioDescargaLink } from "@/src/components/auditoria/ReporteDiarioDescargaLink"
import { ProyectoModuloGuard } from "@/src/components/ProyectoModuloGuard"

export const dynamic = "force-dynamic"

export default function AuditoriaPage() {
  return (
    <ProyectoModuloGuard modulo="auditoriaAntiglosa">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Auditoría antiglosa (CGE)</h1>
            <p className="text-sm text-muted-foreground">
              Triangulación volumétrica para conciliación y planillaje
            </p>
          </div>
          <ReporteDiarioDescargaLink />
        </div>
        <AuditConsistencyCard />
      </div>
    </ProyectoModuloGuard>
  )
}
