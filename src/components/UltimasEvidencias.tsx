"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { EvidenciaGaleriaCard } from "@/src/components/EvidenciaGaleriaCard"
import { EvidenciaGaleriaModal } from "@/src/components/EvidenciaGaleriaModal"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  agruparRegistrosFotograficos,
  type EvidenciaGrupo,
  type RegistroFotoBase,
} from "@/src/lib/evidencias-grupo"
import { createClient } from "@/src/lib/supabase/client"

const BUCKET_NAME = "evidencias"
const LIMITE_GRUPOS = 6

type UltimasEvidenciasProps = {
  proyectoId?: string
  limite?: number
}

export function UltimasEvidencias({ proyectoId: proyectoIdProp, limite = LIMITE_GRUPOS }: UltimasEvidenciasProps) {
  const { proyectoId: proyectoIdContexto } = useProyecto()
  const proyectoId = proyectoIdProp ?? proyectoIdContexto
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
        .eq("proyecto_id", proyectoId)
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

      setGrupos(agruparRegistrosFotograficos(signedRows).slice(0, limite))
    } catch {
      setError("No se pudieron cargar las evidencias recientes.")
    } finally {
      setLoading(false)
    }
  }, [limite, proyectoId, supabase])

  useEffect(() => {
    void cargar()
  }, [cargar])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando evidencias...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (grupos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay evidencias registradas. El residente de obra puede cargarlas en Registro fotográfico.
      </p>
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grupos.map((grupo) => (
          <EvidenciaGaleriaCard
            key={grupo.grupoId}
            grupo={grupo}
            onOpenGaleria={() => setSelectedGrupo(grupo)}
          />
        ))}
      </div>
      <div className="mt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/fotos">Ver todas las evidencias</Link>
        </Button>
      </div>
      <EvidenciaGaleriaModal grupo={selectedGrupo} onClose={() => setSelectedGrupo(null)} />
    </>
  )
}
