"use client"

import { BookOpen, Printer } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LibroObraDocumento } from "@/src/components/LibroObraDocumento"
import { esperarImagenesInformeListas } from "@/src/lib/compress-image-informe"
import {
  filtrarEntradasLibroObra,
  formatearFechaLibroObra,
  type LibroObraEntradaDia,
} from "@/src/lib/libro-obra"

type LibroObraClientProps = {
  entradas: LibroObraEntradaDia[]
  generadoEn: string
  errorCarga: string | null
}

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-auto"

function etiquetaRango(entradas: LibroObraEntradaDia[]): string {
  if (entradas.length === 0) return "Sin registros"
  if (entradas.length === 1) return formatearFechaLibroObra(entradas[0].fecha)

  const primera = entradas[0].fecha
  const ultima = entradas[entradas.length - 1].fecha
  return `${formatearFechaLibroObra(primera)} — ${formatearFechaLibroObra(ultima)}`
}

function contarEvidencias(entradas: LibroObraEntradaDia[]): number {
  return entradas.reduce((total, entrada) => total + entrada.evidencias.length, 0)
}

export function LibroObraClient({ entradas, generadoEn, errorCarga }: LibroObraClientProps) {
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [imprimiendo, setImprimiendo] = useState(false)

  const entradasFiltradas = useMemo(
    () => filtrarEntradasLibroObra(entradas, desde || undefined, hasta || undefined),
    [entradas, desde, hasta]
  )

  const rangoEtiqueta = useMemo(() => etiquetaRango(entradasFiltradas), [entradasFiltradas])
  const totalEvidencias = useMemo(() => contarEvidencias(entradasFiltradas), [entradasFiltradas])

  async function handleImprimir() {
    setImprimiendo(true)
    try {
      await esperarImagenesInformeListas()
      window.print()
    } finally {
      setImprimiendo(false)
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="libro-obra-toolbar shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <BookOpen className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Informe de evidencias de obra
              </h1>
              <p className="text-sm text-muted-foreground">
                Fiscalización interna — consolidado del registro fotográfico
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {errorCarga ? (
          <Card className="border-destructive/30 bg-destructive/5 print:hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-destructive">Error al cargar evidencias</CardTitle>
              <CardDescription>{errorCarga}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No se pudieron cargar las evidencias. El informe quedará vacío hasta que Supabase esté
              disponible.
            </CardContent>
          </Card>
        ) : null}

        <Card className="libro-obra-toolbar border-foreground/10 print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generar documento</CardTitle>
            <CardDescription>
              Una entrada por cada día con evidencias fotográficas. Las fotos se comprimen
              automáticamente para un PDF más liviano.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-sm">
                <span className="font-medium">Desde</span>
                <input
                  type="date"
                  value={desde}
                  onChange={(event) => setDesde(event.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-sm">
                <span className="font-medium">Hasta</span>
                <input
                  type="date"
                  value={hasta}
                  onChange={(event) => setHasta(event.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
              <Button
                type="button"
                onClick={() => {
                  setDesde("")
                  setHasta("")
                }}
                variant="outline"
              >
                Limpiar filtros
              </Button>
              <Button type="button" onClick={() => void handleImprimir()} disabled={imprimiendo}>
                <Printer className="size-4" aria-hidden />
                {imprimiendo ? "Comprimiendo fotos…" : "Imprimir / Guardar PDF"}
              </Button>
            </div>

            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Entradas diarias</dt>
                <dd className="font-semibold">{entradasFiltradas.length}</dd>
              </div>
              <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Grupos de evidencia</dt>
                <dd className="font-semibold">{totalEvidencias}</dd>
              </div>
              <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Período</dt>
                <dd className="font-semibold leading-snug">{rangoEtiqueta}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <LibroObraDocumento
          entradas={entradasFiltradas}
          generadoEn={generadoEn}
          rangoEtiqueta={rangoEtiqueta}
        />
      </main>
    </div>
  )
}
