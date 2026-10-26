import {
  formatearCantidadCeldaCronogramaEpa,
  formatearPctCeldaCronogramaEpa,
  formatearUsdCeldaCronogramaEpa,
} from "@/src/lib/planilla-cronograma-valorado-formato"
import type { ResumenCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

import { CronogramaEpaEncabezadoTabla } from "./CronogramaEpaEncabezadoTabla"

type CronogramaEpaHojaProps = {
  datos: ResumenCronogramaEpa
  firmaContratista?: string
  className?: string
}

const cell =
  "border border-black px-0.5 py-0.5 align-middle text-[8px] leading-tight sm:text-[9px] print:py-1 print:text-[7.5px]"
const head = `${cell} bg-[#d9e2f3] font-bold text-center`
const headDias = `${cell} bg-[#c6e0b4] font-bold text-center`
const headDiasSub = `${cell} bg-[#e2efda] text-center`

export function CronogramaEpaHoja({ datos, firmaContratista, className = "" }: CronogramaEpaHojaProps) {
  const { encabezado: e } = datos
  const tituloVertical = e.tituloVertical
  const [d1, d2] = e.etiquetasDias
  const fmtCant = (v: number) => formatearCantidadCeldaCronogramaEpa(tituloVertical, v)
  const fmtUsd = (v: number) => formatearUsdCeldaCronogramaEpa(tituloVertical, v)
  const fmtPct = (v: number) => formatearPctCeldaCronogramaEpa(v)

  return (
    <section
      className={`cronograma-epa-hoja mx-auto flex w-full max-w-[297mm] flex-col bg-white text-black shadow-sm ring-1 ring-black/10 print:max-w-none print:break-after-page print:shadow-none print:ring-0 ${className}`}
    >
      <div className="flex min-h-[210mm] flex-1 flex-col p-[8mm] print:min-h-[190mm] print:p-[8mm] sm:p-[10mm]">
        <div className="flex min-h-0 flex-1 flex-col">
          <CronogramaEpaEncabezadoTabla encabezado={e} unirConTablaRubros />

          <div className="min-h-0 flex-1 overflow-x-auto">
            <table className="h-full w-full min-w-0 border-collapse border-x border-b border-black">
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
              <tbody className="cronograma-epa-cuerpo">
                {datos.filas.map((fila, idx) => {
                  if (fila.tipo === "seccion") {
                    return (
                      <tr key={`s-${idx}`} className="bg-[#f2f2f2] font-bold">
                        <td className={cell}>{fila.rubro}</td>
                        <td className={`${cell} uppercase`} colSpan={4}>
                          {fila.titulo}
                        </td>
                        <td className={`${cell} text-right`}>{fmtUsd(fila.montoTotalSeccion)}</td>
                        <td className={cell} colSpan={2} />
                      </tr>
                    )
                  }
                  return (
                    <tr key={`r-${idx}-${fila.rubro}`}>
                      <td className={`${cell} text-center`}>{fila.rubro}</td>
                      <td className={cell}>{fila.detalle}</td>
                      <td className={`${cell} text-center`}>{fila.unidad}</td>
                      <td className={`${cell} text-right`}>{fmtCant(fila.cantidad)}</td>
                      <td className={`${cell} text-right`}>{fmtUsd(fila.precioUnitario)}</td>
                      <td className={`${cell} text-right`}>{fmtUsd(fila.total)}</td>
                      <td className={`${cell} bg-[#e2efda]/60 text-right`}>
                        {fila.montosPeriodo[0] > 0 ? fmtUsd(fila.montosPeriodo[0]) : ""}
                      </td>
                      <td className={`${cell} bg-[#e2efda]/60 text-right`}>
                        {fila.montosPeriodo[1] > 0 ? fmtUsd(fila.montosPeriodo[1]) : ""}
                      </td>
                    </tr>
                  )
                })}
                <tr className="shrink-0 font-bold">
                  <td className={cell} colSpan={5}>
                    TOTAL
                  </td>
                  <td className={`${cell} text-right`}>{fmtUsd(datos.montoTotalContrato)}</td>
                  <td className={cell} colSpan={2} />
                </tr>
                <tr className="shrink-0">
                  <td className={`${cell} font-semibold`} colSpan={5}>
                    INVERSIÓN MENSUAL
                  </td>
                  <td className={cell} />
                  <td className={`${cell} text-right`}>{fmtUsd(datos.inversionPeriodo[0])}</td>
                  <td className={`${cell} text-right`}>{fmtUsd(datos.inversionPeriodo[1])}</td>
                </tr>
                <tr className="shrink-0">
                  <td className={`${cell} font-semibold`} colSpan={5}>
                    AVANCE PARCIAL %
                  </td>
                  <td className={cell} />
                  <td className={`${cell} text-right`}>{fmtPct(datos.avanceParcialPct[0])}</td>
                  <td className={`${cell} text-right`}>{fmtPct(datos.avanceParcialPct[1])}</td>
                </tr>
                <tr className="shrink-0">
                  <td className={`${cell} font-semibold`} colSpan={5}>
                    INVERSIÓN ACUMULADA
                  </td>
                  <td className={cell} />
                  <td className={`${cell} text-right`}>{fmtUsd(datos.inversionAcumulada[0])}</td>
                  <td className={`${cell} text-right`}>{fmtUsd(datos.inversionAcumulada[1])}</td>
                </tr>
                <tr className="shrink-0">
                  <td className={`${cell} font-semibold`} colSpan={5}>
                    AVANCE ACUMULADO %
                  </td>
                  <td className={cell} />
                  <td className={`${cell} text-right`}>{fmtPct(datos.avanceAcumuladoPct[0])}</td>
                  <td className={`${cell} text-right`}>{fmtPct(datos.avanceAcumuladoPct[1])}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-auto grid shrink-0 grid-cols-3 gap-2 pt-3 text-center text-[8px] print:pt-2 print:text-[7px]">
          <div>
            <div className="mx-auto mb-6 max-w-[180px] border-t border-black pt-1 print:mb-4">
              {firmaContratista ?? e.contratista}
            </div>
            <p className="font-semibold">CONTRATISTA</p>
          </div>
          <div>
            <div className="mx-auto mb-6 max-w-[180px] border-t border-black pt-1 print:mb-4">
              {e.fiscalizador}
            </div>
            <p className="font-semibold">FISCALIZACIÓN</p>
          </div>
          <div>
            <div className="mx-auto mb-6 max-w-[180px] border-t border-black pt-1 print:mb-4">
              {e.administrador}
            </div>
            <p className="font-semibold">ADMINISTRADOR DE CONTRATO</p>
          </div>
        </div>
      </div>
    </section>
  )
}
