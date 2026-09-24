import * as exifr from "exifr"
import type { SupabaseClient } from "@supabase/supabase-js"

import { compressImage } from "@/src/lib/compress-image"

const BUCKET_NAME = "evidencias"

export type ExifGpsResult = {
  lat: number | null
  lng: number | null
  fecha: Date | null
}

export async function leerExifGps(file: File): Promise<ExifGpsResult> {
  try {
    const exif = await exifr.parse(file, { gps: true })
    const latitude = typeof exif?.latitude === "number" ? exif.latitude : null
    const longitude = typeof exif?.longitude === "number" ? exif.longitude : null
    const dateTimeOriginal = exif?.DateTimeOriginal
    const fecha =
      dateTimeOriginal instanceof Date && !Number.isNaN(dateTimeOriginal.getTime())
        ? dateTimeOriginal
        : null
    return { lat: latitude, lng: longitude, fecha }
  } catch {
    return { lat: null, lng: null, fecha: null }
  }
}

export type SubirEvidenciaTramoInput = {
  supabase: SupabaseClient
  userId: string
  proyectoId: string
  tramoId: string
  archivo: File
  sector: string
  fechaCaptura: string
  lat: number | null
  lng: number | null
  descripcion?: string | null
  grupoId?: string
}

export type SubirEvidenciaTramoResult = {
  registroId: string
  imagePath: string
}

export async function subirEvidenciaTramo(
  input: SubirEvidenciaTramoInput
): Promise<SubirEvidenciaTramoResult> {
  const archivoComprimido = await compressImage(input.archivo)
  const fileName = `${Date.now()}-${archivoComprimido.name.replace(/\s+/g, "-").toLowerCase()}`
  const imagePath = `${input.userId}/${fileName}`

  const { error: uploadError } = await input.supabase.storage
    .from(BUCKET_NAME)
    .upload(imagePath, archivoComprimido, { upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  const { data: inserted, error: insertError } = await input.supabase
    .from("registros_fotograficos")
    .insert({
      created_by: input.userId,
      proyecto_id: input.proyectoId,
      tramo_id: input.tramoId,
      fecha_captura: input.fechaCaptura,
      lat: input.lat,
      lng: input.lng,
      sector: input.sector,
      descripcion: input.descripcion ?? null,
      grupo_id: input.grupoId ?? crypto.randomUUID(),
      image_path: imagePath,
    })
    .select("id")
    .single()

  if (insertError) {
    await input.supabase.storage.from(BUCKET_NAME).remove([imagePath])
    throw new Error(insertError.message)
  }

  return {
    registroId: String(inserted.id),
    imagePath,
  }
}
