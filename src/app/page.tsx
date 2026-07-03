import { LayoutDashboard } from "lucide-react"

import { AccesosRapidos } from "@/src/components/AccesosRapidos"
import { AfectacionesResumen } from "@/src/components/AfectacionesResumen"
import { KpiCard } from "@/src/components/KpiCard"
import { UltimasEvidencias } from "@/src/components/UltimasEvidencias"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AFECTACIONES, INFORME_KPIS, INFORME_META } from "@/src/data/informe-afectacion"
import { PROYECTO } from "@/src/data/proyecto"

export default function Home() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <LayoutDashboard className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {PROYECTO.nombreObra}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <Card className="border-primary/20 bg-primary/5 ring-1 ring-primary/10">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{PROYECTO.nombreObra}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              <span className="block">Cliente: {PROYECTO.cliente}</span>
              <span className="mt-1 block">Contrato: {PROYECTO.numeroContrato}</span>
              <span className="mt-1 block">{PROYECTO.objeto}</span>
            </CardDescription>
          </CardHeader>
        </Card>

        <section aria-labelledby="kpis-title">
          <h2 id="kpis-title" className="mb-3 text-base font-semibold tracking-tight">
            Magnitud del sistema y la emergencia
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INFORME_KPIS.map((kpi) => (
              <KpiCard key={kpi.id} label={kpi.label} valor={kpi.valor} detalle={kpi.detalle} />
            ))}
          </div>
        </section>

        <section aria-labelledby="afectaciones-title">
          <h2 id="afectaciones-title" className="mb-3 text-base font-semibold tracking-tight">
            Afectaciones identificadas
          </h2>
          <AfectacionesResumen afectaciones={AFECTACIONES} />
        </section>

        <section aria-labelledby="accesos-title">
          <h2 id="accesos-title" className="mb-3 text-base font-semibold tracking-tight">
            Accesos rápidos
          </h2>
          <AccesosRapidos />
        </section>

        <section aria-labelledby="evidencias-title">
          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle id="evidencias-title" className="text-base sm:text-lg">
                Últimas evidencias fotográficas
              </CardTitle>
              <CardDescription>
                Registro de campo georreferenciado — consulte por sector en Registro fotográfico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UltimasEvidencias />
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="shrink-0 border-t border-foreground/10 py-3 text-center text-xs text-muted-foreground">
        Basado en {INFORME_META.titulo} — {INFORME_META.entidad}
      </footer>
    </div>
  )
}
