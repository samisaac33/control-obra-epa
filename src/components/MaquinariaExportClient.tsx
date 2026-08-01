"use client"

import { Printer } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MaquinariaDocumento } from "@/src/components/MaquinariaDocumento"
import { REGISTRO_MAQUINARIA, PERIODO_MAQUINARIA } from "@/src/data/registro-maquinaria"
import {
  contarRegistrosEquipo,
  filtrarRegistroMaquinaria,
  resolverRangoMaquinaria,
  rangoMaquinariaInvalido,
} from "@/src/lib/maquinaria-filtro"
import { formatearFechaCorta, kpisMaquinaria } from "@/src/lib/maquinaria-resumen"

type MaquinariaExportClientProps = {
  generadoEn: string
}

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-auto"

export function MaquinariaExportClient({ generadoEn }: MaquinariaExportClientProps) {
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [errorRango, setErrorRango] = useState<string | null>(null)

  const rango = useMemo(() => resolverRangoMaquinaria(desde || undefined, hasta || undefined), [desde, hasta])

  const diasFiltrados = useMemo(
    () => filtrarRegistroMaquinaria(REGISTRO_MAQUINARIA, desde || undefined, hasta || undefined),
    [desde, hasta]
  )

  const rangoEtiqueta = useMemo(() => {
    if (!desde && !hasta) return PERIODO_MAQUINARIA.etiqueta
    return `${formatearFechaCorta(rango.inicio)} — ${formatearFechaCorta(rango.fin)}`
  }, [desde, hasta, rango])

  const kpis = useMemo(() => kpisMaquinaria(diasFiltrados), [diasFiltrados])
  const totalRegistros = useMemo(() => contarRegistrosEquipo(diasFiltrados), [diasFiltrados])

  function handleImprimir() {
    if (rangoMaquinariaInvalido(desde, hasta)) {
      setErrorRango("La fecha «Desde» no puede ser posterior a «Hasta».")
      return
    }

    setErrorRango(null)
    window.print()
  }

  return (
    <>
      <Card className="maquinaria-toolbar border-foreground/10 print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generar documento</CardTitle>
          <CardDescription>
            Reporte consolidado de maquinaria y transporte. Use el diálogo del navegador para guardar
            como PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Desde</span>
              <input
                type="date"
                value={desde}
                onChange={(event) => {
                  setDesde(event.target.value)
                  setErrorRango(null)
                }}
                className={INPUT_CLASS}
              />
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Hasta</span>
              <input
                type="date"
                value={hasta}
                onChange={(event) => {
                  setHasta(event.target.value)
                  setErrorRango(null)
                }}
                className={INPUT_CLASS}
              />
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDesde("")
                setHasta("")
                setErrorRango(null)
              }}
            >
              Limpiar filtros
            </Button>
            <Button type="button" onClick={handleImprimir}>
              <Printer className="size-4" aria-hidden />
              Imprimir / Guardar PDF
            </Button>
          </div>

          {errorRango ? (
            <p className="text-sm text-destructive" role="alert">
              {errorRango}
            </p>
          ) : null}

          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Días con actividad</dt>
              <dd className="font-semibold">{kpis.diasConActividad}</dd>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Registros de equipo</dt>
              <dd className="font-semibold">{totalRegistros}</dd>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Período</dt>
              <dd className="font-semibold leading-snug">{rangoEtiqueta}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="maquinaria-documento-preview mt-6 print:mt-0">
        <MaquinariaDocumento
          dias={diasFiltrados}
          rango={rango}
          rangoEtiqueta={rangoEtiqueta}
          generadoEn={generadoEn}
        />
      </div>
    </>
  )
}
