import Image from "next/image"

import {
  LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH,
  LOGO_EPA_PUBLIC_PATH,
} from "@/src/data/brand/logos-proyecto"
import { MEMBRETE_EPA } from "@/src/data/contrato-emergencia-severino-trasvase"
import { formatearNumeroCronograma } from "@/src/lib/planilla-cronograma-valorado-formato"
import type { EncabezadoCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

function formatearFechaContrato(iso: string): string {
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${Number(d)}/${Number(m)}/${y}`
}

const cell =
  "border border-black px-1 py-0.5 align-middle text-[7px] leading-tight sm:text-[8px] print:text-[7px]"
const label = `${cell} font-semibold whitespace-nowrap`

type Props = {
  encabezado: EncabezadoCronogramaEpa
  /** Si true, la tabla continúa pegada al cuerpo de rubros (sin borde superior duplicado). */
  unirConTablaRubros?: boolean
}

export function CronogramaEpaEncabezadoTabla({ encabezado: e, unirConTablaRubros }: Props) {
  const montoSoloNumero = formatearNumeroCronograma(e.montoContratoUsd)

  return (
    <table
      className={`w-full min-w-[640px] border-collapse ${unirConTablaRubros ? "border-x border-t border-black" : "border border-black"}`}
    >
      <tbody>
        <tr>
          <td colSpan={7} className={`${cell} py-1 text-center text-[9px] font-bold uppercase print:text-[8px]`}>
            {e.tituloVertical}
          </td>
        </tr>
        <tr>
          <td colSpan={7} className={`${cell} py-1 text-center text-[8px] font-bold uppercase leading-tight print:text-[7px]`}>
            {e.objeto}
          </td>
        </tr>
        <tr>
          <td rowSpan={4} className={`${cell} w-[72px] text-center align-middle`}>
            <Image
              src={LOGO_EPA_PUBLIC_PATH}
              alt={MEMBRETE_EPA}
              width={68}
              height={48}
              className="mx-auto h-12 w-auto object-contain"
            />
          </td>
          <td className={label}>CONTRATISTA:</td>
          <td className={cell}>{e.contratista}</td>
          <td className={label}>Monto Contrato USD:</td>
          <td className={`${cell} w-6 text-center`}>$</td>
          <td className={`${cell} text-right`}>{montoSoloNumero}</td>
          <td rowSpan={4} className={`${cell} w-[64px] text-center align-middle`}>
            <Image
              src={LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH}
              alt={e.contratista}
              width={56}
              height={56}
              className="mx-auto h-14 w-14 object-contain"
            />
          </td>
        </tr>
        <tr>
          <td className={label}>FISCALIZADOR:</td>
          <td className={cell}>{e.fiscalizador}</td>
          <td className={label}>N° de Contrato</td>
          <td className={cell} colSpan={2}>
            {e.numeroContrato}
          </td>
        </tr>
        <tr>
          <td className={label}>ADMINISTRADOR:</td>
          <td className={cell}>{e.administrador}</td>
          <td className={label}>Fecha de Inicio de contrato</td>
          <td className={cell} colSpan={2}>
            {formatearFechaContrato(e.fechaInicioContrato)}
          </td>
        </tr>
        <tr>
          <td className={label}>PLANILLA N°</td>
          <td className={cell}>{e.planillaEtiqueta ?? ""}</td>
          <td className={label}>Fecha de Finalización de contrato</td>
          <td className={cell} colSpan={2}>
            {formatearFechaContrato(e.fechaFinContrato)}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

/** Monto en celdas separadas ($ | valor) para PDF. */
export function montoContratoCeldasEpa(montoUsd: number): { simbolo: string; valor: string } {
  return { simbolo: "$", valor: formatearNumeroCronograma(montoUsd) }
}

export { formatearFechaContrato as formatearFechaContratoEpa }
