"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ESTADOS_TRAMO, type EstadoTramo } from "@/src/data/tramos/types"
import { Label } from "@/components/ui/label"

export type FiltrosTramos = {
  estado: EstadoTramo | "todos"
  canal: string | "todos"
  semanaProgramada: string | "todos"
}

type MapaTramosFiltrosProps = {
  filtros: FiltrosTramos
  canales: string[]
  semanas: string[]
  onChange: (filtros: FiltrosTramos) => void
}

const INPUT_CLASS = "h-10 w-full min-w-0"

export function MapaTramosFiltros({
  filtros,
  canales,
  semanas,
  onChange,
}: MapaTramosFiltrosProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="filtro-estado">Estado</Label>
        <Select
          value={filtros.estado}
          onValueChange={(value) =>
            onChange({ ...filtros, estado: value as EstadoTramo | "todos" })
          }
        >
          <SelectTrigger id="filtro-estado" className={INPUT_CLASS}>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {ESTADOS_TRAMO.map((estado) => (
              <SelectItem key={estado.id} value={estado.id}>
                {estado.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filtro-canal">Canal</Label>
        <Select
          value={filtros.canal}
          onValueChange={(value) => onChange({ ...filtros, canal: value })}
        >
          <SelectTrigger id="filtro-canal" className={INPUT_CLASS}>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los canales</SelectItem>
            {canales.map((canal) => (
              <SelectItem key={canal} value={canal}>
                {canal}
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
