"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ESTADOS_TRAMO,
  colorEstadoTramo,
  type EstadoTramo,
} from "@/src/data/tramos/types"
import {
  etiquetaLetra,
  puntoEnEjecucionOperativo,
  puntosOrdenadosTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"

type TramoPuntosOperativosBlockProps = {
  tramoId: string
  puntos: TramoPuntoAvance[]
  guardandoPuntoId?: string | null
  onEstadoPuntoChange?: (
    puntoId: string,
    estado: EstadoTramo | null
  ) => void | Promise<void>
}

export function TramoPuntosOperativosBlock({
  tramoId,
  puntos,
  guardandoPuntoId = null,
  onEstadoPuntoChange,
}: TramoPuntosOperativosBlockProps) {
  const ordenados = puntosOrdenadosTramo(puntos, tramoId)
  if (ordenados.length === 0 || !onEstadoPuntoChange) return null

  return (
    <div className="space-y-3 rounded-lg border border-foreground/10 bg-muted/10 p-4">
      <div>
        <h4 className="text-sm font-medium">Estado operativo por punto</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Cualquier punto (A, B, C…) puede quedar en ejecución sin enlazar otro. Solo un punto por
          tramo parpadea como frente de trabajo activo.
        </p>
      </div>
      <ul className="space-y-2">
        {ordenados.map((punto) => {
          const letra = punto.rol ? etiquetaLetra(punto.rol) : "?"
          const enEjecucion = puntoEnEjecucionOperativo(punto)
          const guardando = guardandoPuntoId === punto.id
          const selectValue = punto.estado_minitramo ?? "sin_asignar"

          return (
            <li
              key={punto.id}
              className="flex flex-col gap-2 rounded-md border border-foreground/10 bg-background p-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white${enEjecucion ? " mapa-punto-en-ejecucion" : ""}`}
                  style={{
                    backgroundColor: enEjecucion
                      ? colorEstadoTramo("en_ejecucion")
                      : "#64748b",
                  }}
                >
                  {letra}
                </span>
                <span className="text-sm font-medium">Punto {letra}</span>
                {enEjecucion ? (
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    En ejecución
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  size="sm"
                  variant={enEjecucion ? "default" : "outline"}
                  className="h-9 text-xs"
                  disabled={guardando || enEjecucion}
                  onClick={() => void onEstadoPuntoChange(punto.id, "en_ejecucion")}
                >
                  {guardando ? "Guardando…" : "En ejecución"}
                </Button>
                <div className="min-w-[10rem] space-y-1">
                  <Label htmlFor={`estado-punto-${punto.id}`} className="sr-only">
                    Estado punto {letra}
                  </Label>
                  <Select
                    value={selectValue}
                    disabled={guardando}
                    onValueChange={(value) => {
                      if (value === "sin_asignar") {
                        void onEstadoPuntoChange(punto.id, null)
                        return
                      }
                      void onEstadoPuntoChange(punto.id, value as EstadoTramo)
                    }}
                  >
                    <SelectTrigger id={`estado-punto-${punto.id}`} className="h-9 w-full text-xs">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin_asignar">Sin estado operativo</SelectItem>
                      {ESTADOS_TRAMO.map((estado) => (
                        <SelectItem key={estado.id} value={estado.id}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        Estado actual sin asignar:{" "}
        {ordenados
          .filter((p) => !p.estado_minitramo)
          .map((p) => (p.rol ? etiquetaLetra(p.rol) : "?"))
          .join(", ") || "ninguno"}
        . Los segmentos A–B usan el estado del punto final al cerrar el minitramo.
      </p>
    </div>
  )
}
