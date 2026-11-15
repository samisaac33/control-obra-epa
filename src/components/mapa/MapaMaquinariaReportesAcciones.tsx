"use client"

import Link from "next/link"
import { FileText, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { rutaObra } from "@/src/lib/rutas-proyecto"

/** Accesos rápidos al reporte de maquinaria (desasolve), desde el mapa. */
export function MapaMaquinariaReportesAcciones() {
  const { proyectoId } = useProyecto()
  const urlMaquinaria = rutaObra(proyectoId, "maquinaria")
  const urlConsolidado = `${urlMaquinaria}?imprimir=consolidado`

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 px-2 text-xs sm:text-sm">
        <Link href={urlMaquinaria}>
          <FileText className="size-3.5 shrink-0" aria-hidden />
          Reporte completo
        </Link>
      </Button>
      <Button asChild variant="secondary" size="sm" className="h-9 gap-1.5 px-2 text-xs sm:text-sm">
        <Link href={urlConsolidado}>
          <Printer className="size-3.5 shrink-0" aria-hidden />
          Reporte consolidado
        </Link>
      </Button>
    </div>
  )
}