"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { NavigationPanel } from "@/src/components/NavigationPanel"
import { ProyectoSelect } from "@/src/components/ProyectoSelect"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { createClient } from "@/src/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"

const UMBRAL_SCROLL_MAPA_PX = 10

export function AppHeader() {
  const pathname = usePathname()
  const esViewportMovil = useEsViewportMovil()
  const { proyectoActivo } = useProyecto()
  const [open, setOpen] = useState(false)
  const [headerOculto, setHeaderOculto] = useState(false)
  const scrollPrevRef = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const modoMapaMovil = pathname === "/mapa" && esViewportMovil
  const [loadingLogout, setLoadingLogout] = useState(false)
  const [isResident, setIsResident] = useState(false)
  const router = useRouter()
  const residentEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()

  useEffect(() => {
    const supabase = createClient()

    async function refreshResidentStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const matchesResident = Boolean(user?.email && (!residentEmail || user.email.toLowerCase() === residentEmail))
      setIsResident(matchesResident)
    }

    void refreshResidentStatus()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshResidentStatus()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [residentEmail])

  useEffect(() => {
    const activo = pathname === "/mapa" && esViewportMovil
    if (!activo) {
      setHeaderOculto(false)
      scrollPrevRef.current = 0
      return
    }

    function scrollActual() {
      const main = document.querySelector("main")
      if (main && main.scrollHeight > main.clientHeight + 1) {
        return main.scrollTop
      }
      return window.scrollY
    }

    function onScroll() {
      const y = scrollActual()
      if (y <= UMBRAL_SCROLL_MAPA_PX) {
        setHeaderOculto(false)
      } else if (y > scrollPrevRef.current + UMBRAL_SCROLL_MAPA_PX) {
        setHeaderOculto(true)
      } else if (y < scrollPrevRef.current - UMBRAL_SCROLL_MAPA_PX) {
        setHeaderOculto(false)
      }
      scrollPrevRef.current = y
    }

    const main = document.querySelector("main")
    main?.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      main?.removeEventListener("scroll", onScroll)
      window.removeEventListener("scroll", onScroll)
    }
  }, [pathname, esViewportMovil])

  useEffect(() => {
    const main = document.querySelector("main")
    if (!main) return

    if (!modoMapaMovil) {
      main.style.paddingTop = ""
      main.removeAttribute("data-mapa-header")
      return
    }

    const altura = headerRef.current?.offsetHeight ?? 0
    main.setAttribute("data-mapa-header", headerOculto ? "hidden" : "visible")
    main.style.paddingTop = headerOculto ? "0px" : `${altura}px`

    return () => {
      main.style.paddingTop = ""
      main.removeAttribute("data-mapa-header")
    }
  }, [modoMapaMovil, headerOculto])

  useEffect(() => {
    if (!modoMapaMovil || headerOculto) return
    const main = document.querySelector("main")
    const header = headerRef.current
    if (!main || !header) return

    const observer = new ResizeObserver(() => {
      main.style.paddingTop = `${header.offsetHeight}px`
    })
    observer.observe(header)
    return () => observer.disconnect()
  }, [modoMapaMovil, headerOculto])

  const ocultarEnMapaMovil = modoMapaMovil && headerOculto

  async function handleLogout() {
    setLoadingLogout(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.replace("/")
      router.refresh()
    } finally {
      setLoadingLogout(false)
    }
  }

  return (
    <header
      ref={headerRef}
      className={cn(
        "z-30 border-b border-border/80 bg-card/95 shadow-sm ring-1 ring-foreground/5 backdrop-blur-md supports-backdrop-filter:bg-card/80",
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        modoMapaMovil ? "fixed top-0 left-0 right-0 md:left-64" : "sticky top-0",
        ocultarEnMapaMovil && "-translate-y-full"
      )}
    >
      <div className="mx-auto flex min-h-12 w-full min-w-0 max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className={cn(
            "h-9 w-9 shrink-0 border-foreground/15 bg-background/80 text-foreground md:hidden",
            "touch-manipulation"
          )}
          aria-expanded={open}
          aria-controls="nav-mobile"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="size-[18px]" strokeWidth={2} />
        </Button>
        <Sheet
          open={open}
          onOpenChange={setOpen}
        >
          <SheetContent
            id="nav-mobile"
            side="left"
            showCloseButton
            className={cn(
              "flex w-[min(20rem,88vw)] max-w-[min(20rem,88vw)] flex-col border-slate-800! bg-slate-950! p-0! text-slate-100! shadow-2xl md:hidden",
              "[&>button]:right-2.5 [&>button]:top-2.5 [&>button]:text-slate-300 [&>button]:hover:bg-slate-800"
            )}
          >
            <SheetTitle className="sr-only">Navegación del sistema</SheetTitle>
            <SheetDescription className="sr-only">
              Secciones y módulos del control de obra
            </SheetDescription>
            <NavigationPanel isDrawer onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground">
            <span className="flex flex-col gap-0.5 md:hidden">
              <span className="line-clamp-2 text-sm font-semibold leading-snug">JBS Consorcio</span>
              <span className="line-clamp-2 text-xs font-normal leading-snug text-muted-foreground">
                {proyectoActivo.nombreObra}
              </span>
            </span>
            <span className="hidden flex-col gap-0.5 md:flex">
              <span className="line-clamp-1 text-sm font-semibold leading-snug sm:text-base">
                JBS Consorcio
              </span>
              <span className="line-clamp-1 text-xs font-normal leading-snug text-muted-foreground">
                {proyectoActivo.nombreObra}
              </span>
            </span>
          </h1>
        </div>
        <ProyectoSelect className="min-w-0 max-w-[9rem] xs:max-w-[11rem] sm:max-w-xs" compact />
        {isResident ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={loadingLogout}
            className="h-9 shrink-0"
          >
            {loadingLogout ? "Saliendo..." : "Cerrar sesión"}
          </Button>
        ) : null}
      </div>
    </header>
  )
}
