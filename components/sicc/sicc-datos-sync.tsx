"use client"

import { Cloud, CloudOff, Database, Loader2, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSiccData } from "@/components/sicc/sicc-data-provider"
import { cn } from "@/lib/utils"

export function SiccDatosSync() {
  const {
    metrados,
    libroObra,
    listo,
    fuenteDatos,
    sincronizando,
    errorSync,
    reiniciarDatos,
  } = useSiccData()

  const enNube = fuenteDatos === "supabase"

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        {sincronizando ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin" />
        ) : enNube ? (
          <Cloud className="size-3.5 shrink-0 text-sky-600" />
        ) : (
          <Database className="size-3.5 shrink-0" />
        )}
        <span className="font-medium text-foreground">
          {!listo
            ? "Cargando datos…"
            : sincronizando
              ? "Sincronizando…"
              : enNube
                ? "Nube — tiempo real"
                : "Local — este navegador"}
        </span>
      </div>
      <p className="mt-1 pl-5 leading-relaxed">
        {metrados.length} metrados · {libroObra.length} partes compartidos
        {enNube ? " entre residente, visitante y oficina." : " en localStorage."}
      </p>
      {errorSync ? (
        <p className={cn("mt-1 pl-5 text-amber-700 dark:text-amber-300")}>{errorSync}</p>
      ) : null}
      {!enNube && listo ? (
        <p className="mt-1 flex items-start gap-1.5 pl-5 leading-relaxed">
          <CloudOff className="mt-0.5 size-3 shrink-0" />
          Configure Supabase en Vercel para sincronización multiusuario.
        </p>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 h-7 w-full justify-start px-2 text-xs text-muted-foreground"
        disabled={sincronizando}
        onClick={() => void reiniciarDatos()}
      >
        <RotateCcw className="size-3" />
        Restaurar datos demo
      </Button>
    </div>
  )
}
