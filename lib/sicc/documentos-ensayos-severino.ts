import { guiaPorRubroId } from "@/data/guia-ensayos-contratante-severino"
import { SOLICITUD_CONTRATANTE } from "@/data/ensayos-tolerancias-severino"
import {
  CONTEXTO_SEVERINO,
  perfilEquipoEjemplo,
  sustituir,
} from "@/data/severino-contexto-calidad"
import type { EstadoCumplimientoMap } from "@/lib/sicc/calidad-ensayos"
import {
  aplicarMarcadoresPlaceholder,
  encabezadoTabla,
  envolverDocumentoCalidad,
  filaTabla,
  parrafo,
} from "@/lib/sicc/placeholder-documento"
import type { ObraSicc } from "@/lib/sicc/types"

function metaObra(obra: ObraSicc): string {
  const c = CONTEXTO_SEVERINO.confirmado
  return `
    <p class="meta"><strong>Contrato:</strong> ${c.numeroContrato} · <strong>Cliente:</strong> ${c.cliente}</p>
    <p class="meta"><strong>Obra SICC:</strong> ${obra.nombre} · <strong>Ubicación:</strong> ${c.ubicacion}</p>
    <p class="meta"><strong>Estación:</strong> ${c.estacion} — ${c.estacionDetalle}</p>
    <p class="meta">${c.notaReplicacion}</p>
  `
}

function bloqueEquipo(rubroId: number): string {
  const p = perfilEquipoEjemplo(rubroId)
  return `
    <h2>1. Identificación del equipo (ejemplo)</h2>
    <table>
      ${encabezadoTabla(["Campo", "Valor"])}
      ${filaTabla(["Unidad", p.etiqueta])}
      ${filaTabla(["Tag", p.tag])}
      ${filaTabla(["Marca / modelo", p.marcaModelo])}
      ${filaTabla(["Serie", p.serie])}
      ${filaTabla(["Potencia / caudal", p.potenciaOCaudal])}
    </table>
  `
}

function bloqueFirmas(seccion = "Conclusión"): string {
  return `
    <h2>${seccion}</h2>
    <p>☑ Aceptado — Cumple criterio contractual &nbsp; ☐ No aceptado — NC N.º ${sustituir("___")}</p>
    <table>
      ${encabezadoTabla(["Rol", "Nombre", "Firma", "Fecha"])}
      ${filaTabla(["Técnico ejecutor", sustituir("Ing. Juan Pérez"), "", sustituir("2026-03-15")])}
      ${filaTabla(["Fiscalización EPA", sustituir("Nombre fiscalizador"), "", sustituir("____")])}
    </table>
  `
}

function documentoRubro1Html(obra: ObraSicc): string {
  return `
    ${metaObra(obra)}
    ${bloqueEquipo(1)}
    <div class="seccion-doc">
      <h2>Acta § 1.5-A — Aislamiento inicial pre-desmontaje</h2>
      ${parrafo(`Instrumento: megóhmetro ${sustituir("Fluke 1555")} · ${sustituir("500 V CC")} · Calibración vigente: Sí · Cert. ${sustituir("CAL-2026-0892")}`)}
      ${parrafo(`Ambiente: ${sustituir("28")} °C · HR ${sustituir("62")} % · LOTO N.º ${sustituir("LOTO-SEV-2026-014")}`)}
      <table>
        ${encabezadoTabla(["Tiempo", "Fase R–Tierra (MΩ)", "Fase S–Tierra (MΩ)", "Fase T–Tierra (MΩ)"])}
        ${filaTabla(["60 s (1 min)", sustituir("850"), sustituir("920"), sustituir("880")])}
        ${filaTabla(["600 s (10 min)", sustituir("910"), sustituir("980"), sustituir("940")])}
      </table>
      ${parrafo(`IP preliminar (R10/R1) fase S: ${sustituir("1,07")} — línea base documentada antes de desmontaje.`)}
      ${parrafo("Fotos adjuntas en expediente: F1.1 placa, F1.2 conexión megóhmetro, F1.3 lectura.")}
      ${bloqueFirmas("Conclusión acta 1.5-A")}
    </div>
    <div class="seccion-doc">
      <h2>Acta § 1.5-B — Integridad mecánica en maniobra (0 % daño)</h2>
      ${parrafo(`Grúa / certificado: ${sustituir("Grúa Liebherr LTM — cert. 2026-SEV-03")}`)}
      <table>
        ${encabezadoTabla(["Elemento", "Pre-maniobra", "Post-maniobra", "Daño", "Observación"])}
        ${filaTabla(["Carcasa", "OK", "OK", "No", "Sin abolladuras"])}
        ${filaTabla(["Eje", "OK", "OK", "No", "—"])}
        ${filaTabla(["Bridas", "OK", "OK", "No", "—"])}
        ${filaTabla(["Borneras", "OK", "OK", "No", "—"])}
      </table>
      ${parrafo("Fotos: F1.4 pre-maniobra, F1.5 puntos de izaje, F1.6 post-maniobra.")}
      ${bloqueFirmas("Conclusión acta 1.5-B")}
    </div>
  `
}

