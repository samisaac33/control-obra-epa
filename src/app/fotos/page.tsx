"use client"

import * as exifr from "exifr"
import { MapPin } from "lucide-react"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EditarEvidenciaModal } from "@/src/components/EditarEvidenciaModal"
import { EstadoHitoSelect } from "@/src/components/EstadoHitoSelect"
import { EvidenciaGaleriaCard } from "@/src/components/EvidenciaGaleriaCard"
import { EvidenciaGaleriaModal } from "@/src/components/EvidenciaGaleriaModal"
import { RegistroFotoDetalle } from "@/src/components/RegistroFotoDetalle"
import { SectorSelect } from "@/src/components/SectorSelect"
import {
  getSectorLabel,
  ID_TODOS_LOS_SECTORES,
  isFiltroTodosLosSectores,
} from "@/src/data/sectores-fotos"
import { estadoHitoParaGuardar } from "@/src/data/estados-hito"
import {
  agruparRegistrosFotograficos,
  type EvidenciaGrupo,
  type RegistroFotoBase,
} from "@/src/lib/evidencias-grupo"
import { compressImage } from "@/src/lib/compress-image"
import { validarCoordenadasOpcionales } from "@/src/lib/coordenadas-evidencia"
import { createClient } from "@/src/lib/supabase/client"

type RegistroFoto = RegistroFotoBase

const BUCKET_NAME = "evidencias"
const CAMPOS_REGISTRO =
  "id, created_at, fecha_captura, lat, lng, sector, descripcion, numero_rubro, ubicacion_abscisa, actividad_especifica, maquinaria_utilizada, estado_hito, observacion_tecnica, grupo_id, image_path"
const MAX_ARCHIVOS = 20
const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
const TEXTAREA_CLASS =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"

function trimOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed || null
}
export default function FotosPage() {
  const supabase = useMemo(() => createClient(), [])
  const residentEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()
  const toLocalDatetimeValue = useCallback((date: Date) => {
    const tzOffsetMs = date.getTimezoneOffset() * 60_000
    return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16)
  }, [])
  const [loading, setLoading] = useState(false)
  const [loadingRegistros, setLoadingRegistros] = useState(true)
  const [isResident, setIsResident] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registros, setRegistros] = useState<RegistroFoto[]>([])
  const [archivos, setArchivos] = useState<File[]>([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const [fechaCaptura, setFechaCaptura] = useState(() => toLocalDatetimeValue(new Date()))
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [sectorId, setSectorId] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [numeroRubro, setNumeroRubro] = useState("")
  const [ubicacionAbscisa, setUbicacionAbscisa] = useState("")
  const [actividadEspecifica, setActividadEspecifica] = useState("")
  const [maquinariaUtilizada, setMaquinariaUtilizada] = useState("")
  const [estadoHito, setEstadoHito] = useState("")
  const [observacionTecnica, setObservacionTecnica] = useState("")
  const [filtroSectorId, setFiltroSectorId] = useState(ID_TODOS_LOS_SECTORES)
  const [filtroDesde, setFiltroDesde] = useState("")
  const [filtroHasta, setFiltroHasta] = useState("")
  const [activeOverlayGrupoId, setActiveOverlayGrupoId] = useState<string | null>(null)
  const [selectedGrupo, setSelectedGrupo] = useState<EvidenciaGrupo | null>(null)
  const [deletingGrupoId, setDeletingGrupoId] = useState<string | null>(null)
  const [editingGrupo, setEditingGrupo] = useState<EvidenciaGrupo | null>(null)

  const cargarRegistros = useCallback(async () => {
    setLoadingRegistros(true)
    setError(null)
    try {
      let query = supabase
        .from("registros_fotograficos")
        .select(CAMPOS_REGISTRO)
        .order("fecha_captura", { ascending: false })
        .limit(120)

      if (!isFiltroTodosLosSectores(filtroSectorId)) {
        const filtroSectorLabel = getSectorLabel(filtroSectorId)
        if (filtroSectorLabel) {
          query = query.eq("sector", filtroSectorLabel)
        }
      }
      if (filtroDesde) {
        query = query.gte("fecha_captura", new Date(`${filtroDesde}T00:00:00`).toISOString())
      }
      if (filtroHasta) {
        query = query.lte("fecha_captura", new Date(`${filtroHasta}T23:59:59.999`).toISOString())
      }

      const { data, error: queryError } = await query

      if (queryError) {
        setError(queryError.message)
        return
      }

      const signedRows = await Promise.all(
        (data ?? []).map(async (row) => {
          const { data: signedData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(row.image_path, 60 * 60)
          return { ...row, image_url: signedData?.signedUrl } as RegistroFoto
        })
      )

      setRegistros(signedRows)
    } finally {
      setLoadingRegistros(false)
    }
  }, [filtroDesde, filtroHasta, filtroSectorId, supabase])

  const filtroSectorLabel = isFiltroTodosLosSectores(filtroSectorId)
    ? null
    : getSectorLabel(filtroSectorId)
  const grupos = useMemo(() => agruparRegistrosFotograficos(registros), [registros])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void cargarRegistros()
    })
    return () => cancelAnimationFrame(frame)
  }, [cargarRegistros])

  useEffect(() => {
    async function refreshResidentStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const matchesResident = Boolean(user?.email && (!residentEmail || user.email.toLowerCase() === residentEmail))
      setIsResident(matchesResident)
    }

    void refreshResidentStatus()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshResidentStatus()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [residentEmail, supabase])

  function resetFormularioArchivos() {
    setArchivos([])
    setFileInputKey((current) => current + 1)
  }

  async function aplicarExifDesdeArchivo(file: File) {
    try {
      const exif = await exifr.parse(file, { gps: true })
      const latitude = typeof exif?.latitude === "number" ? exif.latitude : null
      const longitude = typeof exif?.longitude === "number" ? exif.longitude : null
      const dateTimeOriginal = exif?.DateTimeOriginal

      if (latitude !== null && longitude !== null) {
        setLat(latitude.toFixed(7))
        setLng(longitude.toFixed(7))
      }

      if (dateTimeOriginal instanceof Date && !Number.isNaN(dateTimeOriginal.getTime())) {
        setFechaCaptura(toLocalDatetimeValue(dateTimeOriginal))
      }
    } catch {
      // Si no hay EXIF no interrumpe el flujo manual.
    }
  }

  async function handleArchivosChange(fileList: FileList | null) {
    const seleccionados = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"))

    if (seleccionados.length > MAX_ARCHIVOS) {
      setError(`Puedes subir hasta ${MAX_ARCHIVOS} imagenes por evidencia.`)
      setArchivos(seleccionados.slice(0, MAX_ARCHIVOS))
      return
    }

    setError(null)
    setArchivos(seleccionados)

    if (seleccionados.length > 0) {
      await aplicarExifDesdeArchivo(seleccionados[0])
    }
  }

  function quitarArchivo(index: number) {
    setArchivos((current) => {
      const siguiente = current.filter((_, itemIndex) => itemIndex !== index)
      if (siguiente.length === 0) {
        setFileInputKey((key) => key + 1)
      }
      return siguiente
    })
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (archivos.length === 0) {
      setError("Selecciona al menos una imagen antes de guardar.")
      return
    }

    if (isFiltroTodosLosSectores(sectorId)) {
      setError("Selecciona el rubro o frente de obra al que corresponde la evidencia.")
      return
    }

    const sectorLabel = getSectorLabel(sectorId)
    if (!sectorLabel) {
      setError("Selecciona el sector donde se tomó la evidencia.")
      return
    }

    const coordenadas = validarCoordenadasOpcionales(lat, lng)
    if (coordenadas.error) {
      setError(coordenadas.error)
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("Sesion no valida. Vuelve a iniciar sesion.")
        return
      }

      const grupoId = crypto.randomUUID()
      const metadatosComunes = {
        created_by: user.id,
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
        grupo_id: grupoId,
      }

      const rutasSubidas: string[] = []

      for (const [index, archivo] of archivos.entries()) {
        const archivoComprimido = await compressImage(archivo)
        const fileName = `${Date.now()}-${index}-${archivoComprimido.name.replace(/\s+/g, "-").toLowerCase()}`
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
          ...metadatosComunes,
          image_path: imagePath,
        })

        if (insertError) {
          setError(insertError.message)
          await supabase.storage.from(BUCKET_NAME).remove(rutasSubidas)
          return
        }
      }

      resetFormularioArchivos()
      setFechaCaptura(toLocalDatetimeValue(new Date()))
      setLat("")
      setLng("")
      setSectorId("")
      setDescripcion("")
      setNumeroRubro("")
      setUbicacionAbscisa("")
      setActividadEspecifica("")
      setMaquinariaUtilizada("")
      setEstadoHito("")
      setObservacionTecnica("")
      await cargarRegistros()
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteGrupo(grupo: EvidenciaGrupo) {
    const totalFotos = grupo.imagenes.length
    const mensaje =
      totalFotos > 1
        ? `Se eliminaran ${totalFotos} fotos de esta evidencia. Esta accion no se puede deshacer.`
        : "Se eliminara esta evidencia. Esta accion no se puede deshacer."

    const confirmed = window.confirm(mensaje)
    if (!confirmed) return

    setDeletingGrupoId(grupo.grupoId)
    setError(null)
    try {
      const ids = grupo.imagenes.map((imagen) => imagen.id)
      const paths = grupo.imagenes.map((imagen) => imagen.image_path)

      const { error: deleteError } = await supabase
        .from("registros_fotograficos")
        .delete()
        .in("id", ids)

      if (deleteError) {
        setError(deleteError.message)
        return
      }

      const { error: removeStorageError } = await supabase.storage.from(BUCKET_NAME).remove(paths)

      if (removeStorageError) {
        setError(`Registro eliminado, pero no se pudo borrar el archivo: ${removeStorageError.message}`)
      }

      if (selectedGrupo?.grupoId === grupo.grupoId) {
        setSelectedGrupo(null)
      }

      await cargarRegistros()
    } finally {
      setDeletingGrupoId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <Card className="border-foreground/10">
          <CardHeader className="hidden md:block">
            <CardTitle>Registro fotografico</CardTitle>
            <CardDescription>Consulta evidencias recientes y registra nuevas cuando corresponda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {isResident ? (
              <section className="space-y-4 border-b border-border pb-8">
                <h3 className="text-lg font-semibold tracking-tight">Nueva evidencia</h3>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="sector" className="text-sm font-medium">
                      Sector / frente
                    </label>
                    <SectorSelect
                      id="sector"
                      variant="form"
                      value={sectorId}
                      onChange={setSectorId}
                      placeholder="Selecciona el sector de la evidencia"
                    />
                    <p className="text-xs text-muted-foreground">
                      Campo obligatorio. Selecciona el rubro o frente de obra al que corresponde la evidencia.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="imagen" className="text-sm font-medium">
                      Imagenes
                    </label>
                    <input
                      key={fileInputKey}
                      id="imagen"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => {
                        void handleArchivosChange(event.target.files)
                      }}
                      required={archivos.length === 0}
                      className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Puedes seleccionar varias fotos (hasta {MAX_ARCHIVOS}). La primera imagen con EXIF
                      autocompleta latitud, longitud y fecha si la foto los incluye.
                    </p>
                    {archivos.length > 0 ? (
                      <ul className="space-y-1 rounded-lg border border-border bg-muted/20 p-2 text-xs">
                        {archivos.map((archivo, index) => (
                          <li key={`${archivo.name}-${index}`} className="flex items-center justify-between gap-2">
                            <span className="truncate text-muted-foreground">
                              {index + 1}. {archivo.name}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 shrink-0 px-2 text-xs"
                              onClick={() => quitarArchivo(index)}
                            >
                              Quitar
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="fecha" className="text-sm font-medium">
                      Fecha y hora de captura
                    </label>
                    <input
                      id="fecha"
                      type="datetime-local"
                      value={fechaCaptura}
                      onChange={(event) => setFechaCaptura(event.target.value)}
                      required
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="lat" className="text-sm font-medium">
                        Latitud <span className="font-normal text-muted-foreground">(opcional)</span>
                      </label>
                      <input
                        id="lat"
                        value={lat}
                        onChange={(event) => setLat(event.target.value)}
                        placeholder="-1.23456"
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="lng" className="text-sm font-medium">
                        Longitud <span className="font-normal text-muted-foreground">(opcional)</span>
                      </label>
                      <input
                        id="lng"
                        value={lng}
                        onChange={(event) => setLng(event.target.value)}
                        placeholder="-79.12345"
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      />
                    </div>
                  </div>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="datos-tecnicos" className="rounded-lg border border-foreground/10 px-3">
                      <AccordionTrigger className="py-3 text-left text-sm font-medium">
                        Datos técnicos adicionales (opcional)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pb-4">
                        <div className="space-y-1.5">
                          <label htmlFor="numero-rubro" className="text-sm font-medium">
                            Número de rubro
                          </label>
                          <input
                            id="numero-rubro"
                            type="text"
                            value={numeroRubro}
                            onChange={(event) => setNumeroRubro(event.target.value)}
                            placeholder="Ej. 14 Desazolve tramo norte"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="ubicacion" className="text-sm font-medium">
                            Ubicación
                          </label>
                          <input
                            id="ubicacion"
                            value={ubicacionAbscisa}
                            onChange={(event) => setUbicacionAbscisa(event.target.value)}
                            placeholder="Ej. Km 4+250 margen derecha"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="actividad-especifica" className="text-sm font-medium">
                            Actividad específica
                          </label>
                          <input
                            id="actividad-especifica"
                            value={actividadEspecifica}
                            onChange={(event) => setActividadEspecifica(event.target.value)}
                            placeholder="Ej. Desazolve de tramo"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="maquinaria-utilizada" className="text-sm font-medium">
                            Maquinaria utilizada
                          </label>
                          <input
                            id="maquinaria-utilizada"
                            value={maquinariaUtilizada}
                            onChange={(event) => setMaquinariaUtilizada(event.target.value)}
                            placeholder="Ej. Retroexcavadora CAT 320"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="estado-hito" className="text-sm font-medium">
                            Estado del hito
                          </label>
                          <EstadoHitoSelect
                            id="estado-hito"
                            value={estadoHito}
                            onChange={setEstadoHito}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="observacion-tecnica" className="text-sm font-medium">
                            Observación técnica relevante
                          </label>
                          <textarea
                            id="observacion-tecnica"
                            value={observacionTecnica}
                            onChange={(event) => setObservacionTecnica(event.target.value)}
                            rows={3}
                            placeholder="Detalle técnico de la condición observada"
                            className={TEXTAREA_CLASS}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <div className="space-y-1.5">
                    <label htmlFor="descripcion" className="text-sm font-medium">
                      Observación general
                    </label>
                    <textarea
                      id="descripcion"
                      value={descripcion}
                      onChange={(event) => setDescripcion(event.target.value)}
                      rows={3}
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading
                      ? "Guardando..."
                      : archivos.length > 1
                        ? `Guardar ${archivos.length} fotos`
                        : "Guardar evidencia"}
                  </Button>
                </form>
              </section>
            ) : null}

            <section className="space-y-4">
              <div className="hidden md:block">
                <h3 className="text-lg font-semibold tracking-tight">Evidencias recientes</h3>
                <p className="text-sm text-muted-foreground">Ultimas imagenes registradas con su ubicacion.</p>
              </div>

              <div className="rounded-xl border-2 border-primary/25 bg-primary/5 p-4 shadow-sm ring-1 ring-primary/10">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <MapPin className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground">Selecciona un sector</p>
                    <p className="text-sm text-muted-foreground">
                      Filtra las evidencias por rubro o frente de obra del contrato.
                    </p>
                  </div>
                </div>
                <SectorSelect
                  variant="filter"
                  value={filtroSectorId}
                  onChange={setFiltroSectorId}
                />
                {!loadingRegistros ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {filtroSectorLabel
                      ? `${grupos.length} evidencia${grupos.length === 1 ? "" : "s"} (${registros.length} foto${registros.length === 1 ? "" : "s"}) en ${filtroSectorLabel}`
                      : `${grupos.length} evidencia${grupos.length === 1 ? "" : "s"} — ${registros.length} foto${registros.length === 1 ? "" : "s"} en total`}
                  </p>
                ) : null}
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="filtros-fecha" className="rounded-lg border border-foreground/10 px-3">
                  <AccordionTrigger className="py-3 text-left text-sm font-medium text-muted-foreground">
                    Mas filtros (fecha)
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="filtro-desde" className="text-xs font-medium text-muted-foreground">
                          Desde
                        </label>
                        <input
                          id="filtro-desde"
                          type="date"
                          value={filtroDesde}
                          onChange={(event) => setFiltroDesde(event.target.value)}
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="filtro-hasta" className="text-xs font-medium text-muted-foreground">
                          Hasta
                        </label>
                        <input
                          id="filtro-hasta"
                          type="date"
                          value={filtroHasta}
                          onChange={(event) => setFiltroHasta(event.target.value)}
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => void cargarRegistros()}>
                        Aplicar filtros de fecha
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFiltroDesde("")
                          setFiltroHasta("")
                        }}
                      >
                        Limpiar fechas
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {loadingRegistros ? (
                <p className="text-sm text-muted-foreground">Cargando registros...</p>
              ) : grupos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {filtroSectorLabel
                    ? `No hay evidencias en ${filtroSectorLabel}.`
                    : "No hay evidencias cargadas todavia."}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {grupos.map((grupo) => {
                    const { representante } = grupo
                    return (
                      <article
                        key={grupo.grupoId}
                        className="overflow-hidden rounded-lg border border-border bg-card"
                      >
                        <EvidenciaGaleriaCard
                          grupo={grupo}
                          isActive={activeOverlayGrupoId === grupo.grupoId}
                          onOpenGaleria={() => setSelectedGrupo(grupo)}
                          onHoverChange={(active) =>
                            setActiveOverlayGrupoId((current) =>
                              active ? grupo.grupoId : current === grupo.grupoId ? null : current
                            )
                          }
                        />
                        <div className="p-3">
                          <RegistroFotoDetalle
                            sector={representante.sector}
                            fechaCaptura={representante.fecha_captura}
                            lat={representante.lat}
                            lng={representante.lng}
                            descripcion={representante.descripcion}
                            numeroRubro={representante.numero_rubro}
                            ubicacionAbscisa={representante.ubicacion_abscisa}
                            actividadEspecifica={representante.actividad_especifica}
                            maquinariaUtilizada={representante.maquinaria_utilizada}
                            estadoHito={representante.estado_hito}
                            observacionTecnica={representante.observacion_tecnica}
                          />
                          {isResident ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingGrupo(grupo)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={deletingGrupoId === grupo.grupoId}
                                onClick={() => void handleDeleteGrupo(grupo)}
                              >
                                {deletingGrupoId === grupo.grupoId
                                  ? "Eliminando..."
                                  : grupo.imagenes.length > 1
                                    ? "Eliminar galería"
                                    : "Eliminar evidencia"}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </div>

      <EvidenciaGaleriaModal grupo={selectedGrupo} onClose={() => setSelectedGrupo(null)} />
      <EditarEvidenciaModal
        grupo={editingGrupo}
        onClose={() => setEditingGrupo(null)}
        onSaved={() => void cargarRegistros()}
      />
    </div>
  )
}
