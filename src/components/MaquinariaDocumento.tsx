import { MaquinariaDocumentoEncabezado } from "@/src/components/MaquinariaDocumentoEncabezado"
import { ACCIONISTA_META, type Accionista, type RegistroDia } from "@/src/data/registro-maquinaria"
import type { RangoMaquinaria, TipoReporteMaquinaria } from "@/src/lib/maquinaria-filtro"
import {
  agruparSemanasCalendario,
  agruparSemanasEnPaginasImpresion,
  construirMatrizCalendario,
  filtrarFilasActivasEnBloque,
  partesEtiquetaFilaPdf,
  tituloColumnaPdf,
  type CeldaMatriz,
  type ColumnaMatriz,
  type FilaMatriz,
  type MatrizCalendario,
  type SemanaMatriz,
} from "@/src/lib/maquinaria-matriz"
import {
  formatearNumero,
  kpisMaquinaria,
  kpisMaquinas,
  resumenAccionistaEtiqueta,
  resumenFrenteEtiqueta,
  resumenMaquinasConsolidado,
  resumenMaquinasPorFrente,
  resumenPorEquipo,
  type ResumenEquipoFila,
} from "@/src/lib/maquinaria-resumen"

type MaquinariaDocumentoProps = {
  dias: RegistroDia[]
  rango: RangoMaquinaria
  rangoEtiqueta: string
  generadoEn: string
  tipoReporte?: TipoReporteMaquinaria
}

