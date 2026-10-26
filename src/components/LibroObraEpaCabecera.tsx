import Image from "next/image"

import {
  CONSORCIO_CONTRATISTA_RAZON,
  LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH,
  LOGO_EPA_PUBLIC_PATH,
} from "@/src/data/brand/logos-proyecto"

type LibroObraEpaCabeceraProps = {
  dia: string
  mes: string
  anio: string
}

function TablaFechaCompacta({ dia, mes, anio }: LibroObraEpaCabeceraProps) {
  const th =
    "border border-neutral-900 bg-neutral-100 px-1 py-0.5 text-[8px] font-semibold uppercase leading-tight print:text-[7px] print:py-0"
  const td =
    "border border-neutral-900 px-1 py-0.5 text-[9px] leading-tight align-middle print:text-[7.5px] print:py-0 print:leading-[1.15]"

  return (
    <table className="shrink-0 border-collapse border border-neutral-900 text-center print:text-[7px]">
      <thead>
        <tr>
          <th colSpan={3} className={th}>
            Fecha
          </th>
        </tr>
        <tr>
          <th className={th}>Día</th>
          <th className={th}>Mes</th>
          <th className={th}>Año</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={`${td} w-7 text-center font-semibold`}>{dia}</td>
          <td className={`${td} w-7 text-center font-semibold`}>{mes}</td>
          <td className={`${td} w-10 text-center font-semibold`}>{anio}</td>
        </tr>
      </tbody>
    </table>
  )
}

/** Barra superior EPA + título + consorcio (pantalla e impresión). */
export function LibroObraEpaCabecera({ dia, mes, anio }: LibroObraEpaCabeceraProps) {
  return (
    <div className="flex items-start justify-between gap-1 border-b border-neutral-900 pb-0.5 print:pb-0">
      <Image
        src={LOGO_EPA_PUBLIC_PATH}
        alt="Empresa Pública del Agua"
        width={118}
        height={40}
        className="h-8 w-auto object-contain print:h-7"
        priority
      />
      <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1">
        <h2 className="text-center text-sm font-bold uppercase tracking-wide text-neutral-950 print:text-[11px]">
          Libro de obra
        </h2>
        <TablaFechaCompacta dia={dia} mes={mes} anio={anio} />
      </div>
      <Image
        src={LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH}
        alt={CONSORCIO_CONTRATISTA_RAZON}
        width={88}
        height={48}
        className="h-9 w-auto object-contain print:h-8"
        priority
      />
    </div>
  )
}
