import Link from "next/link"
import {
  BookOpen,
  Building2,
  Calculator,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LineChart,
  Package,
  Ruler,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useSiccAuth } from "@/components/sicc/sicc-auth-provider"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import { SiccDatosSync } from "@/components/sicc/sicc-datos-sync"
import { MODULOS_SICC, SICC_BASE } from "@/lib/sicc/modules"
import type { ModuloId } from "@/lib/sicc/types"

const ICONOS: Record<ModuloId, React.ComponentType<{ className?: string }>> = {
  presupuesto: Calculator,
  metrados: Ruler,
  "libro-obra": BookOpen,
  certificaciones: ClipboardCheck,
  planificacion: LineChart,
  compras: Package,
  calidad: ShieldCheck,
  equipos: Truck,
  rrhh: Users,
  contratos: FileText,
  finanzas: Wallet,
  reportes: LayoutDashboard,
}

export function SiccSidebar({
  moduloActivo,
  esAdministracion = false,
}: {
  moduloActivo?: ModuloId | "inicio"
  esAdministracion?: boolean
}) {
  const { puedeAdministrar } = useSiccAuth()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="SICC — Inicio">
              <Link href={SICC_BASE}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[oklch(0.42_0.12_250)] text-white">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SICC</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Sistema integrado
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Fase 1 — Campo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULOS_SICC.filter((m) => m.fase === 1).map((modulo) => {
                const Icono = ICONOS[modulo.id]
                return (
                  <SidebarMenuItem key={modulo.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={moduloActivo === modulo.id}
                      tooltip={modulo.titulo}
                    >
                      <Link href={modulo.href}>
                        <Icono className="size-4" />
                        <span>{modulo.titulo}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Corporativo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULOS_SICC.filter((m) => m.fase > 1).map((modulo) => {
                const Icono = ICONOS[modulo.id]
                return (
                  <SidebarMenuItem key={modulo.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={moduloActivo === modulo.id}
                      tooltip={modulo.titulo}
                    >
                      <Link href={modulo.href}>
                        <Icono className="size-4" />
                        <span>{modulo.titulo}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {puedeAdministrar ? (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Sistema</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={esAdministracion}
                      tooltip="Administración de usuarios"
                    >
                      <Link href={`${SICC_BASE}/administracion`}>
                        <UserCog className="size-4" />
                        <span>Administración</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SiccDatosSync />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function SiccSidebarEstadoResumen() {
  const activos = MODULOS_SICC.filter((m) => m.estado === "activo").length
  const enDesarrollo = MODULOS_SICC.filter((m) => m.estado === "en_desarrollo").length

  return (
    <div className="flex flex-wrap gap-2">
      <EstadoModuloBadge estado="activo" />
      <span className="text-xs text-muted-foreground self-center">
        {activos} módulo activo · {enDesarrollo} en desarrollo
      </span>
    </div>
  )
}