function TablaResumenMaquinas({
  filas,
  mostrarFrente,
}: {
  filas: ResumenEquipoFila[]
  mostrarFrente: boolean
}) {
  return (
    <table className="w-full border-collapse text-[9px]">
      <thead>
        <tr className="bg-neutral-100">
          <th className="border border-neutral-300 px-1 py-0.5 text-left font-semibold">Equipo</th>
          {mostrarFrente ? (
            <th className="border border-neutral-300 px-1 py-0.5 text-left font-semibold">Frente</th>
          ) : null}
          <th className="border border-neutral-300 px-1 py-0.5 text-left font-semibold">Acc.</th>
          <th className="border border-neutral-300 px-1 py-0.5 text-right font-semibold">Compl.</th>
          <th className="border border-neutral-300 px-1 py-0.5 text-right font-semibold">Med.</th>
          <th className="border border-neutral-300 px-1 py-0.5 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={`${fila.equipo}-${fila.accionista}-${fila.frente ?? ""}`}>
            <td className="border border-neutral-300 px-1 py-0.5">{fila.equipo}</td>
            {mostrarFrente ? (
              <td className="border border-neutral-300 px-1 py-0.5">
                {resumenFrenteEtiqueta(fila.frente)}
              </td>
            ) : null}
            <td className="border border-neutral-300 px-1 py-0.5">
              {resumenAccionistaEtiqueta(fila.accionista)}
            </td>
            <td className="border border-neutral-300 px-1 py-0.5 text-right font-mono">
              {fila.diasCompletos || "—"}
            </td>
            <td className="border border-neutral-300 px-1 py-0.5 text-right font-mono">
              {fila.mediosDias || "—"}
            </td>
            <td className="border border-neutral-300 px-1 py-0.5 text-right font-mono font-semibold">
              {fila.totalDiaEquipo > 0 ? formatearNumero(fila.totalDiaEquipo) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function claveCelda(filaId: string, fecha: string): string {
  return `${filaId}::${fecha}`
}

function simboloCelda(celda: CeldaMatriz | undefined): string {
  if (!celda || celda.intensidad <= 0) return ""

  switch (celda.duracion) {
    case "viajes":
      return String(celda.cantidad)
    case "actividad":
      return "◆"
    case "medio_dia":
      return "◐"
    case "hora":
      return "·"
    case "dia_completo":
    default:
      return "●"
  }
}

function claseCeldaAccionista(accionista: Accionista, celda: CeldaMatriz | undefined): string {
  if (!celda || celda.intensidad <= 0) return "bg-neutral-100 text-neutral-400"

  const meta = ACCIONISTA_META[accionista]
  if (celda.duracion === "viajes" || celda.duracion === "actividad") {
    return `${meta.celdaPlena} text-white`
  }
  if (celda.intensidad >= 1) return `${meta.celdaPlena} text-white`
  if (celda.intensidad >= 0.5) return `${meta.celdaMedia} text-white`
  return `${meta.celdaBaja} text-neutral-900`
}

function EtiquetaFilaPdf({ fila }: { fila: FilaMatriz }) {
  const { equipo, frente, accionista } = partesEtiquetaFilaPdf(fila)

  if (!frente) {
    return (
      <span>
        {equipo} · {accionista}
      </span>
    )
  }

  return (
    <span>
      {equipo} · <strong>{frente}</strong> · {accionista}
    </span>
  )
}

function CeldaMatrizImpresa({
  fila,
  columna,
  celda,
}: {
  fila: FilaMatriz
  columna: ColumnaMatriz
  celda: CeldaMatriz | undefined
}) {
  if (columna.trabajado === false) {
    return (
      <td className="col-dia border border-neutral-300 p-1 text-center">
        <div className="maquinaria-celda-sin-obra mx-auto h-6 w-6 bg-[repeating-linear-gradient(-45deg,transparent,transparent_2px,oklch(0.82_0_0)_2px,oklch(0.82_0_0)_4px)]" />
      </td>
    )
  }

  if (columna.sinRegistro) {
    return (
      <td className="col-dia border border-neutral-300 bg-neutral-50 p-1 text-center text-[10px] text-neutral-300">
        —
      </td>
    )
  }

  const simbolo = simboloCelda(celda)
  const colorClass = claseCeldaAccionista(fila.accionista, celda)

  return (
    <td className="col-dia border border-neutral-300 p-1 text-center">
      <div
        className={`maquinaria-celda mx-auto flex h-6 w-6 items-center justify-center rounded-sm text-[10px] font-semibold leading-none ${colorClass}`}
      >
        {simbolo}
      </div>
    </td>
  )
}

function LeyendaMatrizImpresa() {
  return (
    <div className="mt-3 space-y-2 text-[10px] text-neutral-600">
      <p>
        Leyenda: ● día completo · ◐ medio día · número = viajes · ◆ actividad · rayado = sin obra · el frente
        en negrita indica ubicación (Ciénega / Poza Honda / Pechiche / Las Peñas)
      </p>
      <div className="flex flex-wrap gap-3">
        <span className="maquinaria-accionista-chip inline-flex items-center gap-1 rounded border border-blue-600/40 bg-blue-50 px-1.5 py-0.5 font-medium text-blue-950">
          <span className="size-1.5 rounded-full bg-blue-600" aria-hidden />
          {ACCIONISTA_META.consorcio.label}
        </span>
        <span className="maquinaria-accionista-chip inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-50 px-1.5 py-0.5 font-medium text-amber-950">
          <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
          {ACCIONISTA_META.mauricio.label}
        </span>
      </div>
    </div>
  )
}

function TablaSemanaImpresa({
  semana,
  matriz,
  filasActivas,
}: {
  semana: SemanaMatriz
  matriz: MatrizCalendario
  filasActivas: FilaMatriz[]
}) {
  return (
    <div className="maquinaria-matriz-semana">
      <h3 className="mb-2 text-sm font-semibold text-neutral-800">
        Semana {semana.indice + 1} — {semana.etiqueta}
      </h3>
      <div className="overflow-hidden rounded border border-neutral-300">
        <table className="maquinaria-matriz-tabla w-full table-fixed border-collapse text-[11px]">
          <thead>
            <tr className="bg-neutral-100">
              <th className="col-equipo border border-neutral-300 px-2 py-1 text-left font-semibold text-neutral-800">
                Equipo
              </th>
              {semana.columnas.map((columna, index) => {
                const titulo = tituloColumnaPdf(columna, semana.columnas[index - 1])
                return (
                  <th
                    key={columna.fecha}
                    className="col-dia border border-neutral-300 px-1 py-1 text-center font-medium text-neutral-700"
                    title={columna.fecha}
                  >
                    <div className="text-sm font-semibold">{titulo.dia}</div>
                    {titulo.mes ? (
                      <div className="text-[9px] font-normal capitalize text-neutral-500">{titulo.mes}</div>
                    ) : null}
                    <div className="text-[9px] font-normal capitalize text-neutral-500">{titulo.diaSemana}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {filasActivas.map((fila, index) => (
              <tr key={fila.id} className={index % 2 === 1 ? "bg-neutral-50" : undefined}>
                <td className="col-equipo border border-neutral-300 px-2 py-1 text-left text-neutral-800">
                  <EtiquetaFilaPdf fila={fila} />
                </td>
                {semana.columnas.map((columna) => (
                  <CeldaMatrizImpresa
                    key={`${fila.id}-${columna.fecha}`}
                    fila={fila}
                    columna={columna}
                    celda={matriz.celdas.get(claveCelda(fila.id, columna.fecha))}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MatrizSemanalImpresa({
  dias,
  rango,
}: {
  dias: RegistroDia[]
  rango: RangoMaquinaria
}) {
  const matriz = construirMatrizCalendario(dias, rango)
  const semanasConActividad = agruparSemanasCalendario(matriz.columnas)
    .map((semana) => ({
      semana,
      filasActivas: filtrarFilasActivasEnBloque(matriz.filas, semana.columnas, matriz.celdas),
    }))
    .filter((item) => item.filasActivas.length > 0)

  const paginas = agruparSemanasEnPaginasImpresion(semanasConActividad.map((item) => item.semana))

  return (
    <div className="space-y-5">
      {paginas.map((pagina) => {
        const esTriple = pagina.semanas.length === 3

        return (
          <section
            key={pagina.indice}
            className={`maquinaria-matriz-pagina maquinaria-matriz-landscape break-before-page print:break-before-page ${esTriple ? "maquinaria-matriz-pagina-triple" : ""}`}
          >
            {pagina.semanas.map((semana) => {
              const item = semanasConActividad.find((entry) => entry.semana.indice === semana.indice)
              if (!item) return null

              return (
                <TablaSemanaImpresa
                  key={semana.indice}
                  semana={semana}
                  matriz={matriz}
                  filasActivas={item.filasActivas}
                />
              )
            })}
          </section>
        )
      })}
      <LeyendaMatrizImpresa />
    </div>
  )
}

export function MaquinariaDocumento({
  dias,
  rango,
  rangoEtiqueta,
  generadoEn,
  tipoReporte = "operativo",
}: MaquinariaDocumentoProps) {
  const esHorasMaquinas = tipoReporte === "horas_maquinas"
  const kpis = kpisMaquinaria(dias)
  const kpisHoras = kpisMaquinas(dias)
  const filasResumen = resumenPorEquipo(dias)
  const filasPorFrente = resumenMaquinasPorFrente(dias)
  const filasConsolidado = resumenMaquinasConsolidado(dias)

  return (
    <div
      id="maquinaria-documento"
      className="maquinaria-documento-compacto mx-auto max-w-[210mm] bg-white px-6 py-8 text-neutral-950 shadow-sm ring-1 ring-neutral-200 print:mx-0 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0"
    >
      <MaquinariaDocumentoEncabezado
        subtitulo={
          esHorasMaquinas
            ? "Reporte de horas de máquinas"
            : "Registro operativo de maquinaria y transporte"
        }
        rangoEtiqueta={rangoEtiqueta}
        generadoEn={generadoEn}
      />

      {esHorasMaquinas ? (
        <section className="mb-4 print:mb-3">
          <h2 className="mb-2 border-b border-neutral-300 pb-0.5 text-sm font-bold text-neutral-950">
            Resumen del período
          </h2>
          <dl className="mb-3 grid grid-cols-3 gap-1.5 text-xs">
            <div className="rounded border border-neutral-300 px-2 py-1.5">
              <dt className="text-[10px] text-neutral-600">Días con máquinas</dt>
              <dd className="text-base font-semibold">{kpisHoras.diasConActividadMaquina}</dd>
            </div>
            <div className="rounded border border-neutral-300 px-2 py-1.5">
              <dt className="text-[10px] text-neutral-600">Registros de máquina</dt>
              <dd className="text-base font-semibold">{kpisHoras.registrosMaquina}</dd>
            </div>
            <div className="rounded border border-neutral-300 px-2 py-1.5">
              <dt className="text-[10px] text-neutral-600">Total días-equipo</dt>
              <dd className="text-base font-semibold">
                {formatearNumero(kpisHoras.totalDiasEquipoMaquinas)}
              </dd>
            </div>
          </dl>

          <div className="mb-4">
            <h3 className="mb-1 text-xs font-semibold text-neutral-800">
              Detalle por frente — por equipo, frente y accionista
            </h3>
            <TablaResumenMaquinas filas={filasPorFrente} mostrarFrente />
          </div>

          <div>
            <h3 className="mb-1 text-xs font-semibold text-neutral-800">
              Resumen consolidado — por equipo y accionista
            </h3>
            <TablaResumenMaquinas filas={filasConsolidado} mostrarFrente={false} />
          </div>
        </section>
      ) : (
        <>
          <section className="mb-4 print:mb-3">
            <h2 className="mb-2 border-b border-neutral-300 pb-0.5 text-sm font-bold text-neutral-950">
              Resumen del período
            </h2>
            <div className="grid gap-3 lg:grid-cols-2 print:grid-cols-1 print:gap-2">
              <dl className="grid grid-cols-2 gap-1.5 text-xs print:hidden">
                <div className="rounded border border-neutral-300 px-2 py-1.5">
                  <dt className="text-[10px] text-neutral-600">Días con actividad</dt>
                  <dd className="text-base font-semibold">{kpis.diasConActividad}</dd>
                </div>
                <div className="rounded border border-neutral-300 px-2 py-1.5">
                  <dt className="text-[10px] text-neutral-600">Días sin trabajo</dt>
                  <dd className="text-base font-semibold">{kpis.diasSinTrabajo}</dd>
                </div>
                <div className="rounded border border-neutral-300 px-2 py-1.5">
                  <dt className="text-[10px] text-neutral-600">
                    Días-equipo {ACCIONISTA_META.consorcio.label}
                  </dt>
                  <dd className="text-base font-semibold">{formatearNumero(kpis.diasEquipoConsorcio)}</dd>
                </div>
                <div className="rounded border border-neutral-300 px-2 py-1.5">
                  <dt className="text-[10px] text-neutral-600">Días-equipo Mauricio</dt>
                  <dd className="text-base font-semibold">{formatearNumero(kpis.diasEquipoMauricio)}</dd>
                </div>
                <div className="rounded border border-neutral-300 px-2 py-1.5">
                  <dt className="text-[10px] text-neutral-600">Viajes de arena</dt>
                  <dd className="text-base font-semibold">{kpis.totalViajesArena}</dd>
                </div>
                <div className="rounded border border-neutral-300 px-2 py-1.5">
                  <dt className="text-[10px] text-neutral-600">Eventos destacados</dt>
                  <dd className="text-base font-semibold">{kpis.eventosDestacados.length}</dd>
                </div>
              </dl>

              <div className="min-w-0">
                <h3 className="mb-1 text-xs font-semibold text-neutral-800">Por equipo y accionista</h3>
                <TablaResumenMaquinas filas={filasResumen} mostrarFrente />
              </div>
            </div>

            {kpis.eventosDestacados.length > 0 ? (
              <ul className="mt-2 space-y-0.5 text-[10px] text-neutral-700">
                {kpis.eventosDestacados.map((evento, index) => (
                  <li key={index}>· {evento}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="mb-4 print:mb-3">
            <h2 className="mb-2 border-b border-neutral-300 pb-0.5 text-sm font-bold text-neutral-950">
              Matriz calendario de uso
            </h2>
            <MatrizSemanalImpresa dias={dias} rango={rango} />
          </section>
        </>
      )}

      <footer className="mt-4 border-t border-neutral-300 pt-2 text-center text-[10px] text-neutral-500 print:mt-3">
        <p>Registro operativo de maquinaria — JBS Consorcio</p>
        <p className="mt-0.5">Uso exclusivo para fiscalización interna. No sustituye firmas oficiales.</p>
      </footer>
    </div>
  )
}
