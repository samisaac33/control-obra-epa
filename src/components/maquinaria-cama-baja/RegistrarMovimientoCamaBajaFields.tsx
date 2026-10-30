"use client"

import { useMemo } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EQUIPO_OTRO_VALUE } from "@/src/components/mapa/registrar-jornada-tramo-utils"
import type { RegistrarCamaBajaFormState } from "@/src/components/maquinaria-cama-baja/registrar-cama-baja-utils"
import { useEquiposMaquinariaProyecto } from "@/src/hooks/use-equipos-maquinaria-proyecto"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"

type RegistrarMovimientoCamaBajaFieldsProps = {
  idPrefix: string
  values: RegistrarCamaBajaFormState
  onChange: (patch: Partial<RegistrarCamaBajaFormState>) => void
  disabled?: boolean
}

export function RegistrarMovimientoCamaBajaFields({
  idPrefix,
  values,
  onChange,
  disabled = false,
}: RegistrarMovimientoCamaBajaFieldsProps) {
  const { equipos, loading } = useEquiposMaquinariaProyecto()
  const esViewportMovil = useEsViewportMovil()
  const equiposActivos = useMemo(() => equipos.filter((e) => e.activo), [equipos])
  const camposDeshabilitados = disabled || loading

  const selectEquipo = esViewportMovil ? (
    <select
      id={`${idPrefix}-maquina`}
      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
      value={values.maquinaSeleccionId}
      disabled={camposDeshabilitados}
      onChange={(e) => onChange({ maquinaSeleccionId: e.target.value })}
    >
      <option value="">Seleccione máquina…</option>
      {equiposActivos.map((eq) => (
        <option key={eq.id} value={eq.id}>
          {eq.nombre}
        </option>
      ))}
      <option value={EQUIPO_OTRO_VALUE}>Otra máquina (texto libre)</option>
    </select>
  ) : (
    <select
      id={`${idPrefix}-maquina`}
      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
      value={values.maquinaSeleccionId}
      disabled={camposDeshabilitados}
      onChange={(e) => onChange({ maquinaSeleccionId: e.target.value })}
    >
      <option value="">Seleccione máquina…</option>
      {equiposActivos.map((eq) => (
        <option key={eq.id} value={eq.id}>
          {eq.nombre}
        </option>
      ))}
      <option value={EQUIPO_OTRO_VALUE}>Otra máquina (texto libre)</option>
    </select>
  )

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-fecha`}>Fecha</Label>
          <Input
            id={`${idPrefix}-fecha`}
            type="date"
            value={values.fecha}
            disabled={camposDeshabilitados}
            onChange={(e) => onChange({ fecha: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-cama-baja`}>Cama baja (nombre o placa)</Label>
          <Input
            id={`${idPrefix}-cama-baja`}
            value={values.cama_baja}
            placeholder="Ej. Plataforma ABC-1234"
            disabled={camposDeshabilitados}
            onChange={(e) => onChange({ cama_baja: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-maquina`}>Máquina transportada</Label>
        {selectEquipo}
      </div>

      {values.maquinaSeleccionId === EQUIPO_OTRO_VALUE ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-maquina-otro`}>Nombre de la máquina</Label>
          <Input
            id={`${idPrefix}-maquina-otro`}
            value={values.maquinaOtroTexto}
            disabled={camposDeshabilitados}
            onChange={(e) => onChange({ maquinaOtroTexto: e.target.value })}
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-origen`}>Origen (opcional)</Label>
          <Input
            id={`${idPrefix}-origen`}
            value={values.origen}
            placeholder="Frente, tramo o sitio"
            disabled={camposDeshabilitados}
            onChange={(e) => onChange({ origen: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-destino`}>Destino (opcional)</Label>
          <Input
            id={`${idPrefix}-destino`}
            value={values.destino}
            placeholder="Frente, tramo o sitio"
            disabled={camposDeshabilitados}
            onChange={(e) => onChange({ destino: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5 sm:max-w-xs">
        <Label htmlFor={`${idPrefix}-horas`}>Horas del movimiento (opcional)</Label>
        <Input
          id={`${idPrefix}-horas`}
          inputMode="decimal"
          value={values.duracion_horas}
          placeholder="Ej. 4"
          disabled={camposDeshabilitados}
          onChange={(e) => onChange({ duracion_horas: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Suma al total de horas del reporte de maquinaria (cama baja / plataforma).
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-obs`}>Observaciones (opcional)</Label>
        <Textarea
          id={`${idPrefix}-obs`}
          rows={2}
          value={values.observaciones}
          disabled={camposDeshabilitados}
          onChange={(e) => onChange({ observaciones: e.target.value })}
        />
      </div>
    </div>
  )
}
