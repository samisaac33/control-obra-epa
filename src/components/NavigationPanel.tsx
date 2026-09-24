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

import { ProyectoSelect } from "@/src/components/ProyectoSelect"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import type { ProyectoModulo } from "@/src/data/proyectos/catalog"
import { cn } from "@/lib/utils"

const items: {
  href: string
  label: string
  icon: typeof LayoutDashboard
  modulo: ProyectoModulo
}[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, modulo: "fotos" },
  { href: "/emergencia", label: "Informe de afectación", icon: FileWarning, modulo: "afectacion" },
  { href: "/presupuesto", label: "Presupuesto", icon: ClipboardList, modulo: "presupuesto" },
  { href: "/maquinaria", label: "Maquinaria y transporte", icon: Truck, modulo: "maquinaria" },
  { href: "/mapa", label: "Mapa de avance", icon: Map, modulo: "mapaTramos" },
  { href: "/fotos", label: "Registro Fotográfico", icon: Camera, modulo: "fotos" },
  { href: "/libro-obra", label: "Informe de evidencias de obra", icon: BookOpen, modulo: "libroObra" },
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

  const itemsVisibles = items.filter((item) => {
    if (item.href === "/") return true
    return proyectoActivo.modulos[item.modulo]
  })

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
        <p className="mt-1.5 text-base font-semibold leading-tight text-white">JBS Consorcio</p>
        <p className="mt-1 text-sm leading-tight text-slate-300">{proyectoActivo.nombreObra}</p>
        {isDrawer ? (
          <div className="mt-3">
            <ProyectoSelect className="w-full max-w-none border-slate-600 bg-slate-900 text-slate-100" compact />
          </div>
        ) : null}
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Secciones">
        <ul className="space-y-0.5">
          {itemsVisibles.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
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
