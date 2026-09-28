import { guiaPorRubroId } from "@/data/guia-ensayos-contratante-severino"
import { SOLICITUD_CONTRATANTE } from "@/data/ensayos-tolerancias-severino"
import type { EstadoCumplimientoMap } from "@/lib/sicc/calidad-ensayos"
import type { ObraSicc } from "@/lib/sicc/types"

const SEP = "═".repeat(72)
const SUB = "─".repeat(72)

function encabezadoDocumento(
  obra: ObraSicc,
  codigo: string,
  titulo: string,
  rubroDetalle: string,
  seccion: string
): string[] {
  const hoy = new Date().toISOString().slice(0, 10)
  return [
    SEP,
    titulo.toUpperCase(),
    `Código: ${codigo}`,
    `Respuesta observaciones Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia} — § ${seccion}`,
    SEP,
    "",
    "1. IDENTIFICACIÓN",
    SUB,
    `Obra / sistema:           ${obra.nombre}`,
    `Contrato:                 ${obra.numeroContrato}`,
    `Entidad contratante:      ${obra.cliente}`,
    `Rubro contractual:        ${rubroDetalle}`,
    `Ubicación:                ${obra.ubicacion}`,
    `Fecha de elaboración:     ${hoy}`,
    "",
    "Equipo / unidad:          _____________________________  Tag: __________",
    "Marca / modelo:           _____________________________  Serie: __________",
    "Potencia / capacidad:     _____________________________",
    "",
  ]
}

function bloqueFirmas(): string[] {
  return [
    "",
    SUB,
    "4. CONCLUSIÓN",
    "",
    "[ ] ACEPTADO — Cumple criterio contractual",
    "[ ] NO ACEPTADO — Ver no conformidad N.º ______",
    "",
    "Elaborado por (técnico): _________________________  Firma: __________  Fecha: ______",
    "Revisado fiscalización:  _________________________  Firma: __________  Fecha: ______",
    "",
    SEP,
  ]
}

function documentoRubro1(obra: ObraSicc): string {
  const lineas = [
    ...encabezadoDocumento(
      obra,
      "SEV-1.5-A",
      "Acta de aislamiento inicial pre-desmontaje",
      "Desmontaje de motores de Severino",
      "1.5"
    ),
    "2. OBJETIVO",
    SUB,
    "Registrar la condición eléctrica del devanado antes del desmontaje, conforme § 1.5 del pliego.",
    "",
    "3. PROCEDIMIENTO Y RESULTADOS",
    SUB,
    "Instrumento: Megóhmetro __________ V  |  Calibración vigente: [ ] Sí  [ ] No",
    "Temperatura ambiente: ______ °C   Humedad relativa: ______ %",
    "",
    "Conexiones de prueba (marcar):  [ ] Fase-Tierra  [ ] Fase-Fase  [ ] Según manual",
    "",
    "Lecturas (MΩ):",
    "  Tiempo        Fase R / U      Fase S / V      Fase T / W",
    "  15 s          __________      __________      __________",
    "  60 s (1 min)  __________      __________      __________",
    "  600 s (10 min) __________     __________      __________",
    "",
    "Índice de polarización IP (R10/R1): __________   Criterio referencia: documentar línea base",
    "",
    "Observaciones / anomalías: _________________________________________________________",
    ...bloqueFirmas(),
    "",
    SEP,
    "ACTA § 1.5-B — INTEGRIDAD MECÁNICA EN MANIOBA (0 % DAÑO)",
    `Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia} — Desmontaje motores Severino`,
    SEP,
    "",
    "Elemento inspeccionado     | Pre-maniobra | Post-maniobra | Daño (S/N) | Observación",
    "---------------------------|--------------|---------------|------------|-------------",
    "Carcasa                    | [ ] OK       | [ ] OK        | [ ]        |",
    "Eje                        | [ ] OK       | [ ] OK        | [ ]        |",
    "Bridas                     | [ ] OK       | [ ] OK        | [ ]        |",
    "Borneras / caja conexión   | [ ] OK       | [ ] OK        | [ ]        |",
    "",
    "Medio de izaje / apoyo: _________________________  Certificado grúa: __________",
    "Registro fotográfico adjunto: [ ] Sí  Folios / archivos: _________________________",
    "",
    "Criterio contractual: 0 % de daño físico. Cualquier daño = detener y notificar a EPA.",
    ...bloqueFirmas(),
  ]
  return lineas.join("\n")
}

