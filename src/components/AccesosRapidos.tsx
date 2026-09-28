"use client"

import Link from "next/link"
import { BookOpen, Camera, ClipboardList, FileWarning, Truck } from "lucide-react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import { rutaObra } from "@/src/lib/rutas-proyecto"

const enlaces = [
  {
    segment: "emergencia",
    label: "Informe de afectación",
    descripcion: "Contexto técnico, afectaciones y solicitudes de beneficiarios",
    icon: FileWarning,
  },
  {
    segment: "presupuesto",
    label: "Presupuesto contractual",
    descripcion: "39 rubros del contrato de emergencia vinculados a la infraestructura",
    icon: ClipboardList,
  },
  {
    segment: "maquinaria",
    label: "Maquinaria y transporte",
    descripcion: "Uso diario de equipos por accionista — 11 mayo a 28 junio 2026",
    icon: Truck,
  },
  {
    segment: "fotos",
    label: "Evidencias fotográficas",
    descripcion: "Consultar evidencias georreferenciadas por sector del sistema",
    icon: Camera,
  },
  {
    segment: "libro-obra",
    label: "Informe de evidencias de obra",
    descripcion: "Fiscalización interna — consolidado del registro fotográfico, exportable a PDF",
    icon: BookOpen,
  },
] as const

export function AccesosRapidos() {
  const { proyectoId } = useProyecto()

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {enlaces.map(({ segment, label, descripcion, icon: Icon }) => {
        const href = rutaObra(proyectoId, segment)
        return (
          <Link
            key={segment}
            href={href}
            className="group flex flex-col rounded-xl border border-foreground/10 bg-card p-4 shadow-sm ring-1 ring-foreground/5 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary">{label}</p>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{descripcion}</p>
            <span className="mt-3 text-xs font-medium text-primary">Ir a la sección →</span>
          </Link>
        )
      })}
    </div>
  )
}
