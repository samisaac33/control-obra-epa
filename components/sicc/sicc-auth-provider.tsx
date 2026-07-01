"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { Session, User } from "@supabase/supabase-js"

import {
  cargarPerfil,
  cerrarSesion,
  iniciarSesion,
  puedeEditarCampo,
  puedeAdministrar,
  puedeReiniciarDemo,
  registrarUsuario,
} from "@/lib/supabase/auth"
import {
  obtenerClienteSupabase,
  reiniciarClienteSupabase,
  supabaseConfigurado,
} from "@/lib/supabase/client"
import type { PerfilSicc, RolSicc } from "@/lib/sicc/types"

const PERFIL_LOCAL: PerfilSicc = {
  id: "local-demo",
  obraId: "obra-severino-2026",
  rol: "residente",
  nombre: "Usuario local (demo)",
  email: "local@sicc.demo",
}

interface SiccAuthContextValue {
  requiereAuth: boolean
  listo: boolean
  session: Session | null
  user: User | null
  perfil: PerfilSicc | null
  puedeEditar: boolean
  puedeReiniciar: boolean
  puedeAdministrar: boolean
  errorAuth: string | null
  login: (email: string, password: string) => Promise<void>
  register: (datos: {
    email: string
    password: string
    nombre: string
    rol: RolSicc
  }) => Promise<void>
  logout: () => Promise<void>
}

const SiccAuthContext = createContext<SiccAuthContextValue | null>(null)

export function SiccAuthProvider({ children }: { children: React.ReactNode }) {
  const requiereAuth = supabaseConfigurado()
  const [listo, setListo] = useState(!requiereAuth)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<PerfilSicc | null>(requiereAuth ? null : PERFIL_LOCAL)
  const [errorAuth, setErrorAuth] = useState<string | null>(null)

  const cargarSesion = useCallback(async () => {
    if (!requiereAuth) {
      setListo(true)
      return
    }

    const supabase = obtenerClienteSupabase()
    if (!supabase) {
      setListo(true)
      return
    }

    const { data } = await supabase.auth.getSession()
    setSession(data.session)

    if (data.session?.user) {
      try {
        const p = await cargarPerfil(supabase, data.session.user.id)
        setPerfil(p)
        setErrorAuth(p ? null : "Perfil no encontrado. Contacte al administrador.")
      } catch (err) {
        setErrorAuth(err instanceof Error ? err.message : "Error al cargar perfil")
      }
    } else {
      setPerfil(null)
    }

    setListo(true)
  }, [requiereAuth])

  useEffect(() => {
    void cargarSesion()

    if (!requiereAuth) return

    const supabase = obtenerClienteSupabase()
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nuevaSession) => {
      setSession(nuevaSession)
      if (nuevaSession?.user) {
        void cargarPerfil(supabase, nuevaSession.user.id)
          .then(setPerfil)
          .catch(() => setPerfil(null))
      } else {
        setPerfil(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [requiereAuth, cargarSesion])

  const login = useCallback(async (email: string, password: string) => {
    const supabase = obtenerClienteSupabase()
    if (!supabase) return

    setErrorAuth(null)
    const { perfil: p } = await iniciarSesion(supabase, email, password)
    if (!p) {
      throw new Error("Perfil no encontrado para esta cuenta")
    }
    setPerfil(p)
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
  }, [])

  const register = useCallback(
    async (datos: {
      email: string
      password: string
      nombre: string
      rol: RolSicc
    }) => {
      const supabase = obtenerClienteSupabase()
      if (!supabase) return

      setErrorAuth(null)
      const { perfil: p } = await registrarUsuario(supabase, datos)
      setPerfil(p)
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    },
    []
  )

  const logout = useCallback(async () => {
    const supabase = obtenerClienteSupabase()
    if (supabase) {
      await cerrarSesion(supabase)
    }
    reiniciarClienteSupabase()
    setSession(null)
    setPerfil(null)
  }, [])

  const rol = perfil?.rol ?? null

  const value = useMemo<SiccAuthContextValue>(
    () => ({
      requiereAuth,
      listo,
      session,
      user: session?.user ?? null,
      perfil,
      puedeEditar: puedeEditarCampo(rol),
      puedeReiniciar: puedeReiniciarDemo(rol),
      puedeAdministrar: puedeAdministrar(rol),
      errorAuth,
      login,
      register,
      logout,
    }),
    [requiereAuth, listo, session, perfil, rol, errorAuth, login, register, logout]
  )

  return <SiccAuthContext.Provider value={value}>{children}</SiccAuthContext.Provider>
}

export function useSiccAuth(): SiccAuthContextValue {
  const ctx = useContext(SiccAuthContext)
  if (!ctx) {
    throw new Error("useSiccAuth debe usarse dentro de SiccAuthProvider")
  }
  return ctx
}
