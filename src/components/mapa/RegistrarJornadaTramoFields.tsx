"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  EQUIPO_OTRO_VALUE,
  type RegistrarJornadaFormState,
} from "@/src/components/mapa/registrar-jornada-tramo-utils"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"
import {
  cargarEquiposMaquinariaProyecto,
  type ProyectoEquipoMaquinaria,
} from "@/src/lib/proyecto-equipos-maquinaria"
import { createClient } from "@/src/lib/supabase/client"

type RegistrarJornadaTramoFieldsProps = {
  proyectoId: string
  idPrefix: string
  values: RegistrarJornadaFormState
  onChange: (patch: Partial<RegistrarJornadaFormState>) => void
  disabled?: boolean
  /** z-index del Select Radix (p. ej. 90 dentro del modal confirmar punto). */
  selectContentZIndexClass?: string
  required?: boolean
}

export function RegistrarJornadaTramoFields({
  proyectoId,
  idPrefix,
  values,
  onChange,
  disabled = false,
  selectContentZIndexClass = "z-[100]",
  required = true,
}: RegistrarJornadaTramoFieldsProps) {
  const supabase = useMemo(() => createClient(), [])
  const esViewportMovil = useEsViewportMovil()
  const usarSelectNativoEquipo = esViewportMovil

  const [equiposCatalogo, setEquiposCatalogo] = useState<ProyectoEquipoMaquinaria[]>([])
  const [cargandoEquipos, setCargandoEquipos] = useState(false)

  useEffect(() => {
    if (!proyectoId) return
    let cancelado = false
    setCargandoEquipos(true)
    void cargarEquiposMaquinariaProyecto(supabase, proyectoId, { soloActivos: true })
      .then((data) => {
        if (!cancelado) setEquiposCatalogo(data)
      })
      .catch(() => {
        if (!cancelado) setEquiposCatalogo([])
      })
      .finally(() => {
        if (!cancelado) setCargandoEquipos(false)
      })
    return () => {
      cancelado = true
    }
  }, [proyectoId, supabase])

  const mostrarEquipoOtro = values.equipoSeleccionId === EQUIPO_OTRO_VALUE
  const camposDeshabilitados = disabled || cargandoEquipos

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-fecha`}>Fecha</Label>
          <Input
            id={`${idPrefix}-fecha`}
            type="date"
            required={required}
            disabled={camposDeshabilitados}
            value={values.fecha}
            onChange={(e) => onChange({ fecha: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-metros`}>Metros desasolados</Label>
          <Input
            id={`${idPrefix}-metros`}
            type="number"
            min={0}
            step={0.1}
            required={required}
            disabled={camposDeshabilitados}
            placeholder="Ej. 120"
            value={values.metros}
            onChange={(e) => onChange({ metros: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-equipo`}>Equipo / maquinaria</Label>
        {usarSelectNativoEquipo ? (
          <select
            id={`${idPrefix}-equipo`}
            required={required}
            disabled={camposDeshabilitados}
            value={values.equipoSeleccionId}
            onChange={(event) => {
              const value = event.target.value
              onChange({
                equipoSeleccionId: value,
                equipoOtroTexto: value === EQUIPO_OTRO_VALUE ? values.equipoOtroTexto : "",
              })
            }}
            className={cn(
              "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
            )}
          >
            <option value="" disabled={values.equipoSeleccionId !== ""}>
              {cargandoEquipos ? "Cargando equipos…" : "Seleccione un equipo"}
            </option>
            {equiposCatalogo.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
            <option value={EQUIPO_OTRO_VALUE}>Otro…</option>
          </select>
        ) : (
          <Select
            value={values.equipoSeleccionId || undefined}
            onValueChange={(value) => {
              onChange({
                equipoSeleccionId: value,
                equipoOtroTexto: value === EQUIPO_OTRO_VALUE ? values.equipoOtroTexto : "",
              })
            }}
            disabled={camposDeshabilitados}
          >
            <SelectTrigger id={`${idPrefix}-equipo`} className="h-10 w-full">
              <SelectValue
                placeholder={cargandoEquipos ? "Cargando equipos…" : "Seleccione un equipo"}
              />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              className={cn(
                selectContentZIndexClass,
                "max-h-[min(16rem,50dvh)] w-(--radix-select-trigger-width)"
              )}
            >
              {equiposCatalogo.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.nombre}
                </SelectItem>
              ))}
              <SelectItem value={EQUIPO_OTRO_VALUE}>Otro…</SelectItem>
            </SelectContent>
          </Select>
        )}
        {equiposCatalogo.length === 0 && !cargandoEquipos ? (
          <p className="text-xs text-muted-foreground">
            No hay equipos en el catálogo.{" "}
            <Link href="/maquinaria" className="font-medium text-primary underline-offset-4 hover:underline">
              Regístrelos en Maquinaria
            </Link>
            .
          </p>
        ) : null}
        {mostrarEquipoOtro ? (
          <Input
            id={`${idPrefix}-equipo-otro`}
            required={required}
            disabled={camposDeshabilitados}
            placeholder="Nombre del equipo"
            value={values.equipoOtroTexto}
            onChange={(e) => onChange({ equipoOtroTexto: e.target.value })}
            className="mt-2"
            aria-label="Otro equipo"
          />
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-horas`}>Horas de trabajo (opcional)</Label>
        <Input
          id={`${idPrefix}-horas`}
          type="number"
          min={0}
          step={0.5}
          disabled={camposDeshabilitados}
          value={values.horas}
          onChange={(e) => onChange({ horas: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-obs`}>Observaciones (opcional)</Label>
        <Textarea
          id={`${idPrefix}-obs`}
          rows={2}
          disabled={camposDeshabilitados}
          value={values.observaciones}
          onChange={(e) => onChange({ observaciones: e.target.value })}
        />
      </div>
    </div>
  )
}
