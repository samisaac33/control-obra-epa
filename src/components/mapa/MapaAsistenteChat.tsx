"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, ImagePlus, Loader2, MessageCircle, Send, X } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"

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
import type { MapaAsistenteUIMessage } from "@/src/lib/mapa-asistente-types"
import {
  resumenPropuestaPuntoEnMapa,
  type ResumenPropuestaPuntoEnMapa,
} from "@/src/lib/mapa-coordenadas-gps"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

type MapaAsistenteChatProps = {
  proyectoId: string
  tramos: CanalTramo[]
  puntosAvance: TramoPuntoAvance[]
  variant?: "inline" | "sheet"
  className?: string
}

function textoPartes(parts: MapaAsistenteUIMessage["parts"]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function MapaAsistenteChatInner({
  proyectoId,
  tramos,
  puntosAvance,
  className,
}: Omit<MapaAsistenteChatProps, "variant">) {
  const { aplicarCoordenadasEnMapa } = useMapaUbicacionResidente()
  const [input, setInput] = useState("")
  const [adjunto, setAdjunto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [resumenMapa, setResumenMapa] = useState<ResumenPropuestaPuntoEnMapa | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport<MapaAsistenteUIMessage>({
        api: `/api/${proyectoId}/mapa/asistente`,
      }),
    [proyectoId]
  )

  const onData = useCallback(
    (part: { type: string; data?: unknown }) => {
      if (part.type !== "data-map-coords" || !part.data) return
      const data = part.data as {
        lat: number
        lng: number
        precision_m: number
      }
      aplicarCoordenadasEnMapa({
        lat: data.lat,
        lng: data.lng,
        precision_m: data.precision_m,
      })
      setResumenMapa(resumenPropuestaPuntoEnMapa(tramos, puntosAvance, data.lat, data.lng))
    },
    [aplicarCoordenadasEnMapa, tramos, puntosAvance]
  )

  const { messages, sendMessage, status, error } = useChat<MapaAsistenteUIMessage>({
    transport,
    onData,
  })

  const enviando = status === "streaming" || status === "submitted"

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

  return (
    <div className={cn("flex flex-col", className)}>
      <ScrollArea className="max-h-64 min-h-40 rounded-md border border-foreground/10 bg-background/80 p-3">
        <div className="space-y-3 pr-2">
          {messages.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Suba una captura de su app GPS o pregunte sobre el registro de avance en canales. Si
              detectamos coordenadas, el pin aparecerá en el mapa; confirme con «Registrar punto».
            </p>
          ) : null}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "rounded-lg px-2.5 py-2 text-xs leading-relaxed",
                message.role === "user"
                  ? "ml-6 bg-primary/10 text-foreground"
                  : "mr-6 bg-muted/60 text-foreground"
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
                "rounded-lg border px-2.5 py-2 text-xs",
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
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Procesando…
            </p>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error.message}
            </p>
          ) : null}
        </div>
      </ScrollArea>

      {previewUrl ? (
        <div className="relative mt-2 inline-block w-fit">
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

      <div className="mt-2 flex gap-2">
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
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre el proyecto o pegue coordenadas…"
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

export function MapaAsistenteChat({
  proyectoId,
  tramos,
  puntosAvance,
  variant = "inline",
  className,
}: MapaAsistenteChatProps) {
  if (variant === "sheet") {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="lg"
            className="fixed bottom-24 right-4 z-[500] min-h-12 gap-2 rounded-full px-4 shadow-lg md:hidden"
          >
            <MessageCircle className="size-4" aria-hidden />
            Asistente
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Asistente del mapa</SheetTitle>
            <SheetDescription>
              Imágenes GPS y preguntas sobre desasolve. Las coordenadas detectadas se muestran en el
              mapa.
            </SheetDescription>
          </SheetHeader>
          <MapaAsistenteChatInner
            proyectoId={proyectoId}
            tramos={tramos}
            puntosAvance={puntosAvance}
            className={cn("mt-4 pb-4", className)}
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
          Asistente del mapa
        </CardTitle>
        <CardDescription>
          Suba capturas GPS o haga preguntas. Al detectar coordenadas, el mapa mostrará el pin para
          registrar avance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MapaAsistenteChatInner
          proyectoId={proyectoId}
          tramos={tramos}
          puntosAvance={puntosAvance}
        />
      </CardContent>
    </Card>
  )
}
