"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const TABS = [
  { href: "/infimas", label: "Módulos", match: (path: string) => path === "/infimas" },
  {
    href: "/infimas/documentos",
    label: "Documentos",
    match: (path: string) => path.startsWith("/infimas/documentos"),
  },
] as const

export function InfimasHubNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-foreground/10 pb-4"
      aria-label="Secciones de ínfimas cuantía"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
