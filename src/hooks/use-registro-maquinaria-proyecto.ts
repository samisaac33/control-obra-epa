"use client"

import { useMemo } from "react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  getPeriodoMaquinaria,
  getRegistroMaquinaria,
  type RegistroDia,
} from "@/src/data/registro-maquinaria"

export function useRegistroMaquinariaProyecto(): {
  registros: RegistroDia[]
  periodo: ReturnType<typeof getPeriodoMaquinaria>
  proyectoId: string
} {
  const { proyectoId } = useProyecto()

  return useMemo(
    () => ({
      registros: getRegistroMaquinaria(proyectoId),
      periodo: getPeriodoMaquinaria(proyectoId),
      proyectoId,
    }),
    [proyectoId]
  )
}
