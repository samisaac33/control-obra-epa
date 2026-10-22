"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { MapPin, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CAPACIDAD_VOLQUETA_M3_DEFAULT, RADIO_DESALOJO_MAX_KM } from "@/src/data/contrato-emergencia-severino-trasvase"
import type { CanalAbscisa, ProyectoBotadero, TicketDesalojo } from "@/src/data/auditoria/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { cargarCanalAbscisasProyecto } from "@/src/lib/cargar-canal-abscisas"
import { cargarProyectoBotaderos } from "@/src/lib/cargar-proyecto-botaderos"
import { crearTicketDesalojo } from "@/src/lib/cargar-tickets-desalojo"
import { distanciaGeodesicaKm } from "@/src/lib/geo-distancia"
import { createClient } from "@/src/lib/supabase/client"
import { cn } from "@/lib/utils"

const PLACAS_STORAGE_KEY = "epa-volquetas-frecuentes"

const PLACAS_DEFAULT = ["GBA-1234", "GBQ-5678", "PCE-9012"]

function leerPlacasFrecuentes(): string[] {
  if (typeof window === "undefined") return PLACAS_DEFAULT
  try {
    const raw = localStorage.getItem(PLACAS_STORAGE_KEY)
    if (!raw) return PLACAS_DEFAULT
    const parsed = JSON.parse(raw) as string[]
    return parsed.length ? parsed : PLACAS_DEFAULT
  } catch {
    return PLACAS_DEFAULT
  }
}

function guardarPlacaFrecuente(placa: string) {
  const set = new Set([placa, ...leerPlacasFrecuentes()])
  localStorage.setItem(PLACAS_STORAGE_KEY, JSON.stringify([...set].slice(0, 8)))
}

type GeoPos = { lat: number; lng: number; precision?: number }

