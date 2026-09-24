"use client"

import { FormEvent, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CanalTramo, EstadoTramo } from "@/src/data/tramos/types"
import { ESTADOS_TRAMO } from "@/src/data/tramos/types"
import {
  sincronizarAvanceDesdeMetros,
  sincronizarAvanceDesdePct,
} from "@/src/lib/tramos-avance"

export type TramoFormValues = {
  estado: EstadoTramo
  avance_pct: number
  metros_ejecutados: number
  fecha_inicio: string
  fecha_fin: string
  semana_programada: string
  maquinaria_asignada: string
  observaciones: string
}

type TramoEditorFormProps = {
  tramo: CanalTramo
  isResident: boolean
  loading: boolean
  onSubmit: (values: TramoFormValues) => Promise<void>
}

function valoresIniciales(tramo: CanalTramo): TramoFormValues {
  return {
    estado: tramo.estado,
    avance_pct: tramo.avance_pct,
    metros_ejecutados: tramo.metros_ejecutados,
    fecha_inicio: tramo.fecha_inicio ?? "",
    fecha_fin: tramo.fecha_fin ?? "",
    semana_programada: tramo.semana_programada ?? "",
    maquinaria_asignada: tramo.maquinaria_asignada ?? "",
    observaciones: tramo.observaciones ?? "",
  }
}

const INPUT_CLASS = "h-10 w-full"

export function TramoEditorForm({ tramo, isResident, loading, onSubmit }: TramoEditorFormProps) {
  const [values, setValues] = useState<TramoFormValues>(() => valoresIniciales(tramo))

  useEffect(() => {
    setValues(valoresIniciales(tramo))
  }, [tramo])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Código</dt>
          <dd className="font-medium">{tramo.codigo}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Canal</dt>
          <dd className="font-medium">{tramo.canal}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Longitud</dt>
          <dd className="font-medium">{(tramo.longitud_m / 1000).toFixed(2)} km</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Longitud (m)</dt>
          <dd className="font-medium">{tramo.longitud_m.toFixed(1)} m</dd>
        </div>
      </dl>

      {isResident ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="tramo-estado">Estado</Label>
            <Select
              value={values.estado}
              onValueChange={(estado) =>
                setValues((current) => ({ ...current, estado: estado as EstadoTramo }))
              }
            >
              <SelectTrigger id="tramo-estado" className={INPUT_CLASS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_TRAMO.map((estado) => (
                  <SelectItem key={estado.id} value={estado.id}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Para avance georreferenciado use el mapa arriba; la edición manual no crea historial GPS.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tramo-avance-pct">Avance (%)</Label>
              <Input
                id="tramo-avance-pct"
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={INPUT_CLASS}
                value={values.avance_pct}
                onChange={(event) => {
                  const avance_pct = Number(event.target.value)
                  setValues((current) => ({
                    ...current,
                    avance_pct,
                    metros_ejecutados: sincronizarAvanceDesdePct(tramo.longitud_m, avance_pct),
                  }))
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tramo-metros">Metros ejecutados</Label>
              <Input
                id="tramo-metros"
                type="number"
                min={0}
                max={tramo.longitud_m}
                step={0.1}
                className={INPUT_CLASS}
                value={values.metros_ejecutados}
                onChange={(event) => {
                  const metros_ejecutados = Number(event.target.value)
                  setValues((current) => ({
                    ...current,
                    metros_ejecutados,
                    avance_pct: sincronizarAvanceDesdeMetros(tramo.longitud_m, metros_ejecutados),
                  }))
                }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tramo-inicio">Fecha inicio</Label>
              <Input
                id="tramo-inicio"
                type="date"
                className={INPUT_CLASS}
                value={values.fecha_inicio}
                onChange={(event) =>
                  setValues((current) => ({ ...current, fecha_inicio: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tramo-fin">Fecha fin</Label>
              <Input
                id="tramo-fin"
                type="date"
                className={INPUT_CLASS}
                value={values.fecha_fin}
                onChange={(event) =>
                  setValues((current) => ({ ...current, fecha_fin: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tramo-semana">Semana programada (lunes)</Label>
            <Input
              id="tramo-semana"
              type="date"
              className={INPUT_CLASS}
              value={values.semana_programada}
              onChange={(event) =>
                setValues((current) => ({ ...current, semana_programada: event.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tramo-maquinaria">Maquinaria asignada</Label>
            <Input
              id="tramo-maquinaria"
              className={INPUT_CLASS}
              value={values.maquinaria_asignada}
              onChange={(event) =>
                setValues((current) => ({ ...current, maquinaria_asignada: event.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tramo-obs">Observaciones</Label>
            <Textarea
              id="tramo-obs"
              rows={3}
              value={values.observaciones}
              onChange={(event) =>
                setValues((current) => ({ ...current, observaciones: event.target.value }))
              }
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </>
      ) : (
        <div className="space-y-2 rounded-lg border border-foreground/10 bg-muted/20 p-3 text-sm">
          <p>
            <span className="text-muted-foreground">Estado:</span>{" "}
            {ESTADOS_TRAMO.find((e) => e.id === tramo.estado)?.label}
          </p>
          <p>
            <span className="text-muted-foreground">Avance:</span> {tramo.avance_pct}% (
            {tramo.metros_ejecutados.toFixed(1)} m)
          </p>
          {tramo.maquinaria_asignada ? (
            <p>
              <span className="text-muted-foreground">Maquinaria:</span> {tramo.maquinaria_asignada}
            </p>
          ) : null}
          {tramo.observaciones ? (
            <p>
              <span className="text-muted-foreground">Observaciones:</span> {tramo.observaciones}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Inicie sesión como residente para editar este tramo.
          </p>
        </div>
      )}
    </form>
  )
}
