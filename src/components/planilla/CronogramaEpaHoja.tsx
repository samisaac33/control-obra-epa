import {
  formatearNumeroCronograma,
  formatearUsdCronograma,
} from "@/src/lib/planilla-cronograma-valorado-formato"
import type { ResumenCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

import { CronogramaEpaEncabezadoTabla } from "./CronogramaEpaEncabezadoTabla"

type CronogramaEpaHojaProps = {
  datos: ResumenCronogramaEpa
  firmaContratista?: string
  className?: string
}

const cell =
  "border border-black px-0.5 py-px align-middle text-[8px] leading-tight sm:text-[9px] print:text-[7.5px]"
const head = `${cell} bg-[#d9e2f3] font-bold text-center`
const headDias = `${cell} bg-[#c6e0b4] font-bold text-center`
const headDiasSub = `${cell} bg-[#e2efda] text-center`

export function CronogramaEpaHoja({ datos, firmaContratista, className = "" }: CronogramaEpaHojaProps) {
  const { encabezado: e } = datos
  const [d1, d2] = e.etiquetasDias

  return (
    <section
      className={`cronograma-epa-hoja mx-auto w-full max-w-[1100px] bg-white text-black print:max-w-none print:break-after-page ${className}`}
    >
      <div className="p-1 print:p-0">
        <CronogramaEpaEncabezadoTabla encabezado={e} unirConTablaRubros />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse border-x border-b border-black">
            <thead>
              <tr>
                <th className={head} rowSpan={2}>
                  RUBRO
                </th>
                <th className={`${head} min-w-[180px]`} rowSpan={2}>
                  DETALLE
                </th>
                <th className={head} rowSpan={2}>
                  UNIDAD
                </th>
                <th className={head} rowSpan={2}>
                  CANT.
                </th>
                <th className={head} rowSpan={2}>
                  P. UNIT.
                </th>
                <th className={head} rowSpan={2}>
                  TOTAL
                </th>
                <th className={headDias} colSpan={2}>
                  DIAS
                </th>
              </tr>
              <tr>
                <th className={headDiasSub}>{d1}</th>
                <th className={headDiasSub}>{d2}</th>
              </tr>
            </thead>
            <tbody>
              {datos.filas.map((fila, idx) => {
                if (fila.tipo === "seccion") {
                  return (
                    <tr key={`s-${idx}`} className="bg-[#f2f2f2] font-bold">
                      <td className={cell}>{fila.rubro}</td>
                      <td className={`${cell} uppercase`} colSpan={4}>
                        {fila.titulo}
                      </td>
                      <td className={`${cell} text-right`}>
                        {formatearNumeroCronograma(fila.montoTotalSeccion)}
                      </td>
                      <td className={cell} colSpan={2} />
                    </tr>
                  )
                }
                return (
                  <tr key={`r-${idx}-${fila.rubro}`}>
                    <td className={`${cell} text-center`}>{fila.rubro}</td>
                    <td className={cell}>{fila.detalle}</td>
                    <td className={`${cell} text-center`}>{fila.unidad}</td>
                    <td className={`${cell} text-right`}>
                      {formatearNumeroCronograma(fila.cantidad)}
                    </td>
                    <td className={`${cell} text-right`}>
                      {formatearNumeroCronograma(fila.precioUnitario)}
                    </td>
                    <td className={`${cell} text-right`}>
                      {formatearNumeroCronograma(fila.total)}
                    </td>
                    <td className={`${cell} bg-[#e2efda]/60 text-right`}>
                      {fila.montosPeriodo[0] > 0
                        ? formatearNumeroCronograma(fila.montosPeriodo[0])
                        : ""}
                    </td>
                    <td className={`${cell} bg-[#e2efda]/60 text-right`}>
                      {fila.montosPeriodo[1] > 0
                        ? formatearNumeroCronograma(fila.montosPeriodo[1])
                        : ""}
                    </td>
                  </tr>
                )
              })}
              <tr className="font-bold">
                <td className={cell} colSpan={5}>
                  TOTAL
                </td>
                <td className={`${cell} text-right`}>
                  {formatearUsdCronograma(datos.montoTotalContrato)}
                </td>
                <td className={cell} colSpan={2} />
              </tr>
              <tr>
                <td className={`${cell} font-semibold`} colSpan={5}>
                  INVERSIÓN MENSUAL
                </td>
                <td className={cell} />
                <td className={`${cell} text-right`}>
                  {formatearNumeroCronograma(datos.inversionPeriodo[0])}
                </td>
                <td className={`${cell} text-right`}>
                  {formatearNumeroCronograma(datos.inversionPeriodo[1])}
                </td>
              </tr>
              <tr>
                <td className={`${cell} font-semibold`} colSpan={5}>
                  AVANCE PARCIAL %
                </td>
                <td className={cell} />
                <td className={`${cell} text-right`}>
                  {formatearNumeroCronograma(datos.avanceParcialPct[0], 2)}
                </td>
                <td className={`${cell} text-right`}>
                  {formatearNumeroCronograma(datos.avanceParcialPct[1], 2)}
                </td>
              </tr>
              <tr>
                <td className={`${cell} font-semibold`} colSpan={5}>
                  INVERSIÓN ACUMULADA
                </td>
                <td className={cell} />
                <td className={`${cell} text-right`}>
                  {formatearNumeroCronograma(datos.inversionAcumulada[0])}
                </td>
                <td className={`${cell} text-right`}>
                  {formatearNumeroCronograma(datos.inversionAcumulada[1])}
                </td>
              </tr>
              <tr>
                <td className={`${cell} font-semibold`} colSpan={5}>
                  AVANCE ACUMULADO %
                </td>
                <td className={cell} />
                <td className={`${cell} text-right`}>
                  {formatearNumeroCronograma(datos.avanceAcumuladoPct[0], 2)}
                </td>
                <td className={`${cell} text-right`}>
                  {formatearNumeroCronograma(datos.avanceAcumuladoPct[1], 2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[8px] print:text-[7px]">
          <div>
            <div className="mx-auto mb-8 max-w-[180px] border-t border-black pt-1">
              {firmaContratista ?? e.contratista}
            </div>
            <p className="font-semibold">CONTRATISTA</p>
          </div>
          <div>
            <div className="mx-auto mb-8 max-w-[180px] border-t border-black pt-1">{e.fiscalizador}</div>
            <p className="font-semibold">FISCALIZACIÓN</p>
          </div>
          <div>
            <div className="mx-auto mb-8 max-w-[180px] border-t border-black pt-1">{e.administrador}</div>
            <p className="font-semibold">ADMINISTRADOR DE CONTRATO</p>
          </div>
        </div>
      </div>
    </section>
  )
}
