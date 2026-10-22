"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Copy, Loader2 } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { CameraWatermark } from "@/src/components/evidencias/CameraWatermark"
import {
  etiquetaTipoParalizacion,
  type EventoParalizacion,
  type TipoEventoParalizacion,
} from "@/src/data/auditoria/types"
import { SECTORES_FRENTE } from "@/src/data/contrato-emergencia-severino-trasvase"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  cargarEventosParalizacionProyecto,
  crearEventoParalizacion,
} from "@/src/lib/cargar-eventos-paralizacion"
import { createClient } from "@/src/lib/supabase/client"

const TIPOS: TipoEventoParalizacion[] = [
  "lluvia_intensa",
  "crecida_caudal_canal",
  "falla_suministro_electrico",
  "bloqueo_acceso_terreno",
]

export function SalvaPlazosClient() {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [userId, setUserId] = useState<string>("")
  const [eventos, setEventos] = useState<EventoParalizacion[]>([])
  const [tipo, setTipo] = useState<TipoEventoParalizacion>("lluvia_intensa")
  const [sector, setSector] = useState<string>(SECTORES_FRENTE[0])
  const [inicio, setInicio] = useState("")
  const [fin, setFin] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiadoId, setCopiadoId] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    const rows = await cargarEventosParalizacionProyecto(supabase, proyectoId)
    setEventos(rows)
  }, [proyectoId, supabase])

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? "anon")
    })
    void recargar().catch(() => setEventos([]))
  }, [recargar, supabase.auth])

  async function registrar() {
    setLoading(true)
    setError(null)
    try {
      if (!inicio) throw new Error("Indique fecha/hora de inicio.")
      await crearEventoParalizacion(supabase, {
        proyecto_id: proyectoId,
        tipo_evento: tipo,
        fecha_inicio: new Date(inicio).toISOString(),
        fecha_fin: fin ? new Date(fin).toISOString() : null,
        descripcion: descripcion || null,
        foto_evidencia_url: fotoUrl,
        registrado_por: userId !== "anon" ? userId : null,
        sector_nombre: sector,
      })
      setDescripcion("")
      setFin("")
      await recargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar.")
    } finally {
      setLoading(false)
    }
  }

  async function copiarTexto(evento: EventoParalizacion) {
    if (!evento.texto_libro_obra) return
    await navigator.clipboard.writeText(evento.texto_libro_obra)
    setCopiadoId(evento.id)
    setTimeout(() => setCopiadoId(null), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle>Salva-plazos — Libro de Obra</CardTitle>
          <CardDescription>
            Registro de suspensiones por fuerza mayor (Art. 30 Código Civil · Art. 1.1 pliego)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo de evento</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoEventoParalizacion)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {etiquetaTipoParalizacion(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Frente / sector</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTORES_FRENTE.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inicio-paralizacion">Inicio</Label>
              <Input
                id="inicio-paralizacion"
                type="datetime-local"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-paralizacion">Fin (opcional)</Label>
              <Input
                id="fin-paralizacion"
                type="datetime-local"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc-paralizacion">Descripción técnica</Label>
            <Textarea
              id="desc-paralizacion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          {userId ? (
            <CameraWatermark
              proyectoId={proyectoId}
              frente={sector}
              abscisa="Evento paralización"
              userId={userId}
              onUploaded={(path) => setFotoUrl(path)}
            />
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="button" disabled={loading} onClick={() => void registrar()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Guardando…
              </>
            ) : (
              "Registrar evento"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="text-base">Historial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin eventos registrados.</p>
          ) : (
            eventos.map((e) => (
              <div key={e.id} className="rounded-lg border border-foreground/10 p-3 text-sm">
                <p className="font-medium">{etiquetaTipoParalizacion(e.tipo_evento)}</p>
                <p className="text-muted-foreground">
                  {new Date(e.fecha_inicio).toLocaleString("es-EC")}
                  {e.fecha_fin ? ` — ${new Date(e.fecha_fin).toLocaleString("es-EC")}` : ""}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => void copiarTexto(e)}
                >
                  <Copy className="mr-1 size-3.5" aria-hidden />
                  {copiadoId === e.id ? "Copiado" : "Copiar texto para Libro de Obra"}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
