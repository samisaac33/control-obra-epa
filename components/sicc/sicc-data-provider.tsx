"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { presupuestoData } from "@/data/presupuesto"
import { ENTRADAS_LIBRO_DEMO, OBRA_DEMO } from "@/lib/sicc/demo-obra"
import { ENTRADAS_METRADO_DEMO } from "@/lib/sicc/demo-metrados"
import { crearId, fechaReferenciaDesdeMetrados } from "@/lib/sicc/ids"
import {
  calcularKpisObra,
  calcularResumenRubros,
  montoTotalContrato,
} from "@/lib/sicc/computed"
import { calcularResumenPresupuesto } from "@/lib/sicc/presupuesto-sicc"
import { calcularCurvaS } from "@/lib/sicc/presupuesto-sicc"
import { obtenerPeriodosDesdeMetrados } from "@/lib/sicc/certificaciones"
import {
  estadoInicialEnsayos,
  normalizarEstadosEnsayos,
  type EstadoCumplimientoMap,
} from "@/lib/sicc/calidad-ensayos"
import {
  cargarDatosSicc,
  guardarDatosSicc,
  reiniciarDatosSicc,
} from "@/lib/sicc/sicc-storage"
import type {
  EntradaLibroObra,
  EntradaMetrado,
  EstadoCumplimientoEnsayo,
  KpiObra,
  ObraSicc,
  PuntoCurvaS,
  ResumenPresupuesto,
  ResumenRubroMetrado,
  PeriodoCertificacion,
} from "@/lib/sicc/types"

interface SiccDataContextValue {
  obra: ObraSicc
  metrados: EntradaMetrado[]
  libroObra: EntradaLibroObra[]
  estadosEnsayos: EstadoCumplimientoMap
  listo: boolean
  agregarMetrado: (entrada: Omit<EntradaMetrado, "id">) => void
  agregarLibroObra: (entrada: Omit<EntradaLibroObra, "id">) => void
  actualizarEstadoEnsayo: (requisitoId: string, estado: EstadoCumplimientoEnsayo) => void
  reiniciarDatos: () => void
  kpis: KpiObra[]
  resumenesMetrados: ResumenRubroMetrado[]
  resumenPresupuesto: ResumenPresupuesto
  curvaS: PuntoCurvaS[]
  periodosCertificacion: PeriodoCertificacion[]
  fechaReferencia: string
  montoContrato: number
}

const SiccDataContext = createContext<SiccDataContextValue | null>(null)

export function SiccDataProvider({ children }: { children: React.ReactNode }) {
  const [metrados, setMetrados] = useState<EntradaMetrado[]>(ENTRADAS_METRADO_DEMO)
  const [libroObra, setLibroObra] = useState<EntradaLibroObra[]>(ENTRADAS_LIBRO_DEMO)
  const [estadosEnsayos, setEstadosEnsayos] = useState<EstadoCumplimientoMap>(
    estadoInicialEnsayos
  )
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const guardado = cargarDatosSicc()
    if (guardado) {
      setMetrados(guardado.metrados)
      setLibroObra(guardado.libroObra)
      setEstadosEnsayos(normalizarEstadosEnsayos(guardado.estadosEnsayos))
    }
    setListo(true)
  }, [])

  useEffect(() => {
    if (!listo) return
    guardarDatosSicc({ metrados, libroObra, estadosEnsayos })
  }, [metrados, libroObra, estadosEnsayos, listo])

  const agregarMetrado = useCallback((entrada: Omit<EntradaMetrado, "id">) => {
    setMetrados((prev) => [...prev, { ...entrada, id: crearId("met") }])
  }, [])

  const agregarLibroObra = useCallback((entrada: Omit<EntradaLibroObra, "id">) => {
    setLibroObra((prev) => [...prev, { ...entrada, id: crearId("lo") }])
  }, [])

  const actualizarEstadoEnsayo = useCallback(
    (requisitoId: string, estado: EstadoCumplimientoEnsayo) => {
      setEstadosEnsayos((prev) => ({ ...prev, [requisitoId]: estado }))
    },
    []
  )

  const reiniciarDatos = useCallback(() => {
    reiniciarDatosSicc()
    setMetrados(ENTRADAS_METRADO_DEMO)
    setLibroObra(ENTRADAS_LIBRO_DEMO)
    setEstadosEnsayos(estadoInicialEnsayos())
  }, [])

  const fechaReferencia = useMemo(
    () => fechaReferenciaDesdeMetrados(metrados.map((m) => m.fecha), "2026-02-12"),
    [metrados]
  )

  const resumenesMetrados = useMemo(
    () => calcularResumenRubros(presupuestoData, metrados),
    [metrados]
  )

  const resumenPresupuesto = useMemo(
    () =>
      calcularResumenPresupuesto(
        presupuestoData,
        metrados,
        OBRA_DEMO.fechaInicio,
        OBRA_DEMO.plazoDias,
        fechaReferencia
      ),
    [metrados, fechaReferencia]
  )

  const curvaS = useMemo(
    () =>
      calcularCurvaS(
        presupuestoData,
        metrados,
        OBRA_DEMO.fechaInicio,
        OBRA_DEMO.plazoDias
      ),
    [metrados]
  )

  const periodosCertificacion = useMemo(
    () => obtenerPeriodosDesdeMetrados(metrados, OBRA_DEMO.fechaInicio),
    [metrados]
  )

  const kpis = useMemo(
    () => calcularKpisObra(OBRA_DEMO, metrados, libroObra),
    [metrados, libroObra]
  )

  const value = useMemo<SiccDataContextValue>(
    () => ({
      obra: OBRA_DEMO,
      metrados,
      libroObra,
      estadosEnsayos,
      listo,
      agregarMetrado,
      agregarLibroObra,
      actualizarEstadoEnsayo,
      reiniciarDatos,
      kpis,
      resumenesMetrados,
      resumenPresupuesto,
      curvaS,
      periodosCertificacion,
      fechaReferencia,
      montoContrato: montoTotalContrato(presupuestoData),
    }),
    [
      metrados,
      libroObra,
      estadosEnsayos,
      listo,
      agregarMetrado,
      agregarLibroObra,
      actualizarEstadoEnsayo,
      reiniciarDatos,
      kpis,
      resumenesMetrados,
      resumenPresupuesto,
      curvaS,
      periodosCertificacion,
      fechaReferencia,
    ]
  )

  return <SiccDataContext.Provider value={value}>{children}</SiccDataContext.Provider>
}

export function useSiccData(): SiccDataContextValue {
  const ctx = useContext(SiccDataContext)
  if (!ctx) {
    throw new Error("useSiccData debe usarse dentro de SiccDataProvider")
  }
  return ctx
}
