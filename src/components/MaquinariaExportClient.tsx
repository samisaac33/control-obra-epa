"use client"

import { Printer } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MaquinariaDocumento } from "@/src/components/MaquinariaDocumento"
import { MaquinariaDocumentoPorSitio } from "@/src/components/MaquinariaDocumentoPorSitio"
import {
  ETAPAS_MAQUINARIA,
  ETAPAS_MAQUINARIA_OPCIONES,
  type EtapaMaquinariaId,
} from "@/src/data/maquinaria-etapas"
import { useRegistroMaquinariaProyecto } from "@/src/hooks/use-registro-maquinaria-proyecto"
import {
  aplicarEtapaMaquinaria,
  contarRegistrosEquipo,
  filtrarRegistroMaquinaria,
  resolverRangoMaquinaria,
  rangoMaquinariaInvalido,
  type TipoReporteMaquinaria,
} from "@/src/lib/maquinaria-filtro"
import { construirReportePorSitio } from "@/src/lib/maquinaria-reporte-sitio"
import { formatearFechaCorta, formatearNumero, kpisMaquinaria, kpisMaquinas } from "@/src/lib/maquinaria-resumen"

export type { TipoReporteMaquinaria }

type MaquinariaExportClientProps = {
  generadoEn: string
}

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-auto"

function descripcionReporte(tipoReporte: TipoReporteMaquinaria): string {
  switch (tipoReporte) {
    case "por_sitio":
      return "Reporte cronológico por sitio con viajes desglosados. Use el diálogo del navegador para guardar como PDF."
    case "horas_maquinas":
      return "Reporte de horas de máquinas por frente y consolidado. Use el diálogo del navegador para guardar como PDF."
    default:
      return "Reporte consolidado de maquinaria y transporte. Use el diálogo del navegador para guardar como PDF."
  }
}