function documentoRubro2Html(obra: ObraSicc): string {
  return `
    ${metaObra(obra)}
    ${bloqueEquipo(2)}
    <div class="seccion-doc">
      <h2>Informe § 2.5-A — Vibraciones base ISO 10816</h2>
      ${parrafo(`Analizador: ${sustituir("SKF Microlog Analyzer AX")} · Sensor: ${sustituir("AC102")}`)}
      ${parrafo(`Condición: bomba en operación · RPM: ${sustituir("1485")} · Caudal aprox. ${CONTEXTO_SEVERINO.confirmado.caudalUnitarioM3s} m³/s`)}
      <table>
        ${encabezadoTabla(["Dirección", "Velocidad RMS (mm/s)", "Zona ISO 10816"])}
        ${filaTabla(["Horizontal", sustituir("2,8"), "B — Aceptable"])}
        ${filaTabla(["Vertical", sustituir("3,1"), "B — Aceptable"])}
        ${filaTabla(["Axial", sustituir("2,2"), "B — Aceptable"])}
      </table>
      ${parrafo(`Espectro FFT adjunto: archivo ${sustituir("SEV-B01-vib-20260315.pdf")}. Fotos F2.1, F2.2.`)}
      ${bloqueFirmas("Conclusión informe 2.5-A")}
    </div>
    <div class="seccion-doc">
      <h2>Acta § 2.5-B — Inspección bridas succión y descarga</h2>
      ${parrafo(`Instrumento: pie de rey ${sustituir("Mitutoyo 506-207")}`)}
      <table>
        ${encabezadoTabla(["Brida", "Planitud OK", "Rebaba/golpe", "Máx. separación (mm)", "Acepta"])}
        ${filaTabla(["Succión", "Sí", "No", sustituir("0,04"), "Sí"])}
        ${filaTabla(["Descarga", "Sí", "No", sustituir("0,03"), "Sí"])}
      </table>
      ${parrafo("Fotos F2.3, F2.4, F2.5. Criterio: tolerancia nula a deformación — cumplido.")}
      ${bloqueFirmas("Conclusión acta 2.5-B")}
    </div>
  `
}

