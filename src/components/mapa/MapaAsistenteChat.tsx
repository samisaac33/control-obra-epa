"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, ImagePlus, Loader2, MessageCircle, Send, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useMapaUbicacionResidente } from "@/src/components/mapa/MapaUbicacionResidenteBlock"
import type { CanalTramo } from "@/src/data/tramos/types"
import { mensajeErrorAsistenteLegible } from "@/src/lib/mapa-asistente-modelos"
import type { MapaAsistenteUIMessage } from "@/src/lib/mapa-asistente-types"
import {
  resumenPropuestaPuntoEnMapa,
  type ResumenPropuestaPuntoEnMapa,
} from "@/src/lib/mapa-coordenadas-gps"
import type { MapaAsistentePerfil } from "@/src/lib/mapa-asistente-auth"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

type MapaAsistenteChatLayout = "inline" | "sheet"

type MapaAsistenteChatProps = {
  proyectoId: string
  tramos: CanalTramo[]
  puntosAvance: TramoPuntoAvance[]
  variant?: "inline" | "sheet"
  perfil?: MapaAsistentePerfil
  className?: string
}

const COPY_VACIO: Record<MapaAsistentePerfil, string> = {
  residente:
    "Suba una captura GPS, pregunte por avance en el mapa, jornadas de maquinaria (horas, equipos, tramos por fecha) o contexto de la obra. Los datos operativos se leen de la app al enviar el mensaje. Coordenadas detectadas → pin en el mapa; confirme con «Registrar punto».",
  visitante:
    "Pregunte por avance global, tramos o actividad de maquinaria por fecha. Las respuestas son resumidas según los datos publicados en el mapa al enviar cada mensaje.",
}

function textoPartes(parts: MapaAsistenteUIMessage["parts"]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function ListaMensajesAsistente({
  layout,
  messages,
  resumenMapa,
  enviando,
  error,
  textoTamano,
  perfil,
}: {
  layout: MapaAsistenteChatLayout
  messages: MapaAsistenteUIMessage[]
  resumenMapa: ResumenPropuestaPuntoEnMapa | null
  enviando: boolean
  error: Error | undefined
  textoTamano: string
  perfil: MapaAsistentePerfil
}) {
  return (
    <div className={cn("space-y-3", layout === "sheet" ? "pb-2" : "pr-2")}>
      {messages.length === 0 ? (
        <p className={cn("text-muted-foreground", layout === "sheet" ? "text-sm" : "text-xs")}>
          {COPY_VACIO[perfil]}
        </p>
      ) : null}
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "rounded-lg px-2.5 py-2 leading-relaxed",
            textoTamano,
            message.role === "user"
              ? "ml-6 bg-primary/10 text-foreground"
              : "mr-2 bg-muted/60 text-foreground sm:mr-6"
          )}
        >
          {message.role === "assistant" ? (
            <span className="mb-1 flex items-center gap-1 font-medium text-[11px] text-muted-foreground">
              <Bot className="size-3.5" aria-hidden />
              Asistente
            </span>
          ) : null}
          <p className="whitespace-pre-wrap">{textoPartes(message.parts)}</p>
        </div>
      ))}
      {resumenMapa ? (
        <div
          className={cn(
            "rounded-lg border px-2.5 py-2",
            textoTamano,
            resumenMapa.puedeRegistrar
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          )}
        >
          <p className="font-medium">{resumenMapa.titulo}</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
            {resumenMapa.lineas.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
          <p className="mt-2 font-medium text-foreground">
            Use «Registrar punto» en la barra del mapa para confirmar el registro.
          </p>
        </div>
      ) : null}
      {enviando ? (
        <p className={cn("flex items-center gap-1 text-muted-foreground", textoTamano)}>
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Procesando…
        </p>
      ) : null}
      {error ? (
        <p className={cn("text-destructive", textoTamano)} role="alert">
          {mensajeErrorAsistenteLegible(error.message)}
        </p>
      ) : null}
    </div>
  )
}

