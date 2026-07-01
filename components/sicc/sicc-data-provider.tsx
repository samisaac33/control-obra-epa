"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { calcularResumenPresupuesto, calcularCurvaS } from "@/lib/sicc/presupuesto-sicc"
import { obtenerPeriodosDesdeMetrados } from "@/lib/sicc/certificaciones"
import {
  asegurarDatosIniciales,
  cargarDatosObra,
  insertarLibroObra,
  insertarMetrado,
  reiniciarDatosObra,
  suscribirCambiosObra,
} from "@/lib/sicc/supabase-repo"
import {
  cargarDatosSicc,
  guardarDatosSicc,
  reiniciarDatosSicc,
} from "@/lib/sicc/sicc-storage"
import {
  obtenerClienteSupabase,
  supabaseConfigurado,
  type FuenteDatosSicc,
} from "@/lib/supabase/client"
import type {
  EntradaLibroObra,
  EntradaMetrado,
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
  listo: boolean
  fuenteDatos: FuenteDatosSicc
  sincronizando: boolean
  errorSync: string | null
  agregarMetrado: (entrada: Omit<EntradaMetrado, "id">) => Promise<void>
  agregarLibroObra: (entrada: Omit<EntradaLibroObra, "id">) => Promise<void>
  reiniciarDatos: () => Promise<void>
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
  const obraId = OBRA_DEMO.id
  const usaSupabase = supabaseConfigurado()

  const [metrados, setMetrados] = useState<EntradaMetrado[]>(ENTRADAS_METRADO_DEMO)
  const [libroObra, setLibroObra] = useState<EntradaLibroObra[]>(ENTRADAS_LIBRO_DEMO)
  const [listo, setListo] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [errorSync, setErrorSync] = useState<string | null>(null)

  const recargando = useRef(false)

  const aplicarDatos = useCallback(
    (datos: { metrados: EntradaMetrado[]; libroObra: EntradaLibroObra[] }) => {
      setMetrados(datos.metrados)
      setLibroObra(datos.libroObra)
    },
    []
  )

  const recargarDesdeSupabase = useCallback(async () => {
    const supabase = obtenerClienteSupabase()
    if (!supabase || recargando.current) return

    recargando.current = true
    try {
      const datos = await cargarDatosObra(supabase, obraId)
      aplicarDatos(datos)
      setErrorSync(null)
    } catch (err) {
      setErrorSync(err instanceof Error ? err.message : "Error al sincronizar con Supabase")
    } finally {
      recargando.current = false
    }
  }, [aplicarDatos, obraId])

  useEffect(() => {
    let cancelado = false

    async function iniciar() {
      if (usaSupabase) {
        const supabase = obtenerClienteSupabase()
        if (!supabase) {
          setListo(true)
          return
        }

        setSincronizando(true)
        try {
          const datos = await asegurarDatosIniciales(supabase, obraId)
          if (!cancelado) {
            aplicarDatos(datos)
            setErrorSync(null)
          }
        } catch (err) {
          if (!cancelado) {
            setErrorSync(
              err instanceof Error ? err.message : "No se pudo conectar con Supabase"
            )
            const guardado = cargarDatosSicc()
            if (guardado) aplicarDatos(guardado)
          }
        } finally {
          if (!cancelado) {
            setSincronizando(false)
            setListo(true)
          }
        }
        return
      }

      const guardado = cargarDatosSicc()
      if (guardado && !cancelado) aplicarDatos(guardado)
      if (!cancelado) setListo(true)
    }

    void iniciar()
    return () => {
      cancelado = true
    }
  }, [usaSupabase, aplicarDatos, obraId])

  useEffect(() => {
    if (!usaSupabase || !listo) return

    const supabase = obtenerClienteSupabase()
    if (!supabase) return

    const desuscribir = suscribirCambiosObra(supabase, obraId, () => {
      void recargarDesdeSupabase()
    })

    return desuscribir
  }, [usaSupabase, listo, obraId, recargarDesdeSupabase])

  useEffect(() => {
    if (!listo || usaSupabase) return
    guardarDatosSicc({ metrados, libroObra })
  }, [metrados, libroObra, listo, usaSupabase])

  const agregarMetrado = useCallback(
    async (entrada: Omit<EntradaMetrado, "id">) => {
      const nuevo: EntradaMetrado = { ...entrada, id: crearId("met") }

      if (usaSupabase) {
        const supabase = obtenerClienteSupabase()
        if (!supabase) return
        setSincronizando(true)
        try {
          await insertarMetrado(supabase, obraId, nuevo)
          await recargarDesdeSupabase()
        } catch (err) {
          setErrorSync(err instanceof Error ? err.message : "Error al guardar metrado")
          throw err
        } finally {
          setSincronizando(false)
        }
        return
      }

      setMetrados((prev) => [...prev, nuevo])
    },
    [usaSupabase, obraId, recargarDesdeSupabase]
  )

  const agregarLibroObra = useCallback(
    async (entrada: Omit<EntradaLibroObra, "id">) => {
      const nuevo: EntradaLibroObra = { ...entrada, id: crearId("lo") }

      if (usaSupabase) {
        const supabase = obtenerClienteSupabase()
        if (!supabase) return
        setSincronizando(true)
        try {
          await insertarLibroObra(supabase, obraId, nuevo)
          await recargarDesdeSupabase()
        } catch (err) {
          setErrorSync(err instanceof Error ? err.message : "Error al guardar parte de obra")
          throw err
        } finally {
          setSincronizando(false)
        }
        return
      }

      setLibroObra((prev) => [...prev, nuevo])
    },
    [usaSupabase, obraId, recargarDesdeSupabase]
  )

  const reiniciarDatos = useCallback(async () => {
    if (usaSupabase) {
      const supabase = obtenerClienteSupabase()
      if (!supabase) return
      setSincronizando(true)
      try {
        const datos = await reiniciarDatosObra(supabase, obraId)
        aplicarDatos(datos)
        setErrorSync(null)
      } catch (err) {
        setErrorSync(err instanceof Error ? err.message : "Error al reiniciar datos")
        throw err
      } finally {
        setSincronizando(false)
      }
      return
    }

    reiniciarDatosSicc()
    setMetrados(ENTRADAS_METRADO_DEMO)
    setLibroObra(ENTRADAS_LIBRO_DEMO)
  }, [usaSupabase, obraId, aplicarDatos])

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

  const fuenteDatos: FuenteDatosSicc = usaSupabase ? "supabase" : "local"

  const value = useMemo<SiccDataContextValue>(
    () => ({
      obra: OBRA_DEMO,
      metrados,
      libroObra,
      listo,
      fuenteDatos,
      sincronizando,
      errorSync,
      agregarMetrado,
      agregarLibroObra,
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
      listo,
      fuenteDatos,
      sincronizando,
      errorSync,
      agregarMetrado,
      agregarLibroObra,
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