function documentoRubro3Html(obra: ObraSicc): string {
  return `
    ${metaObra(obra)}
    ${bloqueEquipo(3)}
    <div class="seccion-doc">
      <h2>Acta § 3.5-A — Runout de eje</h2>
      ${parrafo(`Límite fabricante: ${sustituir("≤ 0,05 mm")} · Bancada: ${sustituir("Taller mecánico EPA / bancada 2 m")}`)}
      <table>
        ${encabezadoTabla(["Zona", "Lect. 1 (mm)", "Lect. 2 (mm)", "Runout (mm)", "Cumple"])}
        ${filaTabla(["Rodamiento DE", sustituir("0,021"), sustituir("0,019"), sustituir("0,042"), "Sí"])}
        ${filaTabla(["Rodamiento NDE", sustituir("0,018"), sustituir("0,020"), sustituir("0,038"), "Sí"])}
        ${filaTabla(["Acople", sustituir("0,015"), sustituir("0,017"), sustituir("0,032"), "Sí"])}
      </table>
      ${parrafo("Fotos F3.1, F3.2.")}
      ${bloqueFirmas("Conclusión acta 3.5-A")}
    </div>
    <div class="seccion-doc">
      <h2>Formato § 3.5-B — Certificado balanceo dinámico G2.5</h2>
      ${parrafo(`Taller: ${sustituir("Balanceos Industriales Manabí Cía. Ltda.")}`)}
      ${parrafo(`Informe N.º ${sustituir("BAL-2026-0441")} · Norma ISO 1940-1 · Grado obtenido: G2.5`)}
      ${parrafo(`RPM prueba: ${sustituir("1500")} · Corrección: ${sustituir("12,5 g")} @ ${sustituir("127°")} en plano ${sustituir("A")}`)}
      ${parrafo("Foto / PDF certificado: F3.3.")}
    </div>
    <div class="seccion-doc">
      <h2>Informe § 3.5-C — END líquidos penetrantes</h2>
      ${parrafo(`Procedimiento: ASTM E1417 · Operador nivel II: ${sustituir("Carlos Mendoza")}`)}
      ${parrafo(`Zona: filetes post-enderezamiento prensa ${sustituir("150 t")} — longitud ${sustituir("420 mm")} del eje.`)}
      ${parrafo("Resultado: Sin indicaciones relevantes — ACEPTADO.")}
      ${parrafo("Foto F3.4 + croquis en anexo.")}
      ${bloqueFirmas("Conclusión informe 3.5-C")}
    </div>
  `
}

function documentoRubro4Html(obra: ObraSicc): string {
  return `
    ${metaObra(obra)}
    ${bloqueEquipo(4)}
    <div class="seccion-doc">
      <h2>Acta § 4.5-A — Megóhmetro (RI, IP, DAR)</h2>
      ${parrafo(`Megóhmetro ${sustituir("500 V CC")} · Motor seco ${sustituir("24 h")} · Temp. ambiente ${sustituir("27")} °C`)}
      <table>
        ${encabezadoTabla(["Fase–Tierra", "30 s (MΩ)", "60 s (MΩ)", "10 min (MΩ)"])}
        ${filaTabla(["R (U)", sustituir("1200"), sustituir("1350"), sustituir("3240")])}
        ${filaTabla(["S (V)", sustituir("1180"), sustituir("1320"), sustituir("3180")])}
        ${filaTabla(["T (W)", sustituir("1220"), sustituir("1380"), sustituir("3310")])}
      </table>
      ${parrafo(`IP fase U = R10/R1 = ${sustituir("2,40")} · Criterio contractual IP > 2,0: CUMPLE.`)}
      ${parrafo(`DAR (R60/R30) fase U: ${sustituir("1,12")}. Foto F4.1.`)}
      ${bloqueFirmas("Conclusión acta 4.5-A")}
    </div>
    <div class="seccion-doc">
      <h2>Acta § 4.5-B — Montaje rodamientos ABB / ISO</h2>
      ${parrafo(`Manual ABB hoja: ${sustituir("M3BP 355 — rodamientos 6318 C3 / 6318 C3")}`)}
      <table>
        ${encabezadoTabla(["Extremo", "Código", "Ajuste eje (medido)", "Método"])}
        ${filaTabla(["DE", sustituir("6318 C3"), sustituir("k6 (+0,018 mm)"), "Calor inducción"])}
        ${filaTabla(["NDE", sustituir("6318 C3"), sustituir("k6 (+0,016 mm)"), "Calor inducción"])}
      </table>
      ${parrafo(`Juego axial final: ${sustituir("0,12 mm")}. Foto F4.2.`)}
      ${bloqueFirmas("Conclusión acta 4.5-B")}
    </div>
    <div class="seccion-doc">
      <h2>Formato § 4.5-C — Certificado balanceo rotor G2.5</h2>
      ${parrafo(`Taller: ${sustituir("Balanceos Industriales Manabí Cía. Ltda.")} · Informe ${sustituir("BAL-2026-0455")}`)}
      ${parrafo(`Residual: ${sustituir("4,2 g·mm")} · RPM ${sustituir("1500")} · Grado G2.5. Foto F4.3.`)}
    </div>
  `
}

