"use client"

import Link from "next/link"
import { ArrowLeft, Download, ExternalLink } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT,
  CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH,
  nombreArchivoCronogramaEjecutadoVigente,
} from "@/src/data/planilla/cronograma-ejecutado-documento"
import type { PlanillaNumero } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { rutaObra } from "@/src/lib/rutas-proyecto"

type Props = {
  planillaNumero: PlanillaNumero
}

export function PlanillaCronogramaEjecutadoClient({ planillaNumero }: Props) {
  const { proyectoId } = useProyecto()
  const [archivoDisponible, setArchivoDisponible] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelado = false
    void fetch(CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH, { method: "HEAD" })
      .then((res) => {
        if (!cancelado) setArchivoDisponible(res.ok)
      })
      .catch(() => {
        if (!cancelado) setArchivoDisponible(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const urlVisorOffice = useMemo(() => {
    if (typeof window === "undefined") return null
    const origen = window.location.origin
    const archivoAbsoluto = `${origen}${CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH}`
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(archivoAbsoluto)}`
  }, [])

  const esProduccionHttps =
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    !window.location.hostname.includes("localhost")

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href={rutaObra(proyectoId, `planillas/${planillaNumero}`)}
            className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/50"
            aria-label="Volver a planilla"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Cronograma ejecutado (vigente)</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Archivo Excel oficial ({AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT} % planilla 1). El
              libro de obra, mediciones y cronograma interno usan el mismo avance contractual.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="default" asChild disabled={archivoDisponible === false}>
            <a
              href={CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH}
              download={nombreArchivoCronogramaEjecutadoVigente()}
            >
              <Download className="size-4" aria-hidden />
              Descargar Excel
            </a>
          </Button>
          <Button type="button" variant="outline" asChild disabled={archivoDisponible === false}>
            <a href={CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden />
              Abrir archivo
            </a>
          </Button>
        </div>
      </div>

      {archivoDisponible === false ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          No se encontró el archivo en {CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH}.
        </p>
      ) : null}

      {archivoDisponible !== false && esProduccionHttps && urlVisorOffice ? (
        <div className="overflow-hidden rounded-lg border border-foreground/15 bg-muted/20">
          <iframe
            title="Cronograma ejecutado vigente"
            src={urlVisorOffice}
            className="h-[min(80vh,720px)] w-full bg-white"
          />
        </div>
      ) : archivoDisponible ? (
        <p className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Vista previa en línea disponible en el sitio publicado (HTTPS). Use Descargar Excel para
          abrirlo en Excel o Numbers.
        </p>
      ) : null}
    </div>
  )
}
