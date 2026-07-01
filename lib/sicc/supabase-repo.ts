import type { SupabaseClient } from "@supabase/supabase-js"

import { ENTRADAS_LIBRO_DEMO } from "@/lib/sicc/demo-obra"
import { ENTRADAS_METRADO_DEMO } from "@/lib/sicc/demo-metrados"
import type { EntradaLibroObra, EntradaMetrado } from "@/lib/sicc/types"

interface MetradoRow {
  id: string
  obra_id: string
  rubro_id: number
  fecha: string
  cantidad: number
  frente: string
  observaciones: string | null
  registrado_por: string
}

interface LibroObraRow {
  id: string
  obra_id: string
  fecha: string
  clima: string
  temperatura: string | null
  personal: number
  actividades: string
  materiales: string | null
  equipos: string | null
  incidencias: string | null
  observaciones: string | null
  residente: string
}

function metradoDesdeFila(row: MetradoRow): EntradaMetrado {
  return {
    id: row.id,
    rubroId: row.rubro_id,
    fecha: row.fecha,
    cantidad: Number(row.cantidad),
    frente: row.frente,
    observaciones: row.observaciones ?? undefined,
    registradoPor: row.registrado_por,
  }
}

function libroDesdeFila(row: LibroObraRow): EntradaLibroObra {
  return {
    id: row.id,
    fecha: row.fecha,
    clima: row.clima,
    temperatura: row.temperatura ?? undefined,
    personal: row.personal,
    actividades: row.actividades,
    materiales: row.materiales ?? undefined,
    equipos: row.equipos ?? undefined,
    incidencias: row.incidencias ?? undefined,
    observaciones: row.observaciones ?? undefined,
    residente: row.residente,
  }
}

function metradoAFila(entrada: EntradaMetrado, obraId: string): MetradoRow {
  return {
    id: entrada.id,
    obra_id: obraId,
    rubro_id: entrada.rubroId,
    fecha: entrada.fecha,
    cantidad: entrada.cantidad,
    frente: entrada.frente,
    observaciones: entrada.observaciones ?? null,
    registrado_por: entrada.registradoPor,
  }
}

function libroAFila(entrada: EntradaLibroObra, obraId: string): LibroObraRow {
  return {
    id: entrada.id,
    obra_id: obraId,
    fecha: entrada.fecha,
    clima: entrada.clima,
    temperatura: entrada.temperatura ?? null,
    personal: entrada.personal,
    actividades: entrada.actividades,
    materiales: entrada.materiales ?? null,
    equipos: entrada.equipos ?? null,
    incidencias: entrada.incidencias ?? null,
    observaciones: entrada.observaciones ?? null,
    residente: entrada.residente,
  }
}

export async function cargarDatosObra(
  supabase: SupabaseClient,
  obraId: string
): Promise<{ metrados: EntradaMetrado[]; libroObra: EntradaLibroObra[] }> {
  const [metradosRes, libroRes] = await Promise.all([
    supabase
      .from("sicc_metrados")
      .select("*")
      .eq("obra_id", obraId)
      .order("fecha", { ascending: true }),
    supabase
      .from("sicc_libro_obra")
      .select("*")
      .eq("obra_id", obraId)
      .order("fecha", { ascending: true }),
  ])

  if (metradosRes.error) throw metradosRes.error
  if (libroRes.error) throw libroRes.error

  return {
    metrados: (metradosRes.data as MetradoRow[]).map(metradoDesdeFila),
    libroObra: (libroRes.data as LibroObraRow[]).map(libroDesdeFila),
  }
}

export async function sembrarDatosDemo(
  supabase: SupabaseClient,
  obraId: string
): Promise<void> {
  const metrados = ENTRADAS_METRADO_DEMO.map((m) => metradoAFila(m, obraId))
  const libro = ENTRADAS_LIBRO_DEMO.map((l) => libroAFila(l, obraId))

  const { error: metError } = await supabase.from("sicc_metrados").insert(metrados)
  if (metError) throw metError

  const { error: libError } = await supabase.from("sicc_libro_obra").insert(libro)
  if (libError) throw libError
}

export async function asegurarDatosIniciales(
  supabase: SupabaseClient,
  obraId: string
): Promise<{ metrados: EntradaMetrado[]; libroObra: EntradaLibroObra[] }> {
  const datos = await cargarDatosObra(supabase, obraId)
  if (datos.metrados.length === 0 && datos.libroObra.length === 0) {
    await sembrarDatosDemo(supabase, obraId)
    return cargarDatosObra(supabase, obraId)
  }
  return datos
}

export async function insertarMetrado(
  supabase: SupabaseClient,
  obraId: string,
  entrada: EntradaMetrado
): Promise<void> {
  const { error } = await supabase
    .from("sicc_metrados")
    .insert(metradoAFila(entrada, obraId))
  if (error) throw error
}

export async function insertarLibroObra(
  supabase: SupabaseClient,
  obraId: string,
  entrada: EntradaLibroObra
): Promise<void> {
  const { error } = await supabase
    .from("sicc_libro_obra")
    .insert(libroAFila(entrada, obraId))
  if (error) throw error
}

export async function reiniciarDatosObra(
  supabase: SupabaseClient,
  obraId: string
): Promise<{ metrados: EntradaMetrado[]; libroObra: EntradaLibroObra[] }> {
  const { error: delMet } = await supabase
    .from("sicc_metrados")
    .delete()
    .eq("obra_id", obraId)
  if (delMet) throw delMet

  const { error: delLib } = await supabase
    .from("sicc_libro_obra")
    .delete()
    .eq("obra_id", obraId)
  if (delLib) throw delLib

  await sembrarDatosDemo(supabase, obraId)
  return cargarDatosObra(supabase, obraId)
}

export function suscribirCambiosObra(
  supabase: SupabaseClient,
  obraId: string,
  onCambio: () => void
): () => void {
  const canal = supabase
    .channel(`sicc-obra-${obraId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sicc_metrados",
        filter: `obra_id=eq.${obraId}`,
      },
      () => onCambio()
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sicc_libro_obra",
        filter: `obra_id=eq.${obraId}`,
      },
      () => onCambio()
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(canal)
  }
}
