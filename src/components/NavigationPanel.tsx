"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Camera,
  ClipboardList,
  FileWarning,
  LayoutDashboard,
  Map,
  Truck,
} from "lucide-react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import type { ProyectoModulo } from "@/src/data/proyectos/catalog"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { cn } from "@/lib/utils"

const items: {
  segment: string
  label: string
  icon: typeof LayoutDashboard
  modulo: ProyectoModulo
}[] = [
  { segment: "", label: "Inicio", icon: LayoutDashboard, modulo: "fotos" },
  { segment: "emergencia", label: "Informe de afectación", icon: FileWarning, modulo: "afectacion" },
  { segment: "presupuesto", label: "Presupuesto", icon: ClipboardList, modulo: "presupuesto" },
  { segment: "maquinaria", label: "Maquinaria y transporte", icon: Truck, modulo: "maquinaria" },
  { segment: "mapa", label: "Mapa de avance", icon: Map, modulo: "mapaTramos" },
  { segment: "fotos", label: "Registro Fotográfico", icon: Camera, modulo: "fotos" },
  { segment: "libro-obra", label: "Informe de evidencias de obra", icon: BookOpen, modulo: "libroObra" },
]

type NavigationPanelProps = {
  /** Cierra el drawer móvil al pulsar un enlace */
  onNavigate?: () => void
  /** Más padding derecho para el botón cerrar del drawer */
  isDrawer?: boolean
  className?: string
}

export function NavigationPanel({ onNavigate, isDrawer, className }: NavigationPanelProps) {
  const pathname = usePathname()
  const { proyectoActivo } = useProyecto()

  const itemsVisibles = items
    .filter((item) => {
      if (item.segment === "") return true
      return proyectoActivo.modulos[item.modulo]
    })
    .map((item) => ({
      ...item,
      href: rutaObra(proyectoActivo.id, item.segment),
    }))

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div
        className={cn(
          "shrink-0 border-b border-slate-800/80 px-4 pt-3 pb-4 sm:pt-4",
          isDrawer ? "pr-10" : "pr-4"
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Control de Obra
        </p>
        <p className="mt-1.5 text-base font-semibold leading-tight text-white">{proyectoActivo.nombreObra}</p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Secciones">
        <ul className="space-y-0.5">
          {itemsVisibles.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== rutaObra(proyectoActivo.id) && pathname.startsWith(`${href}/`))
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex min-h-[44px] min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60",
                    isActive
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-200 hover:bg-slate-800/90 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0 transition-opacity",
                      isActive ? "text-slate-800" : "text-slate-400 group-hover:text-slate-200"
                    )}
                    aria-hidden
                    strokeWidth={1.8}
                  />
                  <span className="min-w-0 break-words leading-snug">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="shrink-0 border-t border-slate-800/80 p-3">
        <p className="text-center text-[10px] text-slate-500">Sistema 2026</p>
      </div>
    </div>
  )
}