export function MaquinariaExportClient({ generadoEn }: MaquinariaExportClientProps) {
  const { registros, periodo } = useRegistroMaquinariaProyecto()
  const [etapa, setEtapa] = useState<EtapaMaquinariaId>("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [tipoReporte, setTipoReporte] = useState<TipoReporteMaquinaria>("operativo")
  const [errorRango, setErrorRango] = useState<string | null>(null)

  const rango = useMemo(() => resolverRangoMaquinaria(desde || undefined, hasta || undefined), [desde, hasta])

  const diasFiltrados = useMemo(
    () => filtrarRegistroMaquinaria(registros, desde || undefined, hasta || undefined),
    [desde, hasta, registros]
  )

  const rangoEtiqueta = useMemo(() => {
    if (!desde && !hasta) return periodo.etiqueta
    return `${formatearFechaCorta(rango.inicio)} — ${formatearFechaCorta(rango.fin)}`
  }, [desde, hasta, periodo.etiqueta, rango])

  const kpis = useMemo(() => kpisMaquinaria(diasFiltrados), [diasFiltrados])
  const kpisHoras = useMemo(() => kpisMaquinas(diasFiltrados), [diasFiltrados])
  const totalRegistros = useMemo(() => contarRegistrosEquipo(diasFiltrados), [diasFiltrados])
  const reporteSitio = useMemo(() => {
    const frentes = etapa ? ETAPAS_MAQUINARIA[etapa].frentes : undefined
    return construirReportePorSitio(diasFiltrados, frentes)
  }, [diasFiltrados, etapa])

  function handleEtapaChange(nuevaEtapa: EtapaMaquinariaId) {
    setEtapa(nuevaEtapa)
    setErrorRango(null)

    if (!nuevaEtapa) return

    const aplicada = aplicarEtapaMaquinaria(nuevaEtapa)
    setDesde(aplicada.desde)
    setHasta(aplicada.hasta)
    if (aplicada.tipoReporte) {
      setTipoReporte(aplicada.tipoReporte)
    }
  }

  function handleDesdeChange(valor: string) {
    setDesde(valor)
    setEtapa("")
    setErrorRango(null)
  }

  function handleHastaChange(valor: string) {
    setHasta(valor)
    setEtapa("")
    setErrorRango(null)
  }

  function handleLimpiar() {
    setEtapa("")
    setDesde("")
    setHasta("")
    setTipoReporte("operativo")
    setErrorRango(null)
  }

  function handleImprimir() {
    if (rangoMaquinariaInvalido(desde, hasta)) {
      setErrorRango("La fecha «Desde» no puede ser posterior a «Hasta».")
      return
    }

    setErrorRango(null)
    window.print()
  }

  const etapaActiva = etapa !== ""

  return (
    <>
      <Card className="maquinaria-toolbar border-foreground/10 print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generar documento</CardTitle>
          <CardDescription>{descripcionReporte(tipoReporte)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Etapa</span>
              <select
                value={etapa}
                onChange={(event) => handleEtapaChange(event.target.value as EtapaMaquinariaId)}
                className={INPUT_CLASS}
              >
                {ETAPAS_MAQUINARIA_OPCIONES.map((opcion) => (
                  <option key={opcion.id || "manual"} value={opcion.id}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Desde</span>
              <input
                type="date"
                value={desde}
                onChange={(event) => handleDesdeChange(event.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Hasta</span>
              <input
                type="date"
                value={hasta}
                onChange={(event) => handleHastaChange(event.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Tipo de reporte</span>
              <select
                value={tipoReporte}
                onChange={(event) => setTipoReporte(event.target.value as TipoReporteMaquinaria)}
                className={INPUT_CLASS}
                disabled={etapaActiva}
              >
                <option value="operativo">Operativo completo</option>
                <option value="horas_maquinas">Horas de máquinas</option>
                <option value="por_sitio">Por sitio</option>
              </select>
            </label>
            <Button type="button" variant="outline" onClick={handleLimpiar}>
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
            {tipoReporte === "por_sitio" ? (
              <>
                <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Días con actividad</dt>
                  <dd className="font-semibold">{reporteSitio.totalesGlobales.diasConActividad}</dd>
                </div>
                <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Total viajes Jimmy</dt>
                  <dd className="font-semibold">{reporteSitio.totalesGlobales.viajesJimmy}</dd>
                </div>
                <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Total viajes Mauricio</dt>
                  <dd className="font-semibold">{reporteSitio.totalesGlobales.viajesMauricio}</dd>
                </div>
              </>
            ) : tipoReporte === "operativo" ? (
              <>
                <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Días con actividad</dt>
                  <dd className="font-semibold">{kpis.diasConActividad}</dd>
                </div>
                <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Registros de equipo</dt>
                  <dd className="font-semibold">{totalRegistros}</dd>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Días con máquinas</dt>
                  <dd className="font-semibold">{kpisHoras.diasConActividadMaquina}</dd>
                </div>
                <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Registros de máquina</dt>
                  <dd className="font-semibold">{kpisHoras.registrosMaquina}</dd>
                </div>
                <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Total días-equipo (máquinas)</dt>
                  <dd className="font-semibold">{formatearNumero(kpisHoras.totalDiasEquipoMaquinas)}</dd>
                </div>
              </>
            )}
            <div className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Período</dt>
              <dd className="font-semibold leading-snug">{rangoEtiqueta}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="maquinaria-documento-preview mt-6 print:mt-0">
        {tipoReporte === "por_sitio" ? (
          <MaquinariaDocumentoPorSitio
            dias={diasFiltrados}
            rangoEtiqueta={rangoEtiqueta}
            generadoEn={generadoEn}
            etapaId={etapa}
          />
        ) : (
          <MaquinariaDocumento
            dias={diasFiltrados}
            rango={rango}
            rangoEtiqueta={rangoEtiqueta}
            generadoEn={generadoEn}
            tipoReporte={tipoReporte}
          />
        )}
      </div>
    </>
  )
}