const GENERADORES_HTML: Record<number, (obra: ObraSicc) => string> = {
  1: documentoRubro1Html,
  2: documentoRubro2Html,
  3: documentoRubro3Html,
  4: documentoRubro4Html,
}

export function generarDocumentoEnsayoRubroHtml(obra: ObraSicc, rubroId: number): string {
  const gen = GENERADORES_HTML[rubroId]
  const titulo = tituloDocumentoRubro(rubroId)
  if (!gen) {
    return envolverDocumentoCalidad(
      titulo,
      parrafo(`No hay plantilla para el rubro ${rubroId}.`)
    )
  }
  return envolverDocumentoCalidad(
    `${titulo} — Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia}`,
    gen(obra)
  )
}

/** @deprecated Use generarDocumentoEnsayoRubroHtml; conservado por compatibilidad. */
export function generarDocumentoEnsayoRubro(obra: ObraSicc, rubroId: number): string {
  return generarDocumentoEnsayoRubroHtml(obra, rubroId)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function tituloDocumentoRubro(rubroId: number): string {
  const guia = guiaPorRubroId(rubroId)
  return guia
    ? `Documento § ${guia.seccion} — Rubro ${rubroId} (${guia.actividadContractual})`
    : `Documento rubro ${rubroId}`
}

export function generarIndiceEntregaPlanilla3Html(
  obra: ObraSicc,
  _estados: EstadoCumplimientoMap
): string {
  const c = CONTEXTO_SEVERINO.confirmado
  const hoy = new Date().toISOString().slice(0, 10)
  let lista = ""
  for (const guia of [1, 2, 3, 4].map((id) => guiaPorRubroId(id)).filter(Boolean)) {
    if (!guia) continue
    lista += `<h2>${aplicarMarcadoresPlaceholder(guia.imagenReferencia)}</h2>`
    lista += parrafo(`Actividad: ${guia.actividadContractual}`)
    lista += parrafo(guia.quePideLaContratante)
    lista += "<p><strong>Documentos modelo:</strong></p><ul>"
    for (const doc of guia.documentosGenerados) {
      lista += `<li>${doc}</li>`
    }
    lista += "</ul><p><strong>Fotos mínimas:</strong></p><ul>"
    for (const req of guia.ensayosRequeridos) {
      for (const f of req.fotosAdjuntar) {
        lista += `<li><strong>${f.id}</strong> — ${f.titulo} (${f.momento}): ${f.contenidoMinimo}</li>`
      }
    }
    lista += "</ul>"
  }

  const body = `
    ${metaObra(obra)}
    ${parrafo(`Fecha índice: ${hoy}. Contrato ${c.numeroContrato}.`)}
    ${parrafo(
      "Este paquete responde a observaciones de la Planilla 3. Los documentos por rubro incluyen datos de ejemplo en amarillo; las fotos listadas deben adjuntarse al expediente PDF."
    )}
    ${lista}
  `
  return envolverDocumentoCalidad(
    `Índice de entrega — Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia}`,
    body
  )
}

export function generarIndiceEntregaPlanilla3(
  obra: ObraSicc,
  estados: EstadoCumplimientoMap
): string {
  return generarIndiceEntregaPlanilla3Html(obra, estados)
    .replace(/<[^>]+>/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
