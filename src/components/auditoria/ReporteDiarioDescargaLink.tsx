"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useProyecto } from "@/src/contexts/ProyectoContext"

export function ReporteDiarioDescargaLink() {
  const { proyectoId } = useProyecto()
  const fecha = new Date().toISOString().slice(0, 10)
  return (
    <Button variant="outline" asChild>
      <Link href={`/${proyectoId}/reporte-diario?fecha=${fecha}`}>Descargar reporte diario PDF</Link>
    </Button>
  )
}
