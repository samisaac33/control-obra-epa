"use client"

import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { AppHeader } from "@/src/components/AppHeader"
import {
  ProyectoMobileBottomNav,
  useMostrarBottomNavDesasolve,
} from "@/src/components/proyecto/ProyectoMobileBottomNav"
import { Sidebar } from "@/src/components/Sidebar"
import { ProyectoProvider } from "@/src/contexts/ProyectoContext"
import { esRutaMapaObra } from "@/src/lib/rutas-proyecto"

type ProyectoShellProps = {
  proyectoId: string
  children: React.ReactNode
}

function ProyectoShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const esMapa = esRutaMapaObra(pathname)
  const bottomNavDesasolve = useMostrarBottomNavDesasolve()

  return (
    <>
      <Sidebar />
      <div className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:pl-64">
        <AppHeader />
        <main
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain",
            esMapa && "transition-[padding-top] duration-300 ease-out motion-reduce:transition-none",
            bottomNavDesasolve && "pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]"
          )}
        >
          {children}
        </main>
        <ProyectoMobileBottomNav />
      </div>
    </>
  )
}

export function ProyectoShell({ proyectoId, children }: ProyectoShellProps) {
  return (
    <ProyectoProvider proyectoId={proyectoId}>
      <ProyectoShellLayout>{children}</ProyectoShellLayout>
    </ProyectoProvider>
  )
}
