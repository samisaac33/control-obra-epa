import { ACCIONISTA_META, type Accionista, type RegistroDia } from "@/src/data/registro-maquinaria"
import { PROYECTO } from "@/src/data/proyecto"
import type { RangoMaquinaria } from "@/src/lib/maquinaria-filtro"
import {
  agruparSemanas,
  construirMatrizCalendario,
  EQUIPO_ETIQUETA_CORTA,
  tituloColumna,
  type CeldaMatriz,
  type ColumnaMatriz,
  type FilaMatriz,
} from "@/src/lib/maquinaria-matriz"
import {
  formatearNumero,
  kpisMaquinaria,
  resumenAccionistaEtiqueta,
  resumenPorEquipo,
} from "@/src/lib/maquinaria-resumen"

type MaquinariaDocumentoProps = {
  dias: RegistroDia[]
  rango: RangoMaquinaria
  rangoEtiqueta: string
  generadoEn: string
}

function claveCelda(filaId: string, fecha: string): string {
  return `${filaId}::${fecha}`
}

function etiquetaEquipoCorta(equipo: string): string {
  return EQUIPO_ETIQUETA_CORTA[equipo] ?? equipo
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
      <td className="border border-neutral-300 p-0.5 text-center">
        <div className="maquinaria-celda-sin-obra mx-auto h-5 w-5 bg-[repeating-linear-gradient(-45deg,transparent,transparent_2px,oklch(0.82_0_0)_2px,oklch(0.82_0_0)_4px)]" />
      </td>
    )
  }

  if (columna.sinRegistro) {
    return (
      <td className="border border-neutral-300 bg-neutral-50 p-0.5 text-center text-[10px] text-neutral-300">
        —
      </td>
    )
  }

  const simbolo = simboloCelda(celda)
  const colorClass = claseCeldaAccionista(fila.accionista, celda)

  return (
    <td className="border border-neutral-300 p-0.5 text-center">
      <div
        className={`maquinaria-celda mx-auto flex h-5 w-5 items-center justify-center rounded-sm text-[9px] font-semibold leading-none ${colorClass}`}
      >
        {simbolo}
      </div>
    </td>
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
  const semanas = agruparSemanas(matriz.columnas)

  return (
    <div className="space-y-6">
      {semanas.map((semana) => (
        <section
          key={semana.indice}
          className={`maquinaria-matriz-landscape ${semana.indice > 0 ? "break-before-page print:break-before-page" : ""}`}
        >
          <h3 className="mb-2 text-sm font-semibold text-neutral-800">
            Semana {semana.indice + 1} — {semana.etiqueta}
          </h3>
          <div className="overflow-hidden rounded border border-neutral-300">
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 px-2 py-1 text-left font-semibold text-neutral-800">
                    Equipo
                  </th>
                  {semana.columnas.map((columna) => (
                    <th
                      key={columna.fecha}
                      className="border border-neutral-300 px-0.5 py-1 text-center font-medium text-neutral-700"
                      title={columna.fecha}
                    >
                      <div>{tituloColumna(columna)}</div>
                      <div className="text-[8px] font-normal text-neutral-500">{columna.diaSemana}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matriz.filas.map((fila) => (
                  <tr key={fila.id}>
                    <td className="border border-neutral-300 px-2 py-0.5 text-left text-neutral-800">
                      <span className="font-medium">{etiquetaEquipoCorta(fila.equipo)}</span>
                      <span className="text-neutral-500"> · {resumenAccionistaEtiqueta(fila.accionista)}</span>
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
        </section>
      ))}
      <p className="text-[10px] text-neutral-600">
        Leyenda matriz: ● día completo · ◐ medio día · número = viajes · ◆ actividad · rayado = sin obra
      </p>
    </div>
  )
}

export function MaquinariaDocumento({
  dias,
  rango,
  rangoEtiqueta,
  generadoEn,
}: MaquinariaDocumentoProps) {
  const kpis = kpisMaquinaria(dias)
  const filasResumen = resumenPorEquipo(dias)

  const fechaGeneracion = new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(generadoEn))

  return (
    <div
      id="maquinaria-documento"
      className="mx-auto max-w-[210mm] bg-white px-6 py-8 text-neutral-950 shadow-sm ring-1 ring-neutral-200 print:mx-0 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0"
    >
      <header className="mb-8 border-b-2 border-neutral-900 pb-4 text-center print:mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Registro operativo de maquinaria y transporte
        </p>
        <h1 className="mt-2 font-heading text-xl font-bold leading-tight sm:text-2xl">
          {PROYECTO.nombreObra}
        </h1>
        <p className="mt-2 text-sm text-neutral-700">{PROYECTO.objeto}</p>
        <dl className="mt-4 grid gap-1 text-sm text-neutral-800 sm:grid-cols-2 sm:gap-x-6 sm:text-left">
          <div>
            <dt className="inline font-semibold">Contrato: </dt>
            <dd className="inline">{PROYECTO.numeroContrato}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Cliente: </dt>
            <dd className="inline">{PROYECTO.cliente}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Sistema: </dt>
            <dd className="inline">{PROYECTO.sistema}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Período del reporte: </dt>
            <dd className="inline">{rangoEtiqueta}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-neutral-500">Documento generado el {fechaGeneracion}</p>
        <div className="mt-4 border-t border-neutral-200 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Leyenda — accionistas
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <span className="maquinaria-accionista-chip inline-flex items-center gap-1.5 rounded border border-blue-600/40 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-950">
              <span className="size-2 rounded-full bg-blue-600" aria-hidden />
              {ACCIONISTA_META.consorcio.label}
            </span>
            <span className="maquinaria-accionista-chip inline-flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950">
              <span className="size-2 rounded-full bg-amber-500" aria-hidden />
              {ACCIONISTA_META.mauricio.label}
            </span>
          </div>
        </div>
      </header>

      <section className="mb-8 print:mb-6">
        <h2 className="mb-3 border-b border-neutral-300 pb-1 text-base font-bold text-neutral-950">
          Resumen del período
        </h2>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded border border-neutral-300 px-3 py-2">
            <dt className="text-xs text-neutral-600">Días con actividad</dt>
            <dd className="text-lg font-semibold">{kpis.diasConActividad}</dd>
          </div>
          <div className="rounded border border-neutral-300 px-3 py-2">
            <dt className="text-xs text-neutral-600">Días sin trabajo</dt>
            <dd className="text-lg font-semibold">{kpis.diasSinTrabajo}</dd>
          </div>
          <div className="rounded border border-neutral-300 px-3 py-2">
            <dt className="text-xs text-neutral-600">Días-equipo {ACCIONISTA_META.consorcio.label}</dt>
            <dd className="text-lg font-semibold">{formatearNumero(kpis.diasEquipoConsorcio)}</dd>
          </div>
          <div className="rounded border border-neutral-300 px-3 py-2">
            <dt className="text-xs text-neutral-600">Días-equipo Mauricio</dt>
            <dd className="text-lg font-semibold">{formatearNumero(kpis.diasEquipoMauricio)}</dd>
          </div>
          <div className="rounded border border-neutral-300 px-3 py-2">
            <dt className="text-xs text-neutral-600">Viajes de arena</dt>
            <dd className="text-lg font-semibold">{kpis.totalViajesArena}</dd>
          </div>
          <div className="rounded border border-neutral-300 px-3 py-2">
            <dt className="text-xs text-neutral-600">Eventos destacados</dt>
            <dd className="text-lg font-semibold">{kpis.eventosDestacados.length}</dd>
          </div>
        </dl>
        {kpis.eventosDestacados.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-neutral-700">
            {kpis.eventosDestacados.map((evento, index) => (
              <li key={index}>· {evento}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mb-8 print:mb-6">
        <h2 className="mb-3 border-b border-neutral-300 pb-1 text-base font-bold text-neutral-950">
          Resumen por equipo y accionista
        </h2>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 px-2 py-1.5 text-left font-semibold">Equipo</th>
              <th className="border border-neutral-300 px-2 py-1.5 text-left font-semibold">Accionista</th>
              <th className="border border-neutral-300 px-2 py-1.5 text-right font-semibold">Días compl.</th>
              <th className="border border-neutral-300 px-2 py-1.5 text-right font-semibold">Medios</th>
              <th className="border border-neutral-300 px-2 py-1.5 text-right font-semibold">Horas</th>
              <th className="border border-neutral-300 px-2 py-1.5 text-right font-semibold">Viajes</th>
              <th className="border border-neutral-300 px-2 py-1.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {filasResumen.map((fila) => (
              <tr key={`${fila.equipo}-${fila.accionista}`}>
                <td className="border border-neutral-300 px-2 py-1">{fila.equipo}</td>
                <td className="border border-neutral-300 px-2 py-1">
                  {resumenAccionistaEtiqueta(fila.accionista)}
                </td>
                <td className="border border-neutral-300 px-2 py-1 text-right font-mono">
                  {fila.diasCompletos || "—"}
                </td>
                <td className="border border-neutral-300 px-2 py-1 text-right font-mono">
                  {fila.mediosDias || "—"}
                </td>
                <td className="border border-neutral-300 px-2 py-1 text-right font-mono">
                  {fila.horas || "—"}
                </td>
                <td className="border border-neutral-300 px-2 py-1 text-right font-mono">
                  {fila.viajes || "—"}
                </td>
                <td className="border border-neutral-300 px-2 py-1 text-right font-mono font-semibold">
                  {fila.totalDiaEquipo > 0 ? formatearNumero(fila.totalDiaEquipo) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8 print:mb-6">
        <h2 className="mb-3 border-b border-neutral-300 pb-1 text-base font-bold text-neutral-950">
          Matriz calendario de uso
        </h2>
        <MatrizSemanalImpresa dias={dias} rango={rango} />
      </section>

      <footer className="mt-8 border-t border-neutral-300 pt-4 text-center text-xs text-neutral-500 print:mt-6">
        <p>Registro operativo de maquinaria — JBS Consorcio</p>
        <p className="mt-1">Uso exclusivo para fiscalización interna. No sustituye firmas oficiales.</p>
      </footer>
    </div>
  )
}
