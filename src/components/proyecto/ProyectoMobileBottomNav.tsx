"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Camera, LayoutDashboard, Map, Truck } from "lucide-react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"
import { esRutaMapaObra, rutaObra } from "@/src/lib/rutas-proyecto"
import { SECCIONES_NAV_INFERIOR_DESASOLVE } from "@/src/lib/proyecto-seccion-desde-path"
import { cn } from "@/lib/utils"

const ICONOS = {
  "": LayoutDashboard,
  mapa: Map,
  fotos: Camera,
  maquinaria: Truck,
} as const

export function useMostrarBottomNavDesasolve(): boolean {
  const pathname = usePathname()
  const esViewportMovil = useEsViewportMovil()
  const { proyectoActivo } = useProyecto()
  return (
    proyectoActivo.id === PROYECTO_DESASOLVE_CANALES &&
    esViewportMovil &&
    !esRutaMapaObra(pathname)
  )
}

export function ProyectoMobileBottomNav() {
  const pathname = usePathname()
  const { proyectoActivo } = useProyecto()
  const mostrar = useMostrarBottomNavDesasolve()

  if (!mostrar) return null

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-card/95 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-foreground/5 backdrop-blur-md supports-backdrop-filter:bg-card/90 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navegación principal del proyecto"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {SECCIONES_NAV_INFERIOR_DESASOLVE.map(({ segment, labelCorto }) => {
          const href = rutaObra(proyectoActivo.id, segment)
          const isActive =
            pathname === href || (href !== rutaObra(proyectoActivo.id) && pathname.startsWith(`${href}/`))
          const Icon = ICONOS[segment as keyof typeof ICONOS] ?? LayoutDashboard
          return (
            <li key={segment || "inicio"} className="min-w-0 flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium touch-manipulation outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn("size-5 shrink-0", isActive && "text-foreground")}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="max-w-full truncate leading-tight">{labelCorto}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
