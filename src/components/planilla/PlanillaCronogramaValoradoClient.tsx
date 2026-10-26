"use client"

import Link from "next/link"
import { ArrowLeft, Download, FileText, Printer } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import type { PlanillaNumero, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import {
  lineaFirmaPersonal,
  superintendenteObra,
} from "@/src/data/planilla/personal-tecnico-contratista"
import {
  calcularCronogramaEjecutadoEpa,
  calcularCronogramaValoradoProgramadoEpa,
} from "@/src/lib/planilla-cronograma-epa"
import { CRONOGRAMA_VALORADO_FIRMADO_PUBLIC_PATH } from "@/src/lib/planilla-cronograma-valorado-vigente"
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

  const programado = useMemo(
    () => calcularCronogramaValoradoProgramadoEpa(rubros, config, proyectoActivo.numeroContrato),
    [rubros, config, proyectoActivo.numeroContrato]
  )

  const ejecutado = useMemo(
    () =>
      calcularCronogramaEjecutadoEpa(
        rubros,
        config,
        proyectoActivo.numeroContrato,
        planillaNumero,
        med1,
        med2
      ),
    [rubros, config, proyectoActivo.numeroContrato, planillaNumero, med1, med2]
  )

  const superintendente = superintendenteObra(proyectoId)
  const firmaContratista = superintendente
    ? lineaFirmaPersonal(superintendente, "Superintendente de Obra")
    : undefined

  const pdfHref = rutaObra(
    proyectoId,
    `planillas/${planillaNumero}/cronogramas-epa/pdf`
  )

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 print:max-w-none print:space-y-0 print:p-0 sm:p-6">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .cronograma-epa-hoja:last-of-type { break-after: auto; }
        }
      `}</style>

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
              Cronogramas valorado programado y ejecutado
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Formato EPA — columnas DIAS {programado.encabezado.etiquetasDias.join(" / ")} (planillas 1
              y 2). Programado con reparto {config.porcentaje_avance_planilla_1} % en planilla 1.
            </p>
            {errorMed ? (
              <p className="mt-1 text-sm text-destructive">{errorMed}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Ejecutado: mediciones guardadas de requerimiento de pago
                {med1 ? " (planilla 1)" : " (planilla 1: sugeridas)"}
                {planillaNumero >= 2 ? (med2 ? " · planilla 2" : " · planilla 2: sugeridas") : ""}.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden />
            Imprimir (2 páginas)
          </Button>
          <Button type="button" variant="default" asChild>
            <a href={pdfHref} target="_blank" rel="noopener noreferrer">
              <FileText className="size-4" aria-hidden />
              Generar PDF
            </a>
          </Button>
          <Button type="button" variant="secondary" asChild>
            <a href={CRONOGRAMA_VALORADO_FIRMADO_PUBLIC_PATH} download>
              <Download className="size-4" aria-hidden />
              PDF firmado (oferta)
            </a>
          </Button>
        </div>
      </div>

      <CronogramaEpaHoja datos={programado} firmaContratista={firmaContratista} />
      <CronogramaEpaHoja
        datos={ejecutado}
        firmaContratista={firmaContratista}
        className="print:break-before-page"
      />
    </div>
  )
}
