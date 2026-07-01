import { MODULOS_SICC } from "@/lib/sicc/modules"
import { ENTRADAS_LIBRO_DEMO, KPIS_OBRA_DEMO, OBRA_DEMO } from "@/lib/sicc/demo-obra"
import { formatearUsd } from "@/lib/sicc/format"
import { KpiCard } from "@/components/sicc/kpi-card"
import { ModuleCard, ObraResumenCard } from "@/components/sicc/module-card"
import { SiccSidebarEstadoResumen } from "@/components/sicc/sicc-sidebar"

export default function SiccDashboardPage() {
  const modulosFase1 = MODULOS_SICC.filter((m) => m.fase === 1)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="space-y-3">
        <SiccSidebarEstadoResumen />
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Panel de control
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Bienvenido al SICC — entorno separado del sistema en producción. Aquí se
          construirá el sistema integrado para la constructora: presupuesto, metrados,
          libro de obra, certificaciones y gestión corporativa.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS_OBRA_DEMO.map((kpi) => (
          <KpiCard key={kpi.etiqueta} kpi={kpi} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <ObraResumenCard
          nombre={OBRA_DEMO.nombre}
          contrato={OBRA_DEMO.numeroContrato}
          cliente={OBRA_DEMO.cliente}
          ubicacion={OBRA_DEMO.ubicacion}
          residente={OBRA_DEMO.residente}
        />
        <div className="rounded-xl border border-foreground/10 bg-card p-5 shadow-sm ring-1 ring-foreground/5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monto contractual
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
            {formatearUsd(OBRA_DEMO.montoContrato)}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {ENTRADAS_LIBRO_DEMO.length} partes de obra registrados en demostración.
            El módulo activo actual es{" "}
            <strong className="font-medium text-foreground">Libro de obra</strong>.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Fase 1 — Control de campo</h2>
          <p className="text-sm text-muted-foreground">
            Módulos prioritarios para residentes y visitantes de obra.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modulosFase1.map((modulo) => (
            <ModuleCard key={modulo.id} modulo={modulo} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Roadmap corporativo</h2>
          <p className="text-sm text-muted-foreground">
            Módulos planificados para oficina central, compras, finanzas y dirección.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MODULOS_SICC.filter((m) => m.fase > 1).map((modulo) => (
            <ModuleCard key={modulo.id} modulo={modulo} />
          ))}
        </div>
      </section>
    </div>
  )
}
