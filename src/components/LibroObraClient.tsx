"use client"

import { BookOpen, Printer } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LibroObraAyudaGuardarPdf } from "@/src/components/LibroObraAyudaGuardarPdf"
import { LibroObraDocumento } from "@/src/components/LibroObraDocumento"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  filtrarEntradasLibroObra,
  formatearFechaLibroObra,
  type LibroObraEntradaDia,
} from "@/src/lib/libro-obra"

type LibroObraClientProps = {
  entradas?: LibroObraEntradaDia[]
  generadoEn: string
  errorCarga: string | null
  defaultDesde?: string
  defaultHasta?: string
  tituloDocumento?: string
  /** Planilla: hoja diaria civil; Severino solo en fechas-hito programadas. */
  variant?: "evidencias" | "planilla"
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

export function LibroObraClient({
  entradas: entradasProp = [],
  generadoEn,
  errorCarga,
  defaultDesde = "",
  defaultHasta = "",
  tituloDocumento,
  variant = "evidencias",
}: LibroObraClientProps) {
  const { proyectoActivo } = useProyecto()
  const [desde, setDesde] = useState(defaultDesde)
  const [hasta, setHasta] = useState(defaultHasta)
  const entradasFiltradas = useMemo(
    () => filtrarEntradasLibroObra(entradasProp, desde || undefined, hasta || undefined),
    [entradasProp, desde, hasta]
  )

  const rangoEtiqueta = useMemo(() => etiquetaRango(entradasFiltradas), [entradasFiltradas])
  const totalEvidencias = useMemo(() => contarEvidencias(entradasFiltradas), [entradasFiltradas])

  function handleImprimir() {
    // No hacer scroll al documento: en móvil solo bajaba la vista y parecía que el botón fallaba.
    document.body.classList.add("libro-obra-modo-impresion")
    const quitarModo = () => {
      document.body.classList.remove("libro-obra-modo-impresion")
    }
    window.addEventListener("afterprint", quitarModo, { once: true })
    window.print()
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
                {tituloDocumento ?? "Informe de evidencias de obra"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {variant === "planilla"
                  ? "Una hoja EPA por día (libro programático VAE): bloques por frente, m³ y PK distintos por fecha; no depende de cargas del residente."
                  : tituloDocumento
                    ? "Documento de planilla — periodo filtrado automáticamente"
                    : "Fiscalización interna — consolidado del registro fotográfico"}
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

        <Card className="libro-obra-toolbar sticky top-0 z-20 border-foreground/10 bg-card shadow-sm print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generar documento</CardTitle>
            <CardDescription>
              {variant === "planilla"
                ? "Civil (Trasvase/San Antonio) todos los días con producción VAE; Severino solo en hitos eléctricos del periodo."
                : "Una entrada por cada día con evidencias fotográficas. Las fotos se comprimen automáticamente para un PDF más liviano."}
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
              <Button
                type="button"
                className="w-full shrink-0 sm:w-auto"
                onClick={handleImprimir}
              >
                <Printer className="size-4" aria-hidden />
                Imprimir / Guardar PDF
              </Button>
            </div>
            <LibroObraAyudaGuardarPdf />

            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                <dt className="text-xs text-muted-foreground">Hojas diarias</dt>
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
          variant={variant}
          proyecto={proyectoActivo}
        />
      </main>
    </div>
  )
}
