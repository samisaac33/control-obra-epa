"use client"

import { FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  urlInformeCompletoMaquinariaPdf,
  urlInformeConsolidadoMaquinariaPdf,
} from "@/src/lib/maquinaria/urls-informes-maquinaria"

type MaquinariaDesasolveInformesAccionesProps = {
  /** En la barra del mapa: botones más compactos. */
  compact?: boolean
  className?: string
}

/** Informe completo y consolidado en PDF (sin redirigir a la vista de maquinaria). */
export function MaquinariaDesasolveInformesAcciones({
  compact = false,
  className,
}: MaquinariaDesasolveInformesAccionesProps) {
  const { proyectoId } = useProyecto()
  const urlCompletoPdf = urlInformeCompletoMaquinariaPdf(proyectoId)
  const urlConsolidadoPdf = urlInformeConsolidadoMaquinariaPdf(proyectoId)

  const size = compact ? ("sm" as const) : ("default" as const)
  const btnClass = compact ? "h-9 gap-1.5 px-2 text-xs sm:text-sm" : "gap-2"

  return (
    <div className={className ?? "grid grid-cols-1 gap-2 sm:grid-cols-2"}>
      <Button asChild variant="outline" size={size} className={btnClass}>
        <a href={urlCompletoPdf} download>
          <FileDown className="size-3.5 shrink-0 sm:size-4" aria-hidden />
          {compact ? "Informe completo" : "Descargar informe completo"}
        </a>
      </Button>
      <Button asChild variant="secondary" size={size} className={btnClass}>
        <a href={urlConsolidadoPdf} download>
          <FileDown className="size-3.5 shrink-0 sm:size-4" aria-hidden />
          {compact ? "Informe consolidado" : "Descargar informe consolidado"}
        </a>
      </Button>
    </div>
  )
}