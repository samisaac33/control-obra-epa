import Image from "next/image"

import { EvidenciaBloque } from "@/src/components/LibroObraDocumentoEvidencia"
import { LibroObraEpaBarraLogos } from "@/src/components/LibroObraEpaBarraLogos"
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
      className={`border border-neutral-900 px-1 py-0.5 text-[9px] leading-tight align-middle print:text-[7.5px] print:py-0 print:leading-[1.15] ${className}`}
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
      className={`border border-neutral-900 bg-neutral-100 px-1 py-0.5 text-[8px] font-semibold uppercase leading-tight print:text-[7px] print:py-0 ${className}`}
    >
      {children}
    </th>
  )
}

function AreaLineada({ children, minHeightClass }: { children: React.ReactNode; minHeightClass: string }) {
  return (
    <div
      className={`whitespace-pre-wrap border border-neutral-900 bg-white px-1.5 py-0.5 text-[9px] leading-[1.35] print:px-1 print:py-0 print:text-[7.5px] print:leading-[1.3] ${minHeightClass}`}
    >
      {children}
    </div>
  )
}

function TablaFechaCompacta({ dia, mes, anio }: { dia: string; mes: string; anio: string }) {
  return (
    <table className="shrink-0 border-collapse border border-neutral-900 text-center print:text-[7px]">
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
          <Celda className="w-7 text-center font-semibold">{dia}</Celda>
          <Celda className="w-7 text-center font-semibold">{mes}</Celda>
          <Celda className="w-10 text-center font-semibold">{anio}</Celda>
        </tr>
      </tbody>
    </table>
  )
}

export function LibroObraHojaEpa({ entrada, proyecto, numeroEntrada }: LibroObraHojaEpaProps) {
  const epa = entrada.formatoEpa
  const { dia, mes, anio } = partesFechaLibroObra(entrada.fecha)
  if (!epa) return null

  const comunicacionesVacias = !epa.comunicaciones?.trim()

  return (
    <section className="libro-obra-dia libro-obra-hoja-epa mb-8 break-after-page bg-white print:mb-0">
      <div className="libro-obra-epa-cabecera mb-0.5 border-b border-neutral-900 pb-0.5">
        <LibroObraEpaBarraLogos
          centro={<TablaFechaCompacta dia={dia} mes={mes} anio={anio} />}
        />
      </div>

      <p className="mb-0 text-[7px] font-bold uppercase text-neutral-900 print:text-[6.5px]">
        Objeto contractual
      </p>
      <p className="mb-0.5 border border-neutral-900 px-1 py-0.5 text-[8px] leading-snug print:text-[7px] print:leading-[1.15]">
        {OBJETO_CONTRATO}
      </p>

      <p className="mb-0.5 text-[8px] print:text-[7px]">
        <span className="font-bold uppercase">Provincia: </span>
        {PROVINCIA_LIBRO_OBRA_EPA}
      </p>

      <table className="mb-0.5 w-full border-collapse border border-neutral-900">
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

      <div className="mb-0.5 grid grid-cols-2 gap-1">
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
      <AreaLineada minHeightClass="mb-0.5 min-h-[1rem] print:min-h-0">
        {epa.visitaProyecto || "\u00A0"}
      </AreaLineada>

      <p className="mb-0 text-[7px] font-bold uppercase print:text-[6.5px]">Trabajos realizados</p>
      {epa.bloquesFrente && epa.bloquesFrente.length > 0 ? (
        <div className="mb-0.5 space-y-1 print:space-y-0.5">
          {epa.bloquesFrente.map((bloque) => (
            <div key={bloque.id}>
              <p className="text-[7px] font-bold text-neutral-800 print:text-[6.5px]">
                {bloque.titulo} — {bloque.residente}
              </p>
              <AreaLineada minHeightClass="min-h-[1.5rem] print:min-h-0">
                {bloque.trabajosRealizados}
              </AreaLineada>
            </div>
          ))}
          {epa.bloqueSeverino ? (
            <div>
              <p className="text-[7px] font-bold text-neutral-800 print:text-[6.5px]">
                {epa.bloqueSeverino.titulo} — {epa.bloqueSeverino.residente}
              </p>
              <AreaLineada minHeightClass="min-h-[1.25rem] print:min-h-0">
                {epa.bloqueSeverino.trabajosRealizados}
              </AreaLineada>
            </div>
          ) : null}
          {epa.registroCampoDia?.trim() ? (
            <div>
              <p className="text-[7px] font-bold text-neutral-800 print:text-[6.5px]">
                Registro de campo (maquinaria / desalojo)
              </p>
              <AreaLineada minHeightClass="min-h-[1rem] print:min-h-0">
                {epa.registroCampoDia}
              </AreaLineada>
            </div>
          ) : null}
        </div>
      ) : (
        <AreaLineada minHeightClass="mb-0.5 min-h-[3rem] print:min-h-0">
          {epa.trabajosRealizados}
        </AreaLineada>
      )}

      <table className="libro-obra-epa-tabla-horas mb-0.5 w-full border-collapse border border-neutral-900">
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
      <AreaLineada minHeightClass="mb-0.5 min-h-[1.25rem] print:min-h-0">
        {epa.novedadesObservaciones || "\u00A0"}
      </AreaLineada>

      <div className={comunicacionesVacias ? "print:hidden" : undefined}>
        <p className="mb-0 text-[7px] font-bold uppercase print:text-[6.5px]">
          Comunicaciones enviadas por el fiscalizador y/o contratista
        </p>
        <AreaLineada minHeightClass="mb-0.5 min-h-[1.25rem] print:min-h-0">
          {epa.comunicaciones || "\u00A0"}
        </AreaLineada>
      </div>

      {entrada.evidencias.length > 0 ? (
        <div className="libro-obra-epa-anexo mb-2 space-y-2 border-t border-neutral-400 pt-2 print:break-before-page">
          <p className="text-[7px] font-bold uppercase">Anexo fotográfico (sistema)</p>
          {entrada.evidencias.map((grupo, index) => (
            <EvidenciaBloque key={grupo.grupoId} grupo={grupo} indice={index} />
          ))}
        </div>
      ) : (
        <p className="libro-obra-epa-anexo-nota mb-0 text-[7px] italic text-neutral-600 print:hidden">
          Anexo fotográfico: pendiente (entrada {numeroEntrada} — {proyecto.numeroContrato}). Las fotos se
          agregan solas al cargarlas en módulo Fotos.
        </p>
      )}

      <div className="libro-obra-epa-firmas mt-4 grid grid-cols-2 gap-6 border-t border-neutral-900 pt-4 text-center text-[9px] font-bold uppercase print:mt-6 print:gap-8 print:pt-5 print:text-[7.5px]">
        <div className="flex min-h-[22mm] flex-col justify-end print:min-h-[26mm]">
          <div className="mb-2 min-h-[14mm] border-b border-neutral-900 print:min-h-[18mm]" />
          Contratista
        </div>
        <div className="flex min-h-[22mm] flex-col justify-end print:min-h-[26mm]">
          <div className="mb-2 min-h-[14mm] border-b border-neutral-900 print:min-h-[18mm]" />
          Fiscalizador
        </div>
      </div>
    </section>
  )
}
