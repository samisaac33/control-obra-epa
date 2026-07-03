import type { SupabaseClient } from "@supabase/supabase-js"

import type { RegistroFotoBase } from "@/src/lib/evidencias-grupo"

const BUCKET_NAME = "evidencias"
const CAMPOS_REGISTRO =
  "id, created_at, fecha_captura, lat, lng, sector, descripcion, numero_rubro, ubicacion_abscisa, actividad_especifica, maquinaria_utilizada, estado_hito, observacion_tecnica, grupo_id, image_path"

export async function cargarEvidenciasLibroObra(
  supabase: SupabaseClient
): Promise<RegistroFotoBase[]> {
  const { data, error } = await supabase
    .from("registros_fotograficos")
    .select(CAMPOS_REGISTRO)
    .order("fecha_captura", { ascending: true })
    .limit(500)

  if (error) {
    throw new Error(error.message)
  }

  const filas = data ?? []

  return Promise.all(
    filas.map(async (row) => {
      const { data: signedData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(row.image_path, 60 * 60)

      return {
        ...row,
        image_url: signedData?.signedUrl,
      } satisfies RegistroFotoBase
    })
  )
}
