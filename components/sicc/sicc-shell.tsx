"use client"

import { usePathname } from "next/navigation"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { SiccAuthGate } from "@/components/sicc/sicc-auth-gate"
import { SiccAuthProvider } from "@/components/sicc/sicc-auth-provider"
import { SiccDataProvider } from "@/components/sicc/sicc-data-provider"
import { SiccSidebar } from "@/components/sicc/sicc-sidebar"
import { SiccUserMenu } from "@/components/sicc/sicc-user-menu"
import { MODULOS_SICC, SICC_BASE } from "@/lib/sicc/modules"
import type { ModuloId } from "@/lib/sicc/types"

const RUTA_INGRESO = `${SICC_BASE}/ingreso`

function moduloDesdeRuta(pathname: string): ModuloId | "inicio" {
  if (pathname === SICC_BASE || pathname === `${SICC_BASE}/`) return "inicio"
  const slug = pathname.replace(`${SICC_BASE}/`, "").split("/")[0]
  const modulo = MODULOS_SICC.find((m) => m.id === slug)
  return modulo?.id ?? "inicio"
}

export function SiccShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const moduloActivo = moduloDesdeRuta(pathname)
  const esIngreso = pathname === RUTA_INGRESO || pathname === `${RUTA_INGRESO}/`

  return (
    <TooltipProvider>
      <SiccAuthProvider>
        {esIngreso ? (
          <SiccAuthGate>{children}</SiccAuthGate>
        ) : (
          <SiccAuthGate>
            <SiccDataProvider>
              <SidebarProvider>
                <SiccSidebar moduloActivo={moduloActivo} />
                <SidebarInset className="bg-[oklch(0.985_0.004_250)]">
                  <header className="flex h-14 shrink-0 items-center gap-2 border-b border-foreground/10 bg-card/80 px-4 backdrop-blur-sm">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">SICC</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Sistema Integrado de Control de Construcción
                      </p>
                    </div>
                    <SiccUserMenu />
                  </header>
                  <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">{children}</div>
                </SidebarInset>
              </SidebarProvider>
            </SiccDataProvider>
          </SiccAuthGate>
        )}
      </SiccAuthProvider>
    </TooltipProvider>
  )
}
