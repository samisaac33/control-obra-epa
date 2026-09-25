"use client"

import { useMemo } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ESTADOS_OPERATIVOS_MAPA,
  type CanalTramo,
  type EstadoOperativoMapa,
} from "@/src/data/tramos/types"
import { tramosOrdenadosPorCodigo } from "@/src/lib/tramos-avance"
import { Label } from "@/components/ui/label"

export type FiltrosTramos = {
  estado: EstadoOperativoMapa | "todos"
  tramoId: string | "todos"
  semanaProgramada: string | "todos"
}

type MapaTramosFiltrosProps = {
  filtros: FiltrosTramos
  tramos: Pick<CanalTramo, "id" | "codigo">[]
  semanas: string[]
  onChange: (filtros: FiltrosTramos) => void
}

const INPUT_CLASS = "h-10 w-full min-w-0"

export function MapaTramosFiltros({
  filtros,
  tramos,
  semanas,
  onChange,
}: MapaTramosFiltrosProps) {
  const tramosOrdenados = useMemo(() => tramosOrdenadosPorCodigo(tramos), [tramos])

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="filtro-estado">Estado</Label>
        <Select
          value={filtros.estado}
          onValueChange={(value) =>
            onChange({ ...filtros, estado: value as EstadoOperativoMapa | "todos" })
          }
        >
          <SelectTrigger id="filtro-estado" className={INPUT_CLASS}>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {ESTADOS_OPERATIVOS_MAPA.map((estado) => (
              <SelectItem key={estado.id} value={estado.id}>
                {estado.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          Avance operativo del tramo (GPS y minitramos).
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filtro-tramo">Tramos</Label>
        <Select
          value={filtros.tramoId}
          onValueChange={(value) => onChange({ ...filtros, tramoId: value })}
        >
          <SelectTrigger id="filtro-tramo" className={INPUT_CLASS}>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tramos</SelectItem>
            {tramosOrdenados.map((tramo) => (
              <SelectItem key={tramo.id} value={tramo.id}>
                {tramo.codigo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filtro-semana">Semana programada</Label>
        <Select
          value={filtros.semanaProgramada}
          onValueChange={(value) => onChange({ ...filtros, semanaProgramada: value })}
        >
          <SelectTrigger id="filtro-semana" className={INPUT_CLASS}>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las semanas</SelectItem>
            {semanas.map((semana) => (
              <SelectItem key={semana} value={semana}>
                {semana}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
