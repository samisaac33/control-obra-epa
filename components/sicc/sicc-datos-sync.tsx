"use client"

import { Database, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSiccData } from "@/components/sicc/sicc-data-provider"

export function SiccDatosSync() {
  const { metrados, libroObra, listo, reiniciarDatos } = useSiccData()

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Database className="size-3.5 shrink-0" />
        <span className="font-medium text-foreground">
          {listo ? "Datos sincronizados" : "Cargando datos…"}
        </span>
      </div>
      <p className="mt-1 pl-5 leading-relaxed">
        {metrados.length} metrados · {libroObra.length} partes de obra compartidos entre
        módulos.
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 h-7 w-full justify-start px-2 text-xs text-muted-foreground"
        onClick={reiniciarDatos}
      >
        <RotateCcw className="size-3" />
        Restaurar datos demo
      </Button>
    </div>
  )
}
