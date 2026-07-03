"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Camera, ClipboardList, FileWarning, LayoutDashboard, Truck } from "lucide-react"

import { PROYECTO } from "@/src/data/proyecto"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/emergencia", label: "Informe de afectación", icon: FileWarning },
  { href: "/presupuesto", label: "Presupuesto", icon: ClipboardList },
  { href: "/maquinaria", label: "Maquinaria y transporte", icon: Truck },
  { href: "/fotos", label: "Registro Fotográfico", icon: Camera },
  { href: "/libro-obra", label: "Informe de evidencias de obra", icon: BookOpen },
] as const

type NavigationPanelProps = {
  /** Cierra el drawer móvil al pulsar un enlace */
  onNavigate?: () => void
  /** Más padding derecho para el botón cerrar del drawer */
  isDrawer?: boolean
  className?: string
}

export function NavigationPanel({ onNavigate, isDrawer, className }: NavigationPanelProps) {
  const pathname = usePathname()

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
        <p className="mt-1 text-sm leading-tight text-slate-300">{PROYECTO.nombreObra}</p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Secciones">
        <ul className="space-y-0.5">
          {items.map(({ href, label, icon: Icon }) => {
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