function ComposerAsistente({
  layout,
  input,
  setInput,
  adjunto,
  previewUrl,
  enviando,
  fileInputRef,
  onSeleccionarArchivo,
  limpiarAdjunto,
  enviar,
  permitirAdjunto,
  placeholder,
}: {
  layout: MapaAsistenteChatLayout
  input: string
  setInput: (value: string) => void
  adjunto: File | null
  previewUrl: string | null
  enviando: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onSeleccionarArchivo: (file: File | null) => void
  limpiarAdjunto: () => void
  enviar: () => Promise<void>
  permitirAdjunto: boolean
  placeholder: string
}) {
  return (
    <div
      className={cn(
        layout === "sheet" &&
          "shrink-0 border-t border-foreground/10 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      )}
    >
      {previewUrl ? (
        <div className={cn("relative inline-block w-fit", layout === "sheet" ? "mb-3" : "mt-2")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Vista previa adjunto"
            className="max-h-24 rounded-md border border-foreground/10 object-contain"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute -right-2 -top-2 size-7"
            aria-label="Quitar imagen"
            onClick={limpiarAdjunto}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : null}

      <div className={cn("flex gap-2", layout === "inline" && "mt-2")}>
        {permitirAdjunto ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onSeleccionarArchivo(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0"
              aria-label="Adjuntar imagen GPS"
              disabled={enviando}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
            </Button>
          </>
        ) : null}
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="min-h-11 flex-1 resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void enviar()
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          className="size-11 shrink-0"
          aria-label="Enviar mensaje"
          disabled={enviando || (!input.trim() && !adjunto)}
          onClick={() => void enviar()}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function MapaAsistenteChatEngine({
  proyectoId,
  tramos,
  puntosAvance,
  layout = "inline",
  perfil,
  className,
  onCoordsFromServer,
}: {
  proyectoId: string
  tramos: CanalTramo[]
  puntosAvance: TramoPuntoAvance[]
  layout?: MapaAsistenteChatLayout
  perfil: MapaAsistentePerfil
  className?: string
  onCoordsFromServer?: (coords: { lat: number; lng: number; precision_m: number }) => void
}) {
  const esResidente = perfil === "residente"
  const [input, setInput] = useState("")
  const [adjunto, setAdjunto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [resumenMapa, setResumenMapa] = useState<ResumenPropuestaPuntoEnMapa | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mensajesScrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport<MapaAsistenteUIMessage>({
        api: `/api/${proyectoId}/mapa/asistente`,
      }),
    [proyectoId]
  )

  const onData = useCallback(
    (part: { type: string; data?: unknown }) => {
      if (!onCoordsFromServer) return
      if (part.type !== "data-map-coords" || !part.data) return
      const data = part.data as {
        lat: number
        lng: number
        precision_m: number
      }
      onCoordsFromServer(data)
      setResumenMapa(resumenPropuestaPuntoEnMapa(tramos, puntosAvance, data.lat, data.lng))
    },
    [onCoordsFromServer, tramos, puntosAvance]
  )

  const { messages, sendMessage, status, error } = useChat<MapaAsistenteUIMessage>({
    transport,
    onData: onCoordsFromServer ? onData : undefined,
  })

  const enviando = status === "streaming" || status === "submitted"
  const textoTamano = layout === "sheet" ? "text-sm" : "text-xs"

  useEffect(() => {
    if (layout !== "sheet") return
    const el = mensajesScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [layout, messages, status, resumenMapa, error])

  function limpiarAdjunto() {
    setAdjunto(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function onSeleccionarArchivo(file: File | null) {
    limpiarAdjunto()
    if (!file) return
    if (!file.type.startsWith("image/")) return
    setAdjunto(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function enviar() {
    const text = input.trim()
    if (!text && !adjunto) return

    setInput("")
    const fileList = (() => {
      if (!adjunto) return undefined
      const dt = new DataTransfer()
      dt.items.add(adjunto)
      return dt.files
    })()
    limpiarAdjunto()

    if (fileList && fileList.length > 0) {
      await sendMessage({
        text: text || "Analiza esta captura GPS y ubica el punto en el mapa.",
        files: fileList,
      })
      return
    }
    await sendMessage({ text })
  }

  const listaProps = {
    layout,
    messages,
    resumenMapa: esResidente ? resumenMapa : null,
    enviando,
    error,
    textoTamano,
    perfil,
  }

  const composerProps = {
    layout,
    input,
    setInput,
    adjunto,
    previewUrl,
    enviando,
    fileInputRef,
    onSeleccionarArchivo,
    limpiarAdjunto,
    enviar,
    permitirAdjunto: esResidente,
    placeholder: esResidente
      ? "Ej.: horas y tramos de ayer, TDR, avance…"
      : "Ej.: avance global, actividad del lunes…",
  }

  if (layout === "sheet") {
    return (
      <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
        <div
          ref={mensajesScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-1"
        >
          <ListaMensajesAsistente {...listaProps} />
        </div>
        <ComposerAsistente {...composerProps} />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <ScrollArea className="max-h-72 min-h-40 rounded-md border border-foreground/10 bg-background/80 p-3">
        <ListaMensajesAsistente {...listaProps} />
      </ScrollArea>
      <ComposerAsistente {...composerProps} />
    </div>
  )
}

function MapaAsistenteChatInnerResidente(
  props: Omit<MapaAsistenteChatProps, "variant" | "perfil"> & {
    layout?: MapaAsistenteChatLayout
  }
) {
  const { aplicarCoordenadasEnMapa } = useMapaUbicacionResidente()
  const onCoordsFromServer = useCallback(
    (data: { lat: number; lng: number; precision_m: number }) => {
      aplicarCoordenadasEnMapa(data)
    },
    [aplicarCoordenadasEnMapa]
  )
  return (
    <MapaAsistenteChatEngine
      {...props}
      perfil="residente"
      onCoordsFromServer={onCoordsFromServer}
    />
  )
}

function MapaAsistenteChatInner(props: {
  perfil: MapaAsistentePerfil
  proyectoId: string
  tramos: CanalTramo[]
  puntosAvance: TramoPuntoAvance[]
  layout?: MapaAsistenteChatLayout
  className?: string
}) {
  if (props.perfil === "visitante") {
    return <MapaAsistenteChatEngine {...props} perfil="visitante" />
  }
  return <MapaAsistenteChatInnerResidente {...props} />
}

const UI_PERFIL: Record<
  MapaAsistentePerfil,
  { titulo: string; descripcion: string; fab: string }
> = {
  residente: {
    titulo: "Asistente del mapa",
    descripcion:
      "Consultas sobre mapa, maquinaria y obra; capturas GPS. Cifras según registros al enviar cada mensaje.",
    fab: "Asistente",
  },
  visitante: {
    titulo: "Consulta de avance",
    descripcion: "Respuestas resumidas según los datos publicados en el mapa al enviar cada mensaje.",
    fab: "Consulta",
  },
}

export function MapaAsistenteChat({
  proyectoId,
  tramos,
  puntosAvance,
  variant = "inline",
  perfil = "residente",
  className,
}: MapaAsistenteChatProps) {
  const [sheetAbierto, setSheetAbierto] = useState(false)
  const ui = UI_PERFIL[perfil]

  if (variant === "sheet") {
    return (
      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        {!sheetAbierto ? (
          <SheetTrigger asChild>
            <Button
              type="button"
              size="lg"
              className="fixed bottom-24 right-4 z-[500] min-h-12 gap-2 rounded-full px-4 shadow-lg md:hidden"
            >
              <MessageCircle className="size-4" aria-hidden />
              {ui.fab}
            </Button>
          </SheetTrigger>
        ) : null}
        <SheetContent
          side="bottom"
          className="flex h-[min(85dvh,100%)] max-h-[85dvh] flex-col gap-0 overflow-hidden p-0"
        >
          <SheetHeader className="shrink-0 space-y-1 px-4 pt-4 pb-2 text-left">
            <SheetTitle>{ui.titulo}</SheetTitle>
            <SheetDescription>{ui.descripcion}</SheetDescription>
          </SheetHeader>
          <MapaAsistenteChatInner
            perfil={perfil}
            proyectoId={proyectoId}
            tramos={tramos}
            puntosAvance={puntosAvance}
            layout="sheet"
            className={className}
          />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Card className={cn("border-foreground/10", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-4" aria-hidden />
          {ui.titulo}
        </CardTitle>
        <CardDescription>{ui.descripcion}</CardDescription>
      </CardHeader>
      <CardContent>
        <MapaAsistenteChatInner
          perfil={perfil}
          proyectoId={proyectoId}
          tramos={tramos}
          puntosAvance={puntosAvance}
          layout="inline"
        />
      </CardContent>
    </Card>
  )
}
