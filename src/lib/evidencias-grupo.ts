export type RegistroFotoBase = {
  id: string
  created_at: string
  fecha_captura: string
  lat: number | null
  lng: number | null
  sector: string
  descripcion: string | null
  numero_rubro: string | null
  ubicacion_abscisa: string | null
  actividad_especifica: string | null
  maquinaria_utilizada: string | null
  estado_hito: string | null
  observacion_tecnica: string | null
  grupo_id: string | null
  image_path: string
  image_url?: string
}

export type EvidenciaGrupo = {
  grupoId: string
  representante: RegistroFotoBase
  imagenes: RegistroFotoBase[]
}

function grupoKey(registro: RegistroFotoBase): string {
  return registro.grupo_id ?? registro.id
}

export function agruparRegistrosFotograficos(registros: RegistroFotoBase[]): EvidenciaGrupo[] {
  const map = new Map<string, RegistroFotoBase[]>()

  for (const registro of registros) {
    const key = grupoKey(registro)
    const actual = map.get(key)
    if (actual) {
      actual.push(registro)
    } else {
      map.set(key, [registro])
    }
  }

  return Array.from(map.entries())
    .map(([grupoId, imagenes]) => {
      const ordenadas = [...imagenes].sort(
        (a, b) => new Date(b.fecha_captura).getTime() - new Date(a.fecha_captura).getTime()
      )
      return {
        grupoId,
        representante: ordenadas[0],
        imagenes: ordenadas,
      }
    })
    .sort(
      (a, b) =>
        new Date(b.representante.fecha_captura).getTime() -
        new Date(a.representante.fecha_captura).getTime()
    )
}