export function DespachoVolquetasClient() {
  const { proyectoId } = useProyecto()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [abscisas, setAbscisas] = useState<CanalAbscisa[]>([])
  const [botaderos, setBotaderos] = useState<ProyectoBotadero[]>([])
  const [placa, setPlaca] = useState("")
  const [chofer, setChofer] = useState("")
  const [abscisaId, setAbscisaId] = useState<string>("")
  const [botaderoId, setBotaderoId] = useState<string>("")
  const [geo, setGeo] = useState<GeoPos | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingDispatch, setLoadingDispatch] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ultimoTicket, setUltimoTicket] = useState<TicketDesalojo | null>(null)

  const placasFrecuentes = useMemo(() => leerPlacasFrecuentes(), [])

  useEffect(() => {
    const param = searchParams.get("abscisa")
    if (param) setAbscisaId(param)
  }, [searchParams])

  useEffect(() => {
    async function cargar() {
      setLoadingData(true)
      setError(null)
      try {
        const [a, b] = await Promise.all([
          cargarCanalAbscisasProyecto(supabase, proyectoId),
          cargarProyectoBotaderos(supabase, proyectoId),
        ])
        setAbscisas(a)
        setBotaderos(b)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se cargaron datos.")
      } finally {
        setLoadingData(false)
      }
    }
    void cargar()
  }, [proyectoId, supabase])

  const abscisaSel = abscisas.find((a) => a.id === abscisaId) ?? null
  const botaderoSel = botaderos.find((b) => b.id === botaderoId) ?? null

  const distanciaKm = useMemo(() => {
    if (!geo || !botaderoSel) return null
    return distanciaGeodesicaKm(geo.lat, geo.lng, botaderoSel.lat, botaderoSel.lng)
  }, [geo, botaderoSel])

  const fueraDeRadio = distanciaKm != null && distanciaKm > RADIO_DESALOJO_MAX_KM

  const capturarGps = useCallback(() => {
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError("Geolocalización no disponible en este dispositivo.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precision: pos.coords.accuracy,
        })
      },
      (err) => setGeoError(err.message || "No se pudo obtener GPS."),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 }
    )
  }, [])

  useEffect(() => {
    capturarGps()
  }, [capturarGps])

  async function despachar() {
    setLoadingDispatch(true)
    setError(null)
    try {
      if (!placa.trim()) throw new Error("Indique la placa de la volqueta.")
      if (!botaderoSel) throw new Error("Seleccione botadero autorizado.")
      if (!geo) throw new Error("Capture la ubicación GPS de origen.")

      const ticket = await crearTicketDesalojo(supabase, {
        proyecto_id: proyectoId,
        placa_volqueta: placa,
        chofer: chofer || null,
        capacidad_m3: CAPACIDAD_VOLQUETA_M3_DEFAULT,
        abscisa_id: abscisaSel?.id ?? null,
        lat_origen: geo.lat,
        lng_origen: geo.lng,
        botadero_nombre: botaderoSel.nombre,
        lat_destino: botaderoSel.lat,
        lng_destino: botaderoSel.lng,
        distancia_km: distanciaKm,
        observaciones: fueraDeRadio ? "Registro con advertencia: fuera de radio contractual." : null,
      })

      guardarPlacaFrecuente(placa.trim().toUpperCase())
      setUltimoTicket(ticket)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el ticket.")
    } finally {
      setLoadingDispatch(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4 pb-8">
      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="size-5" aria-hidden />
            Despacho rápido de volquetas
          </CardTitle>
          <CardDescription>Uso en campo — radio contractual máximo {RADIO_DESALOJO_MAX_KM} km</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loadingData ? <p className="text-sm text-muted-foreground">Cargando catálogos…</p> : null}

          <div className="space-y-2">
            <Label>Placa (acceso rápido)</Label>
            <div className="flex flex-wrap gap-2">
              {placasFrecuentes.map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="lg"
                  variant={placa === p ? "default" : "outline"}
                  className="min-h-12 touch-manipulation px-4 text-base font-semibold"
                  onClick={() => setPlaca(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Input
              placeholder="Otra placa"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              className="min-h-12 text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chofer">Chofer</Label>
            <Input id="chofer" value={chofer} onChange={(e) => setChofer(e.target.value)} className="min-h-11" />
          </div>

          <div className="space-y-1.5">
            <Label>Abscisa (opcional)</Label>
            <Select value={abscisaId || "__none__"} onValueChange={(v) => setAbscisaId(v === "__none__" ? "" : v)}>
              <SelectTrigger className="min-h-11">
                <SelectValue placeholder="Sin abscisa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin abscisa vinculada</SelectItem>
                {abscisas.slice(0, 200).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.codigo_estacion} · {a.sector_nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Botadero autorizado</Label>
            {botaderos.length === 0 ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                No hay botaderos registrados. Configure coordenadas en Supabase (`proyecto_botaderos`).
              </p>
            ) : (
              <Select value={botaderoId || undefined} onValueChange={setBotaderoId}>
                <SelectTrigger className="min-h-11">
                  <SelectValue placeholder="Seleccionar botadero" />
                </SelectTrigger>
                <SelectContent>
                  {botaderos.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="rounded-lg border border-foreground/10 bg-muted/30 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <MapPin className="size-4 shrink-0" aria-hidden />
              GPS origen
            </p>
            {geo ? (
              <p className="mt-1 text-muted-foreground">
                {geo.lat.toFixed(6)}, {geo.lng.toFixed(6)}
                {geo.precision != null ? ` (±${Math.round(geo.precision)} m)` : null}
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">Sin coordenadas aún.</p>
            )}
            {geoError ? <p className="mt-1 text-destructive">{geoError}</p> : null}
            <Button type="button" variant="secondary" size="sm" className="mt-2 touch-manipulation" onClick={capturarGps}>
              Actualizar GPS
            </Button>
            {distanciaKm != null ? (
              <p className={cn("mt-2 font-medium", fueraDeRadio && "text-destructive")}>
                Distancia al botadero: {distanciaKm.toFixed(2)} km
              </p>
            ) : null}
          </div>

          {fueraDeRadio ? (
            <div
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <p className="font-semibold">Fuera de radio contractual ({RADIO_DESALOJO_MAX_KM} km)</p>
              <p className="mt-1">Verifique botadero y punto de carga antes de confirmar el viaje.</p>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            size="lg"
            className="min-h-14 w-full touch-manipulation text-base"
            disabled={loadingDispatch || loadingData}
            onClick={() => void despachar()}
          >
            {loadingDispatch ? "Registrando…" : "Generar ticket de desalojo"}
          </Button>

          {ultimoTicket ? (
            <div className="rounded-xl border border-green-600/30 bg-green-600/5 p-4 text-sm">
              <p className="font-semibold text-green-800 dark:text-green-300">Ticket {ultimoTicket.numero_ticket}</p>
              <p className="mt-1 break-all text-muted-foreground">QR/hash: {ultimoTicket.qr_hash}</p>
              <p className="mt-1">Estado: {ultimoTicket.estado}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
