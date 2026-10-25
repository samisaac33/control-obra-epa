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

function Celda({
  children,
  className = "",
  colSpan,
}: {
  children: React.ReactNode
  className?: string
  colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      className={`border border-neutral-900 px-1 py-0.5 text-[9px] leading-tight align-middle print:text-[8px] print:py-0 ${className}`}
    >
      {children}
    </td>
  )
}

function CeldaEncabezado({
  children,
  className = "",
  colSpan,
}: {
  children: React.ReactNode
  className?: string
  colSpan?: number
}) {
  return (
    <th
      colSpan={colSpan}
      className={`border border-neutral-900 bg-neutral-100 px-1 py-0.5 text-[8px] font-semibold uppercase leading-tight print:text-[7px] ${className}`}
    >
      {children}
    </th>
  )
}

function AreaLineada({ children, minHeightClass }: { children: React.ReactNode; minHeightClass: string }) {
  return (
    <div
      className={`libro-obra-epa-lineado whitespace-pre-wrap border border-neutral-900 px-1.5 py-1 text-[9px] leading-[1.35] print:text-[8px] print:leading-[1.25] ${minHeightClass}`}
    >
      {children}
    </div>
  )
}

export function LibroObraHojaEpa({ entrada, proyecto, numeroEntrada }: LibroObraHojaEpaProps) {
  const epa = entrada.formatoEpa
  const { dia, mes, anio } = partesFechaLibroObra(entrada.fecha)
  if (!epa) return null

  return (
    <section className="libro-obra-dia libro-obra-hoja-epa mb-8 break-after-page bg-white print:mb-0">
      <div className="mb-1 flex items-start justify-between gap-2 border-b border-neutral-900 pb-1">
        <Image
          src={LOGO_EPA_PUBLIC_PATH}
          alt="Empresa Pública del Agua"
          width={118}
          height={40}
          className="h-9 w-auto object-contain print:h-8"
        />
        <h2 className="pt-1 text-center text-sm font-bold uppercase tracking-wide text-neutral-950 print:text-xs">
          Libro de obra
        </h2>
        <Image
          src={LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH}
          alt={CONSORCIO_CONTRATISTA_RAZON}
          width={88}
          height={48}
          className="h-10 w-auto object-contain print:h-9"
        />
      </div>

      <p className="mb-0 text-[7px] font-bold uppercase text-neutral-900 print:text-[6.5px]">
        Objeto contractual
      </p>
      <p className="mb-1 border border-neutral-900 px-1 py-0.5 text-[8px] leading-snug print:text-[7.5px]">
        {OBJETO_CONTRATO}
      </p>

      <div className="mb-1 grid grid-cols-[1fr_auto] items-start gap-1">
        <p className="text-[8px] print:text-[7.5px]">
          <span className="font-bold uppercase">Provincia: </span>
          {PROVINCIA_LIBRO_OBRA_EPA}
        </p>
        <table className="border-collapse border border-neutral-900 text-center">
          <thead>
            <tr>
              <CeldaEncabezado colSpan={3}>Fecha</CeldaEncabezado>
            </tr>
            <tr>
              <CeldaEncabezado>Día</CeldaEncabezado>
              <CeldaEncabezado>Mes</CeldaEncabezado>
              <CeldaEncabezado>Año</CeldaEncabezado>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Celda className="text-center font-semibold">{dia}</Celda>
              <Celda className="text-center font-semibold">{mes}</Celda>
              <Celda className="text-center font-semibold">{anio}</Celda>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="mb-1 w-full border-collapse border border-neutral-900">
        <thead>
          <tr>
            <CeldaEncabezado colSpan={3}>Estado del tiempo</CeldaEncabezado>
          </tr>
          <tr>
            <CeldaEncabezado>Mañana</CeldaEncabezado>
            <CeldaEncabezado>Tarde</CeldaEncabezado>
            <CeldaEncabezado>Noche</CeldaEncabezado>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Celda className="text-center">{epa.clima.manana || "\u00A0"}</Celda>
            <Celda className="text-center">{epa.clima.tarde || "\u00A0"}</Celda>
            <Celda className="text-center">{epa.clima.noche || "\u00A0"}</Celda>
          </tr>
        </tbody>
      </table>

      <div className="mb-1 grid grid-cols-2 gap-1">
        <table className="w-full border-collapse border border-neutral-900">
          <thead>
            <tr>
              <CeldaEncabezado className="text-left normal-case">Equipos utilizados</CeldaEncabezado>
              <CeldaEncabezado className="w-10">Cant.</CeldaEncabezado>
            </tr>
          </thead>
          <tbody>
            {epa.equiposUtilizados.map((f) => (
              <tr key={f.etiqueta}>
                <Celda>{f.etiqueta}</Celda>
                <Celda className="text-center font-medium">{f.cantidad ?? ""}</Celda>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full border-collapse border border-neutral-900">
          <thead>
            <tr>
              <CeldaEncabezado className="text-left normal-case">Personal utilizado</CeldaEncabezado>
              <CeldaEncabezado className="w-10">Cant.</CeldaEncabezado>
            </tr>
          </thead>
          <tbody>
            {epa.personalUtilizado.map((f) => (
              <tr key={f.etiqueta}>
                <Celda>{f.etiqueta}</Celda>
                <Celda className="text-center font-medium">{f.cantidad ?? ""}</Celda>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mb-0 text-[7px] font-bold uppercase print:text-[6.5px]">Visita al proyecto</p>
      <AreaLineada minHeightClass="mb-1 min-h-[1.1rem]">
        {epa.visitaProyecto || "\u00A0"}
      </AreaLineada>

      <p className="mb-0 text-[7px] font-bold uppercase print:text-[6.5px]">Trabajos realizados</p>
      <AreaLineada minHeightClass="mb-1 min-h-[5.5rem] print:min-h-[4.75rem]">
        {epa.trabajosRealizados}
      </AreaLineada>

      <table className="mb-1 w-full border-collapse border border-neutral-900">
        <thead>
          <tr>
            <CeldaEncabezado className="text-left normal-case">Equipos</CeldaEncabezado>
            <CeldaEncabezado>Mañana</CeldaEncabezado>
            <CeldaEncabezado>Tarde</CeldaEncabezado>
            <CeldaEncabezado>Total</CeldaEncabezado>
          </tr>
        </thead>
        <tbody>
          {epa.horasEquipos.length > 0 ? (
            epa.horasEquipos.map((f) => (
              <tr key={f.equipo}>
                <Celda>{f.equipo}</Celda>
                <Celda className="text-center">{f.manana}</Celda>
                <Celda className="text-center">{f.tarde}</Celda>
                <Celda className="text-center">{f.total}</Celda>
              </tr>
            ))
          ) : (
            <tr>
              <Celda colSpan={4} className="text-center text-neutral-500">
                Sin equipos registrados este día
              </Celda>
            </tr>
          )}
        </tbody>
      </table>

      <p className="mb-0 text-[7px] font-bold uppercase print:text-[6.5px]">Novedades y observaciones</p>
      <AreaLineada minHeightClass="mb-1 min-h-[2rem] print:min-h-[1.75rem]">
        {epa.novedadesObservaciones || "\u00A0"}
      </AreaLineada>

      <p className="mb-0 text-[7px] font-bold uppercase print:text-[6.5px]">
        Comunicaciones enviadas por el fiscalizador y/o contratista
      </p>
      <AreaLineada minHeightClass="mb-2 min-h-[2rem] print:min-h-[1.75rem]">
        {epa.comunicaciones || "\u00A0"}
      </AreaLineada>

      {entrada.evidencias.length > 0 ? (
        <div className="libro-obra-epa-anexo mb-2 space-y-2 border-t border-neutral-400 pt-2 print:break-before-page">
          <p className="text-[7px] font-bold uppercase">Anexo fotográfico (sistema)</p>
          {entrada.evidencias.map((grupo, index) => (
            <EvidenciaBloque key={grupo.grupoId} grupo={grupo} indice={index} />
          ))}
        </div>
      ) : (
        <p className="libro-obra-epa-anexo-nota mb-2 text-[7px] italic text-neutral-600 print:hidden">
          Anexo fotográfico: pendiente (entrada {numeroEntrada} — {proyecto.numeroContrato}). Las fotos se
          agregan solas al cargarlas en módulo Fotos.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-6 border-t border-neutral-900 pt-6 text-center text-[9px] font-bold uppercase print:mt-3 print:pt-4 print:text-[8px]">
        <div>
          <div className="mb-10 border-b border-neutral-900 print:mb-8" />
          Contratista
        </div>
        <div>
          <div className="mb-10 border-b border-neutral-900 print:mb-8" />
          Fiscalizador
        </div>
      </div>
    </section>
  )
}