function documentoRubro2(obra: ObraSicc): string {
  return [
    ...encabezadoDocumento(
      obra,
      "SEV-2.5-A",
      "Informe de vibraciones base — ISO 10816",
      "Desmontaje de bombas de Severino",
      "2.5"
    ),
    "2. OBJETIVO",
    SUB,
    "Establecer línea base espectral de vibración antes/desmontaje, cuando la bomba esté operativa.",
    "",
    "3. CONDICIÓN DE MEDICIÓN",
    SUB,
    "[ ] Bomba en operación   [ ] Bomba detenida — justificación: _________________________",
    "RPM medida: __________   Punto de medición: ______________________________________",
    "",
    "Velocidad RMS (mm/s) — ISO 10816:",
    "  Dirección horizontal:  __________   Zona evaluada: [ ] A  [ ] B  [ ] C  [ ] D",
    "  Dirección vertical:    __________",
    "  Dirección axial:       __________",
    "",
    "Espectro adjunto: [ ] Sí  Archivo / folio: ______________________________________",
    "Equipo: Analizador _________________________  Sensor _________________________",
    ...bloqueFirmas(),
    "",
    SEP,
    "ACTA § 2.5-B — INSPECCIÓN BRIDAS SUCCIÓN Y DESCARGA",
    SEP,
    "",
    "Brida          | Cara maquinada | Planitud OK | Rebaba/golpe | Medición (mm) | Acepta",
    "---------------|----------------|-------------|--------------|---------------|--------",
    "Succión        | [ ]            | [ ]         | [ ]          | __________    | [ ]",
    "Descarga       | [ ]            | [ ]         | [ ]          | __________    | [ ]",
    "",
    "Criterio: tolerancia nula a deformación de caras maquinadas.",
    "Instrumento: pie de rey / regla de precisión ______________________________________",
    ...bloqueFirmas(),
  ].join("\n")
}

function documentoRubro3(obra: ObraSicc): string {
  return [
    ...encabezadoDocumento(
      obra,
      "SEV-3.5-A",
      "Acta de excentricidad (runout) de eje",
      "Corrección de pandeo de ejes de motor",
      "3.5"
    ),
    "2. OBJETIVO",
    SUB,
    "Verificar runout tras enderezamiento en prensa hidráulica, según tolerancia del fabricante.",
    "",
    "3. MEDICIONES (mm)",
    SUB,
    "Referencia fabricante / límite admisible: __________ mm  (típ. ≤ 0,05 mm alta velocidad)",
    "",
    "Punto en eje (sketch):     Lectura 1    Lectura 2    Promedio",
    "Zona rodamiento DE:        ________     ________     ________",
    "Zona rodamiento NDE:       ________     ________     ________",
    "Acople / chaveta:          ________     ________     ________",
    "",
    "Bancada / centros utilizados: ______________________________________________________",
    ...bloqueFirmas(),
    "",
    SEP,
    "FORMATO § 3.5-B — CERTIFICADO BALANCEO DINÁMICO (COMPLETAR EN TALLER)",
    SEP,
    "",
    "Taller acreditado: _________________________  N.º informe: _________________________",
    "Norma: ISO 1940-1   Grado requerido: G2.5   Grado obtenido: __________",
    "RPM de balanceo: __________   Masa corrección: __________ @ __________°",
    "Conjunto balanceado (eje + elementos): _____________________________________________",
    "",
    SEP,
    "INFORME § 3.5-C — END LÍQUIDOS PENETRANTES POST-ENDEREZAMIENTO",
    SEP,
    "",
    "Procedimiento: [ ] ASTM E1417  [ ] ISO 3452  [ ] Otro: __________________________",
    "Zona inspeccionada (post-prensa): __________________________________________________",
    "Resultado: [ ] Sin indicaciones  [ ] Indicaciones (adjuntar croquis y evaluación)",
    "Operador END nivel: __________  Fecha: __________",
    ...bloqueFirmas(),
  ].join("\n")
}

