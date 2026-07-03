"use client"

import { usePathname } from "next/navigation"

import { AppHeader } from "@/src/components/AppHeader"
import { Sidebar } from "@/src/components/Sidebar"

type AppShellProps = {
  children: React.ReactNode
}

const AUTH_ROUTES = ["/login"]
const SICC_PREFIX = "/sicc"

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const hideNavigation =
    AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    pathname === SICC_PREFIX ||
    pathname.startsWith(`${SICC_PREFIX}/`)

  if (hideNavigation) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col md:pl-64">
        <AppHeader />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </>
  )
}
