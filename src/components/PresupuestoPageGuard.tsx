"use client"

import { ProyectoModuloGuard } from "@/src/components/ProyectoModuloGuard"

export function PresupuestoPageGuard({ children }: { children: React.ReactNode }) {
  return <ProyectoModuloGuard modulo="presupuesto">{children}</ProyectoModuloGuard>
}