function documentoRubro4(obra: ObraSicc): string {
  return [
    ...encabezadoDocumento(
      obra,
      "SEV-4.5-A",
      "Acta megóhmetrica — RI, IP y DAR",
      "Mantenimiento de motor",
      "4.5"
    ),
    "2. OBJETIVO",
    SUB,
    "Demostrar estado del aislamiento al cierre del mantenimiento. Criterio contractual: IP > 2,0.",
    "",
    "3. MEDICIONES",
    SUB,
    "Megóhmetro: __________ V   Motor seco: [ ] Sí   Temp. devanado: __________ °C",
    "",
    "Fase / lectura          | 30 s | 60 s (1 min) | 10 min | Notas",
    "------------------------|------|--------------|--------|------",
    "R (U) - Tierra          | ____ | ____________ | ______ |",
    "S (V) - Tierra          | ____ | ____________ | ______ |",
    "T (W) - Tierra          | ____ | ____________ | ______ |",
    "",
    "IP (R10min / R1min) fase crítica: __________   Criterio: > 2,0  [ ] Cumple  [ ] No cumple",
    "DAR (R60s / R30s) si aplica:     __________",
    ...bloqueFirmas(),
    "",
    SEP,
    "ACTA § 4.5-B — MONTAJE DE RODAMIENTOS (ABB / ISO)",
    SEP,
    "",
    "Rodamiento DE: código __________   NDE: código __________",
    "Ajuste eje (medido): __________ mm   Ajuste alojamiento: __________ mm",
    "Manual ABB / hoja: __________   Método montaje: [ ] Calor  [ ] Hidráulico  [ ] Otro",
    "Verificación axial final: __________ mm",
    ...bloqueFirmas(),
    "",
    SEP,
    "FORMATO § 4.5-C — CERTIFICADO BALANCEO ROTOR G2.5",
    SEP,
    "",
    "Taller: _________________________  Informe N.º: _________________________",
    "Grado ISO 1940-1: G2.5   Residual: __________ g·mm   RPM prueba: __________",
    ...bloqueFirmas(),
  ].join("\n")
}

const GENERADORES: Record<number, (obra: ObraSicc) => string> = {
  1: documentoRubro1,
  2: documentoRubro2,
  3: documentoRubro3,
  4: documentoRubro4,
}

export function generarDocumentoEnsayoRubro(obra: ObraSicc, rubroId: number): string {
  const gen = GENERADORES[rubroId]
  if (!gen) {
    return `No hay plantilla de documento para el rubro ${rubroId}.`
  }
  return gen(obra)
}

export function tituloDocumentoRubro(rubroId: number): string {
  const guia = guiaPorRubroId(rubroId)
  return guia
    ? `Documento § ${guia.seccion} — Rubro ${rubroId} (${guia.actividadContractual})`
    : `Documento rubro ${rubroId}`
}

export function generarIndiceEntregaPlanilla3(
  obra: ObraSicc,
  _estados: EstadoCumplimientoMap
): string {
  const hoy = new Date().toISOString().slice(0, 10)
  const lineas: string[] = [
    SEP,
    "ÍNDICE DE ENTREGA — ENSAYOS Y TOLERANCIAS SEVERINO",
    `Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia} — Respuesta a observaciones EPA`,
    SEP,
    "",
    `Obra: ${obra.nombre}`,
    `Contrato: ${obra.numeroContrato}`,
    `Fecha: ${hoy}`,
    "",
    "La contratante no pide repetir el texto del pliego: pide ACTAS, INFORMES y CERTIFICADOS",
    "que demuestren que se ejecutaron los ensayos indicados en § 1.5, 2.5, 3.5 y 4.5.",
    "",
    "DOCUMENTOS A ADJUNTAR (imprimir uno por rubro / imagen):",
    SUB,
  ]

  for (const guia of [1, 2, 3, 4].map((id) => guiaPorRubroId(id)).filter(Boolean)) {
    if (!guia) continue
    lineas.push("")
    lineas.push(`${guia.imagenReferencia}`)
    lineas.push(`  Actividad: ${guia.actividadContractual}`)
    lineas.push(`  Qué demostrar: ${guia.quePideLaContratante}`)
    lineas.push("  Entregables:")
    for (const doc of guia.documentosGenerados) {
      lineas.push(`    • ${doc}`)
    }
  }

  lineas.push("")
  lineas.push(SUB)
  lineas.push("Use «Imprimir documento § X.X» en cada rubro para obtener las plantillas.")
  lineas.push(SEP)
  return lineas.join("\n")
}
