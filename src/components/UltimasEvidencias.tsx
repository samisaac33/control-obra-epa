"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { EvidenciaGaleriaCard } from "@/src/components/EvidenciaGaleriaCard"
import { EvidenciaGaleriaModal } from "@/src/components/EvidenciaGaleriaModal"
import {
  agruparRegistrosFotograficos,
  type EvidenciaGrupo,
  type RegistroFotoBase,
} from "@/src/lib/evidencias-grupo"
import { createClient } from "@/src/lib/supabase/client"

const BUCKET_NAME = "evidencias"
const LIMITE_GRUPOS = 6

export function UltimasEvidencias() {
  const supabase = useMemo(() => createClient(), [])
  const [grupos, setGrupos] = useState<EvidenciaGrupo[]>([])
  const [selectedGrupo, setSelectedGrupo] = useState<EvidenciaGrupo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from("registros_fotograficos")
        .select(
          "id, sector, fecha_captura, lat, lng, descripcion, numero_rubro, ubicacion_abscisa, actividad_especifica, maquinaria_utilizada, estado_hito, observacion_tecnica, grupo_id, image_path, created_at"
        )
        .order("fecha_captura", { ascending: false })
        .limit(40)

      if (queryError) {
        setError(queryError.message)
        return
      }

      const signedRows = await Promise.all(
        (data ?? []).map(async (row) => {
          const { data: signedData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(row.image_path, 60 * 60)
          return { ...row, image_url: signedData?.signedUrl } as RegistroFotoBase
        })
      )

      setGrupos(agruparRegistrosFotograficos(signedRows).slice(0, LIMITE_GRUPOS))
    } catch {
      setError("No se pudieron cargar las evidencias recientes.")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void cargar()
    })
    return () => cancelAnimationFrame(frame)
  }, [cargar])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando evidencias recientes...</p>
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error}</p>
  }

  if (grupos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay evidencias registradas. El residente de obra puede cargarlas en Registro fotográfico.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grupos.map((grupo) => (
          <article
            key={grupo.grupoId}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <EvidenciaGaleriaCard grupo={grupo} onOpenGaleria={() => setSelectedGrupo(grupo)} />
            <div className="space-y-0.5 p-3 text-sm">
              <p className="font-medium text-foreground">{grupo.representante.sector}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(grupo.representante.fecha_captura).toLocaleString("es-EC", {
                  timeZone: "America/Guayaquil",
                })}
                {grupo.imagenes.length > 1 ? ` — ${grupo.imagenes.length} fotos` : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/fotos">Ver todas las evidencias</Link>
      </Button>
      <EvidenciaGaleriaModal grupo={selectedGrupo} onClose={() => setSelectedGrupo(null)} />
    </div>
  )
}
