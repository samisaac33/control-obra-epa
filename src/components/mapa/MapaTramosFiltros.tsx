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
  /** Por defecto muestra estado, tramo y semana. */
  campos?: Array<"estado" | "tramo" | "semana">
}

const INPUT_CLASS = "h-10 w-full min-w-0"

const SELECT_SHEET_CLASS = "z-[90] max-h-[min(16rem,50dvh)] w-(--radix-select-trigger-width)"

type FiltroTramoProps = {
  filtros: FiltrosTramos
  tramos: Pick<CanalTramo, "id" | "codigo">[]
  onChange: (filtros: FiltrosTramos) => void
  selectId?: string
}

/** Selector de tramo (visitante: visible encima del mapa). */
export function MapaTramosFiltroTramo({
  filtros,
  tramos,
  onChange,
  selectId = "filtro-tramo",
}: FiltroTramoProps) {
  const tramosOrdenados = useMemo(() => tramosOrdenadosPorCodigo(tramos), [tramos])

  return (
    <div className="space-y-1.5">
      <Label htmlFor={selectId}>Tramos</Label>
      <Select
        value={filtros.tramoId}
        onValueChange={(value) => onChange({ ...filtros, tramoId: value })}
      >
        <SelectTrigger id={selectId} className={INPUT_CLASS}>
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" className={SELECT_SHEET_CLASS}>
          <SelectItem value="todos">Todos los tramos</SelectItem>
          {tramosOrdenados.map((tramo) => (
            <SelectItem key={tramo.id} value={tramo.id}>
              {tramo.codigo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function MapaTramosFiltros({
  filtros,
  tramos,
  semanas,
  onChange,
  campos = ["estado", "tramo", "semana"],
}: MapaTramosFiltrosProps) {
  const tramosOrdenados = useMemo(() => tramosOrdenadosPorCodigo(tramos), [tramos])
  const mostrarEstado = campos.includes("estado")
  const mostrarTramo = campos.includes("tramo")
  const mostrarSemana = campos.includes("semana")
  const columnas = [mostrarEstado, mostrarTramo, mostrarSemana].filter(Boolean).length

  return (
    <div
      className={
        columnas >= 3
          ? "grid gap-3 sm:grid-cols-3"
          : columnas === 2
            ? "grid gap-3 sm:grid-cols-2"
            : "grid gap-3"
      }
    >
      {mostrarEstado ? (
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
      ) : null}

      {mostrarTramo ? (
      <div className="space-y-1.5">
        <Label htmlFor="filtro-tramo">Tramos</Label>
        <Select
          value={filtros.tramoId}
          onValueChange={(value) => onChange({ ...filtros, tramoId: value })}
        >
          <SelectTrigger id="filtro-tramo" className={INPUT_CLASS}>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className={SELECT_SHEET_CLASS}>
            <SelectItem value="todos">Todos los tramos</SelectItem>
            {tramosOrdenados.map((tramo) => (
              <SelectItem key={tramo.id} value={tramo.id}>
                {tramo.codigo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      ) : null}

      {mostrarSemana ? (
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
      ) : null}
    </div>
  )
}
