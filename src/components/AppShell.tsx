"use client"

type AppShellProps = {
  children: React.ReactNode
}

/** Contenedor raíz; la navegación por obra vive en ProyectoShell. */
export function AppShell({ children }: AppShellProps) {
  return <>{children}</>
}
