"use client"

import Link from "next/link"
import { ArrowLeft, Download, FileText, Printer } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { configCronogramaEjecutadoEpa } from "@/lib/planilla/config-cronograma-planilla"
import {
  AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT,
  nombreArchivoCronogramaEjecutadoEpaPdf,
} from "@/src/data/planilla/cronograma-ejecutado-documento"
import {
  AVANCE_PLANILLA_1_CRONOGRAMA_PROGRAMADO_PCT,
  CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH,
  CRONOGRAMA_PROGRAMADO_XLSX_PUBLIC_PATH,
  nombreArchivoCronogramaProgramadoPdf,
  nombreArchivoCronogramaProgramadoXlsx,
} from "@/src/data/planilla/cronograma-programado-documento"
import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import type { PlanillaNumero, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import {
  lineaFirmaPersonal,
  superintendenteObra,
} from "@/src/data/planilla/personal-tecnico-contratista"
import { calcularCronogramaEjecutadoEpa } from "@/src/lib/planilla-cronograma-epa"
import { entregarPdfLibroObra } from "@/src/lib/libro-obra-exportar-pdf"
import { cargarMedicionesRubrosPlanilla } from "@/src/lib/cargar-planilla-medicion-rubros"
import type { MedicionRubroGuardada } from "@/src/lib/planilla-requerimiento-pago"
import { createClient } from "@/src/lib/supabase/client"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { rutaObra } from "@/src/lib/rutas-proyecto"

import { CronogramaEpaHoja } from "./CronogramaEpaHoja"

type PlanillaCronogramaValoradoClientProps = {
  config: ProyectoPlanillaConfig
  planillaNumero: PlanillaNumero
}

export function PlanillaCronogramaValoradoClient({
  config,
  planillaNumero,
}: PlanillaCronogramaValoradoClientProps) {
  const { proyectoId, proyectoActivo } = useProyecto()
  const rubros = useMemo(() => presupuestoRubrosPorProyecto(proyectoId), [proyectoId])
  const [med1, setMed1] = useState<MedicionRubroGuardada[] | undefined>()
  const [med2, setMed2] = useState<MedicionRubroGuardada[] | undefined>()
  const [errorMed, setErrorMed] = useState<string | null>(null)
  const [descargando, setDescargando] = useState<"combinado" | null>(null)
  const [errorPdf, setErrorPdf] = useState<string | null>(null)

  const configEjecutado = useMemo(
    () => configCronogramaEjecutadoEpa(config, planillaNumero),
    [config, planillaNumero]
  )

  const cargarMediciones = useCallback(async () => {
    setErrorMed(null)
    try {
      const supabase = createClient()
      const m1 = await cargarMedicionesRubrosPlanilla(supabase, proyectoId, 1)
      setMed1(m1.length > 0 ? m1 : undefined)
      if (planillaNumero >= 2) {
        const m2 = await cargarMedicionesRubrosPlanilla(supabase, proyectoId, 2)
        setMed2(m2.length > 0 ? m2 : undefined)
      }
    } catch (err) {
      setErrorMed(err instanceof Error ? err.message : "No se pudieron cargar mediciones.")
    }
  }, [planillaNumero, proyectoId])

  useEffect(() => {
    void cargarMediciones()
  }, [cargarMediciones])

  useEffect(() => {
    const quitarModoImpresion = () => {
      document.body.classList.remove("cronograma-epa-modo-impresion")
    }
    quitarModoImpresion()
    window.addEventListener("afterprint", quitarModoImpresion)
    return () => {
      quitarModoImpresion()
      window.removeEventListener("afterprint", quitarModoImpresion)
    }
  }, [])

  const ejecutado = useMemo(
    () =>
      calcularCronogramaEjecutadoEpa(
        rubros,
        configEjecutado,
        proyectoActivo.numeroContrato,
        planillaNumero,
        med1,
        med2
      ),
    [rubros, configEjecutado, proyectoActivo.numeroContrato, planillaNumero, med1, med2]
  )

  const superintendente = superintendenteObra(proyectoId)
  const firmaContratista = superintendente
    ? lineaFirmaPersonal(superintendente, "Superintendente de Obra")
    : undefined

  const pdfProgramadoHref = rutaObra(proyectoId, "planillas/cronograma-valorado-programado/pdf")
  const pdfEjecutadoHref = rutaObra(
    proyectoId,
    `planillas/${planillaNumero}/cronogramas-epa/ejecutado/pdf`
  )
  const pdfCombinadoHref = rutaObra(proyectoId, `planillas/${planillaNumero}/cronogramas-epa/pdf`)

  async function descargarPdfCombinado() {
    setErrorPdf(null)
    setDescargando("combinado")
    try {
      const res = await fetch(pdfCombinadoHref, { credentials: "include" })
      if (!res.ok) {
        throw new Error(await res.text().catch(() => "No se pudo generar el PDF"))
      }
      const blob = await res.blob()
      await entregarPdfLibroObra(blob, `cronogramas-epa-planilla-${planillaNumero}.pdf`)
    } catch (err) {
      setErrorPdf(err instanceof Error ? err.message : "Error al generar el PDF")
    } finally {
      setDescargando(null)
    }
  }

  function handleImprimirEjecutado() {
    document.body.classList.add("cronograma-epa-modo-impresion")
    window.print()
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 p-4 print:max-w-none print:space-y-0 print:p-0 sm:p-6">
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href={rutaObra(proyectoId, `planillas/${planillaNumero}`)}
            className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/50"
            aria-label="Volver a planilla"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Cronograma valorado programado y ejecutado
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Programado: PDF del Excel oficial ({AVANCE_PLANILLA_1_CRONOGRAMA_PROGRAMADO_PCT} %).
              Ejecutado EPA: {AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT} % en planilla 1 (libro de
              obra alineado).
            </p>
            {errorPdf ? <p className="mt-1 text-sm text-destructive">{errorPdf}</p> : null}
            {errorMed ? (
              <p className="mt-1 text-sm text-destructive">{errorMed}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Ejecutado: mediciones de requerimiento de pago
                {med1 ? " (planilla 1)" : " (planilla 1: reparto sugerido)"}
                {planillaNumero >= 2 ? (med2 ? " · planilla 2" : " · planilla 2: sugerido") : ""}.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <a href={pdfProgramadoHref} download={nombreArchivoCronogramaProgramadoPdf()}>
              <Download className="size-4" aria-hidden />
              PDF programado
            </a>
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href={pdfEjecutadoHref} download={nombreArchivoCronogramaEjecutadoEpaPdf(planillaNumero)}>
              <Download className="size-4" aria-hidden />
              PDF ejecutado
            </a>
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={descargando === "combinado"}
            onClick={() => void descargarPdfCombinado()}
          >
            <FileText className="size-4" aria-hidden />
            {descargando === "combinado" ? "Generando…" : "PDF 2 páginas"}
          </Button>
          <Button type="button" variant="secondary" asChild>
            <a href={CRONOGRAMA_PROGRAMADO_XLSX_PUBLIC_PATH} download={nombreArchivoCronogramaProgramadoXlsx()}>
              <Download className="size-4" aria-hidden />
              Excel programado
            </a>
          </Button>
        </div>
      </div>

      <section className="space-y-3 print:hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cronograma valorado programado ({AVANCE_PLANILLA_1_CRONOGRAMA_PROGRAMADO_PCT} %)
        </h2>
        <div className="overflow-hidden rounded-lg border border-foreground/15 bg-muted/20">
          <iframe
            title="Cronograma valorado programado"
            src={CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH}
            className="h-[min(70vh,640px)] w-full bg-white"
          />
        </div>
      </section>

      <section className="space-y-3" id="cronograma-epa-documento">
        <div className="flex items-center justify-between gap-2 print:hidden">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Cronograma ejecutado ({AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT} % planilla 1)
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={handleImprimirEjecutado}>
            <Printer className="size-4" aria-hidden />
            Imprimir ejecutado
          </Button>
        </div>
        <CronogramaEpaHoja datos={ejecutado} firmaContratista={firmaContratista} />
      </section>
    </div>
  )
}
