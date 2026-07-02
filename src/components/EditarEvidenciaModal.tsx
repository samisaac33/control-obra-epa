"use client"

import Image from "next/image"
import { FormEvent, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EstadoHitoSelect } from "@/src/components/EstadoHitoSelect"
import { SectorSelect } from "@/src/components/SectorSelect"
import { estadoHitoParaGuardar, normalizarEstadoHito } from "@/src/data/estados-hito"
import {
  getSectorIdByLabel,
  getSectorLabel,
  isFiltroTodosLosSectores,
} from "@/src/data/sectores-fotos"
import { compressImage } from "@/src/lib/compress-image"
import { validarCoordenadasOpcionales } from "@/src/lib/coordenadas-evidencia"
import type { EvidenciaGrupo, RegistroFotoBase } from "@/src/lib/evidencias-grupo"
import { createClient } from "@/src/lib/supabase/client"

const BUCKET_NAME = "evidencias"
const MAX_IMAGENES = 20
const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
const TEXTAREA_CLASS =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"

function trimOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed || null
}

function toLocalDatetimeValue(date: Date) {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16)
}

type EditarEvidenciaModalProps = {
  grupo: EvidenciaGrupo | null
  onClose: () => void
  onSaved: () => void
}

export function EditarEvidenciaModal({ grupo, onClose, onSaved }: EditarEvidenciaModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sectorId, setSectorId] = useState("")
  const [fechaCaptura, setFechaCaptura] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [numeroRubro, setNumeroRubro] = useState("")
  const [ubicacionAbscisa, setUbicacionAbscisa] = useState("")
  const [actividadEspecifica, setActividadEspecifica] = useState("")
  const [maquinariaUtilizada, setMaquinariaUtilizada] = useState("")
  const [estadoHito, setEstadoHito] = useState("")
  const [observacionTecnica, setObservacionTecnica] = useState("")
  const [imagenesExistentes, setImagenesExistentes] = useState<RegistroFotoBase[]>([])
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([])
  const [fileInputKey, setFileInputKey] = useState(0)

  const previewsNuevas = useMemo(
    () => nuevasImagenes.map((file) => URL.createObjectURL(file)),
    [nuevasImagenes]
  )

  useEffect(() => {
    return () => {
      previewsNuevas.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewsNuevas])

  useEffect(() => {
    if (!grupo) return

    const { representante } = grupo
    setError(null)
    setImagenesExistentes(grupo.imagenes)
    setNuevasImagenes([])
    setFileInputKey((key) => key + 1)
    setSectorId(getSectorIdByLabel(representante.sector) ?? "")
    setFechaCaptura(toLocalDatetimeValue(new Date(representante.fecha_captura)))
    setLat(representante.lat != null ? String(representante.lat) : "")
    setLng(representante.lng != null ? String(representante.lng) : "")
    setDescripcion(representante.descripcion ?? "")
    setNumeroRubro(representante.numero_rubro != null ? String(representante.numero_rubro) : "")
    setUbicacionAbscisa(representante.ubicacion_abscisa ?? "")
    setActividadEspecifica(representante.actividad_especifica ?? "")
    setMaquinariaUtilizada(representante.maquinaria_utilizada ?? "")
    setEstadoHito(normalizarEstadoHito(representante.estado_hito) ?? "")
    setObservacionTecnica(representante.observacion_tecnica ?? "")
  }, [grupo])

  useEffect(() => {
    if (!grupo) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [grupo, onClose])

  function handleNuevasImagenes(fileList: FileList | null) {
    if (!grupo) return

    const seleccionados = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"))
    const cupo = MAX_IMAGENES - imagenesExistentes.length - nuevasImagenes.length

    if (seleccionados.length > cupo) {
      setError(`Solo puedes tener hasta ${MAX_IMAGENES} imagenes por evidencia.`)
      setNuevasImagenes((current) => [...current, ...seleccionados.slice(0, Math.max(0, cupo))])
      setFileInputKey((key) => key + 1)
      return
    }

    setError(null)
    setNuevasImagenes((current) => [...current, ...seleccionados])
    setFileInputKey((key) => key + 1)
  }

  function quitarImagenExistente(id: string) {
    setImagenesExistentes((current) => current.filter((imagen) => imagen.id !== id))
  }

  function quitarNuevaImagen(index: number) {
    setNuevasImagenes((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!grupo) return

    setError(null)

    const totalFinal = imagenesExistentes.length + nuevasImagenes.length
    if (totalFinal === 0) {
      setError("La evidencia debe tener al menos una imagen.")
      return
    }

    if (isFiltroTodosLosSectores(sectorId)) {
      setError("Selecciona el rubro o frente de obra al que corresponde la evidencia.")
      return
    }

    const sectorLabel = getSectorLabel(sectorId)
    if (!sectorLabel) {
      setError("Selecciona el sector de la evidencia.")
      return
    }

    const coordenadas = validarCoordenadasOpcionales(lat, lng)
    if (coordenadas.error) {
      setError(coordenadas.error)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("Sesion no valida. Vuelve a iniciar sesion.")
        return
      }

      const idsMantener = new Set(imagenesExistentes.map((imagen) => imagen.id))
      const imagenesEliminar = grupo.imagenes.filter((imagen) => !idsMantener.has(imagen.id))

      const metadatos = {
        fecha_captura: new Date(fechaCaptura).toISOString(),
        lat: coordenadas.lat,
        lng: coordenadas.lng,
        sector: sectorLabel,
        descripcion: trimOrNull(descripcion),
        numero_rubro: trimOrNull(numeroRubro),
        ubicacion_abscisa: trimOrNull(ubicacionAbscisa),
        actividad_especifica: trimOrNull(actividadEspecifica),
        maquinaria_utilizada: trimOrNull(maquinariaUtilizada),
        estado_hito: estadoHitoParaGuardar(estadoHito),
        observacion_tecnica: trimOrNull(observacionTecnica),
      }

      const grupoId = grupo.representante.grupo_id ?? grupo.grupoId
      const rutasSubidas: string[] = []

      if (imagenesEliminar.length > 0) {
        const idsEliminar = imagenesEliminar.map((imagen) => imagen.id)
        const pathsEliminar = imagenesEliminar.map((imagen) => imagen.image_path)

        const { error: deleteError } = await supabase
          .from("registros_fotograficos")
          .delete()
          .in("id", idsEliminar)

        if (deleteError) {
          setError(deleteError.message)
          return
        }

        const { error: removeStorageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(pathsEliminar)

        if (removeStorageError) {
          setError(`Registros eliminados, pero no se pudieron borrar archivos: ${removeStorageError.message}`)
          return
        }
      }

      if (imagenesExistentes.length > 0) {
        const { error: updateError } = await supabase
          .from("registros_fotograficos")
          .update(metadatos)
          .in(
            "id",
            imagenesExistentes.map((imagen) => imagen.id)
          )

        if (updateError) {
          setError(updateError.message)
          return
        }
      }

      for (const [index, archivo] of nuevasImagenes.entries()) {
        const archivoComprimido = await compressImage(archivo)
        const fileName = `${Date.now()}-edit-${index}-${archivoComprimido.name.replace(/\s+/g, "-").toLowerCase()}`
        const imagePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(imagePath, archivoComprimido, { upsert: false })

        if (uploadError) {
          setError(uploadError.message)
          if (rutasSubidas.length > 0) {
            await supabase.storage.from(BUCKET_NAME).remove(rutasSubidas)
          }
          return
        }

        rutasSubidas.push(imagePath)

        const { error: insertError } = await supabase.from("registros_fotograficos").insert({
          created_by: user.id,
          ...metadatos,
          grupo_id: grupoId,
          image_path: imagePath,
        })

        if (insertError) {
          setError(insertError.message)
          await supabase.storage.from(BUCKET_NAME).remove(rutasSubidas)
          return
        }
      }

      onSaved()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!grupo) return null

  const totalActual = imagenesExistentes.length + nuevasImagenes.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">Editar evidencia</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Actualiza los datos, agrega o elimina imagenes de la galeria ({totalActual}/{MAX_IMAGENES}).
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <div className="space-y-3 rounded-lg border border-foreground/10 p-3">
              <p className="text-sm font-medium text-foreground">Imagenes de la galeria</p>

              {imagenesExistentes.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {imagenesExistentes.map((imagen) => (
                    <div key={imagen.id} className="overflow-hidden rounded-lg border border-border">
                      {imagen.image_url ? (
                        <Image
                          src={imagen.image_url}
                          alt="Imagen existente"
                          width={200}
                          height={120}
                          className="h-24 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center bg-muted text-xs text-muted-foreground">
                          Sin vista previa
                        </div>
                      )}
                      <div className="p-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 w-full text-xs"
                          onClick={() => quitarImagenExistente(imagen.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No quedan imagenes actuales en la galeria.</p>
              )}

              {nuevasImagenes.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Nuevas imagenes por agregar</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {nuevasImagenes.map((archivo, index) => (
                      <div
                        key={`${archivo.name}-${index}`}
                        className="overflow-hidden rounded-lg border border-primary/30"
                      >
                        <Image
                          src={previewsNuevas[index]}
                          alt={archivo.name}
                          width={200}
                          height={120}
                          className="h-24 w-full object-cover"
                        />
                        <div className="p-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 w-full text-xs"
                            onClick={() => quitarNuevaImagen(index)}
                          >
                            Quitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {totalActual < MAX_IMAGENES ? (
                <div className="space-y-1.5">
                  <label htmlFor="editar-nuevas-imagenes" className="text-xs font-medium text-muted-foreground">
                    Agregar imagenes
                  </label>
                  <input
                    key={fileInputKey}
                    id="editar-nuevas-imagenes"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => handleNuevasImagenes(event.target.files)}
                    className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Has alcanzado el maximo de {MAX_IMAGENES} imagenes.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="editar-sector" className="text-sm font-medium">
                Sector / frente
              </label>
              <SectorSelect
                id="editar-sector"
                variant="form"
                value={sectorId}
                onChange={setSectorId}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="editar-fecha" className="text-sm font-medium">
                Fecha y hora de captura
              </label>
              <input
                id="editar-fecha"
                type="datetime-local"
                value={fechaCaptura}
                onChange={(event) => setFechaCaptura(event.target.value)}
                required
                className={INPUT_CLASS}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="editar-lat" className="text-sm font-medium">
                  Latitud <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="editar-lat"
                  value={lat}
                  onChange={(event) => setLat(event.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="editar-lng" className="text-sm font-medium">
                  Longitud <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="editar-lng"
                  value={lng}
                  onChange={(event) => setLng(event.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="editar-datos-tecnicos" className="rounded-lg border border-foreground/10 px-3">
                <AccordionTrigger className="py-3 text-left text-sm font-medium">
                  Datos técnicos adicionales
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="space-y-1.5">
                    <label htmlFor="editar-numero-rubro" className="text-sm font-medium">
                      Número de rubro
                    </label>
                    <input
                      id="editar-numero-rubro"
                      type="text"
                      value={numeroRubro}
                      onChange={(event) => setNumeroRubro(event.target.value)}
                      placeholder="Ej. 14 Desazolve tramo norte"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="editar-ubicacion" className="text-sm font-medium">
                      Ubicación
                    </label>
                    <input
                      id="editar-ubicacion"
                      value={ubicacionAbscisa}
                      onChange={(event) => setUbicacionAbscisa(event.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="editar-actividad" className="text-sm font-medium">
                      Actividad específica
                    </label>
                    <input
                      id="editar-actividad"
                      value={actividadEspecifica}
                      onChange={(event) => setActividadEspecifica(event.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="editar-maquinaria" className="text-sm font-medium">
                      Maquinaria utilizada
                    </label>
                    <input
                      id="editar-maquinaria"
                      value={maquinariaUtilizada}
                      onChange={(event) => setMaquinariaUtilizada(event.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="editar-estado-hito" className="text-sm font-medium">
                      Estado del hito
                    </label>
                    <EstadoHitoSelect
                      id="editar-estado-hito"
                      value={estadoHito}
                      onChange={setEstadoHito}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="editar-obs-tecnica" className="text-sm font-medium">
                      Observación técnica relevante
                    </label>
                    <textarea
                      id="editar-obs-tecnica"
                      value={observacionTecnica}
                      onChange={(event) => setObservacionTecnica(event.target.value)}
                      rows={3}
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="space-y-1.5">
              <label htmlFor="editar-descripcion" className="text-sm font-medium">
                Observación general
              </label>
              <textarea
                id="editar-descripcion"
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                rows={3}
                className={TEXTAREA_CLASS}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-4 py-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || totalActual === 0}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
