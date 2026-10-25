import Image from "next/image"

import { EvidenciaBloque } from "@/src/components/LibroObraDocumentoEvidencia"
import {
  CONSORCIO_CONTRATISTA_RAZON,
  LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH,
  LOGO_EPA_PUBLIC_PATH,
} from "@/src/data/brand/logos-proyecto"
import { PROVINCIA_LIBRO_OBRA_EPA } from "@/src/data/libro-obra-formato-epa"
import { OBJETO_CONTRATO } from "@/src/data/contrato-emergencia-severino-trasvase"
import type { ProyectoConfig } from "@/src/data/proyectos/catalog"
import { partesFechaLibroObra } from "@/src/lib/libro-obra-epa-datos"
import type { LibroObraEntradaDia } from "@/src/lib/libro-obra"

type LibroObraHojaEpaProps = {
  entrada: LibroObraEntradaDia
  proyecto: ProyectoConfig
  numeroEntrada: number
}

function Celda({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`border border-neutral-900 px-2 py-1 text-[11px] align-top ${className}`}>{children}</td>
  )
}

export function LibroObraHojaEpa({ entrada, proyecto, numeroEntrada }: LibroObraHojaEpaProps) {
  const epa = entrada.formatoEpa
  const { dia, mes, anio } = partesFechaLibroObra(entrada.fecha)
  if (!epa) return null

  return (
    <section className="libro-obra-dia libro-obra-hoja-epa mb-10 break-after-page border-2 border-neutral-900 bg-white p-4 print:mb-0 print:p-3">
      <div className="mb-2 flex items-start justify-between gap-3 border-b border-neutral-400 pb-2">
        <Image
          src={LOGO_EPA_PUBLIC_PATH}
          alt="Empresa Pública del Agua"
          width={140}
          height={48}
          className="h-12 w-auto object-contain"
        />
        <h2 className="pt-2 text-center text-lg font-bold uppercase tracking-wide text-neutral-950">
          Libro de obra
        </h2>
        <Image
          src={LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH}
          alt={CONSORCIO_CONTRATISTA_RAZON}
          width={100}
          height={56}
          className="h-14 w-auto object-contain"
        />
      </div>

      <p className="mb-1 text-[10px] font-semibold uppercase text-neutral-800">Objeto contractual</p>
      <p className="mb-2 min-h-[2.5rem] border border-neutral-400 p-1 text-[11px] leading-snug">
        {OBJETO_CONTRATO}
      </p>

      <div className="mb-2 grid grid-cols-[1fr_auto] gap-2 text-[11px]">
        <div>
          <span className="font-semibold uppercase">Provincia: </span>
          {PROVINCIA_LIBRO_OBRA_EPA}
        </div>
        <table className="border-collapse border border-neutral-900 text-center text-[10px]">
          <thead>
            <tr className="bg-neutral-100">
              <th colSpan={3} className="border border-neutral-900 px-2 py-0.5 font-semibold">
                Fecha
              </th>
            </tr>
            <tr>
              <th className="border border-neutral-900 px-2 py-0.5">Día</th>
              <th className="border border-neutral-900 px-2 py-0.5">Mes</th>
              <th className="border border-neutral-900 px-2 py-0.5">Año</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-900 px-2 py-1 font-medium">{dia}</td>
              <td className="border border-neutral-900 px-2 py-1 font-medium">{mes}</td>
              <td className="border border-neutral-900 px-2 py-1 font-medium">{anio}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="mb-2 w-full border-collapse border border-neutral-900 text-[10px]">
        <thead>
          <tr className="bg-neutral-100">
            <th colSpan={3} className="border border-neutral-900 py-0.5 font-semibold uppercase">
              Estado del tiempo
            </th>
          </tr>
          <tr>
            <th className="border border-neutral-900 px-1 py-0.5">Mañana</th>
            <th className="border border-neutral-900 px-1 py-0.5">Tarde</th>
            <th className="border border-neutral-900 px-1 py-0.5">Noche</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Celda>{epa.clima.manana || "\u00A0"}</Celda>
            <Celda>{epa.clima.tarde || "\u00A0"}</Celda>
            <Celda>{epa.clima.noche || "\u00A0"}</Celda>
          </tr>
        </tbody>
      </table>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <table className="w-full border-collapse border border-neutral-900 text-[10px]">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-900 px-1 py-0.5 text-left">Equipos utilizados</th>
              <th className="border border-neutral-900 px-1 py-0.5 w-16">Cant.</th>
            </tr>
          </thead>
          <tbody>
            {epa.equiposUtilizados.map((f) => (
              <tr key={f.etiqueta}>
                <Celda>{f.etiqueta}</Celda>
                <Celda className="text-center">{f.cantidad ?? ""}</Celda>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full border-collapse border border-neutral-900 text-[10px]">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-900 px-1 py-0.5 text-left">Personal utilizado</th>
              <th className="border border-neutral-900 px-1 py-0.5 w-16">Cant.</th>
            </tr>
          </thead>
          <tbody>
            {epa.personalUtilizado.map((f) => (
              <tr key={f.etiqueta}>
                <Celda>{f.etiqueta}</Celda>
                <Celda className="text-center">{f.cantidad ?? ""}</Celda>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mb-0.5 text-[10px] font-semibold uppercase">Visita al proyecto</p>
      <p className="mb-2 min-h-[1.25rem] border border-neutral-400 p-1 text-[11px]">{epa.visitaProyecto || "\u00A0"}</p>

      <p className="mb-0.5 text-[10px] font-semibold uppercase">Trabajos realizados</p>
      <div className="mb-2 min-h-[4rem] whitespace-pre-wrap border border-neutral-400 p-2 text-[11px] leading-snug">
        {epa.trabajosRealizados}
      </div>

      {epa.horasEquipos.length > 0 ? (
        <table className="mb-2 w-full border-collapse border border-neutral-900 text-[10px]">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-900 px-1 py-0.5 text-left">Equipos</th>
              <th className="border border-neutral-900 px-1 py-0.5">Mañana</th>
              <th className="border border-neutral-900 px-1 py-0.5">Tarde</th>
              <th className="border border-neutral-900 px-1 py-0.5">Total</th>
            </tr>
          </thead>
          <tbody>
            {epa.horasEquipos.map((f) => (
              <tr key={f.equipo}>
                <Celda>{f.equipo}</Celda>
                <Celda>{f.manana}</Celda>
                <Celda>{f.tarde}</Celda>
                <Celda>{f.total}</Celda>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <p className="mb-0.5 text-[10px] font-semibold uppercase">Novedades y observaciones</p>
      <p className="mb-2 min-h-[2rem] whitespace-pre-wrap border border-neutral-400 p-1 text-[11px]">
        {epa.novedadesObservaciones || "\u00A0"}
      </p>

      <p className="mb-0.5 text-[10px] font-semibold uppercase">
        Comunicaciones enviadas por el fiscalizador y/o contratista
      </p>
      <p className="mb-4 min-h-[2rem] border border-neutral-400 p-1 text-[11px]">{epa.comunicaciones || "\u00A0"}</p>

      {entrada.evidencias.length > 0 ? (
        <div className="mb-4 space-y-2 border-t border-neutral-300 pt-2">
          <p className="text-[10px] font-semibold uppercase">Anexo fotográfico (sistema)</p>
          {entrada.evidencias.map((grupo, index) => (
            <EvidenciaBloque key={grupo.grupoId} grupo={grupo} indice={index} />
          ))}
        </div>
      ) : (
        <p className="mb-4 text-[10px] italic text-neutral-600">
          Anexo fotográfico: pendiente (entrada {numeroEntrada} — {proyecto.numeroContrato}).
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-8 border-t border-neutral-900 pt-8 text-center text-[11px] font-semibold uppercase">
        <div>
          <div className="mb-16 border-b border-neutral-400" />
          Contratista
        </div>
        <div>
          <div className="mb-16 border-b border-neutral-400" />
          Fiscalizador
        </div>
      </div>
    </section>
  )
}
