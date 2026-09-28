/**
 * Interpretación operativa de lo que solicita la EPA (no es repetir el pliego:
 * indica qué ensayo hacer, con qué equipo, qué evidencia entregar).
 */

export type GuiaEnsayoRubro = {
  rubroId: number
  seccion: string
  imagenReferencia: string
  actividadContractual: string
  quePideLaContratante: string
  ensayosRequeridos: {
    nombre: string
    tipo: "eléctrico" | "mecánico" | "NDT" | "documental" | "inspección"
    descripcionPractica: string
    instrumento: string
    normaReferencia: string
    evidenciaAEntregar: string
  }[]
  documentosGenerados: string[]
}

export const GUIA_ENSAYOS_CONTRATANTE: GuiaEnsayoRubro[] = [
  {
    rubroId: 1,
    seccion: "1.5",
    imagenReferencia: "Imagen 1 — Desmontaje de motores",
    actividadContractual: "Desmontaje de motores de Severino",
    quePideLaContratante:
      "Antes y durante el desmontaje: demostrar que el motor llegó eléctricamente evaluable (aislamiento) y que la maniobra no dañó carcasa, eje, bridas ni borneras.",
    ensayosRequeridos: [
      {
        nombre: "Prueba de aislamiento inicial",
        tipo: "eléctrico",
        descripcionPractica:
          "Con megóhmetro (típ. 500 V o según manual del motor), medir resistencia de aislamiento entre devanados y tierra antes de desenergizar/desmontar definitivamente. Registrar lecturas a 1 min y calcular IP si aplica al protocolo de arranque.",
        instrumento: "Megóhmetro calibrado, cables de prueba, conexión a tierra verificada",
        normaReferencia: "Práctica IEEE / manual del fabricante del motor",
        evidenciaAEntregar:
          "Acta con valores (MΩ), condiciones ambientales, identificación del motor (tag, potencia, serie) y fotos de conexión de prueba.",
      },
      {
        nombre: "Integridad mecánica en maniobra (0 % daño)",
        tipo: "inspección",
        descripcionPractica:
          "Inspección visual y táctil documentada antes/después del izaje, acoplamiento y desacoplamiento. Buscar golpes, deformaciones, rayaduras en carcasa, eje, bridas y borneras.",
        instrumento: "Lista de verificación, registro fotográfico, grúa/gatos según procedimiento",
        normaReferencia: "Procedimiento de maniobra del contratista + criterio 0 % daño del pliego",
        evidenciaAEntregar:
          "Checklist firmado + fotos comparativas. Cualquier hallazgo = no conformidad y reporte inmediato a fiscalización.",
      },
    ],
    documentosGenerados: [
      "Acta § 1.5-A — Aislamiento inicial pre-desmontaje",
      "Acta § 1.5-B — Integridad mecánica en maniobra",
    ],
  },
  {
    rubroId: 2,
    seccion: "2.5",
    imagenReferencia: "Imagen 2 — Desmontaje de bombas",
    actividadContractual: "Desmontaje de bombas de Severino",
    quePideLaContratante:
      "Línea base de vibración de la bomba (si aplica) y garantía de que las caras de brida de succión/descarga no se deformaron en el desmontaje.",
    ensayosRequeridos: [
      {
        nombre: "Registro espectral de vibraciones base",
        tipo: "mecánico",
        descripcionPractica:
          "Con analizador de vibraciones, medir en rodamientos o puntos definidos (horizontal, vertical, axial) en condición de operación o según acuerdo con fiscalización. Registrar espectro y velocidad RMS.",
        instrumento: "Acelerómetro + analizador FFT, pastillas reflexivas si es necesario",
        normaReferencia: "ISO 10816 (evaluación de vibraciones en máquinas)",
        evidenciaAEntregar:
          "Informe con gráficos espectrales, RPM, punto de medición, fecha y comparación con zona A/B/C de la norma. Si la bomba ya está parada, documentar «no aplica» con acta firmada por fiscalización.",
      },
      {
        nombre: "Bridas succión/descarga sin deformación",
        tipo: "inspección",
        descripcionPractica:
          "Verificar planitud de caras maquinadas (sin rebabas, sin martilleo, sin holgura anormal al acoplar). Medición con regla de precisión/pie de rey según tolerancia del fabricante.",
        instrumento: "Pie de rey, regla, lupa, comparador opcional",
        normaReferencia: "Tolerancia nula del pliego + manual de la bomba",
        evidenciaAEntregar:
          "Acta de inspe dimensional con mediciones en al menos 4 puntos por brida y fotos de las caras.",
      },
    ],
    documentosGenerados: [
      "Informe § 2.5-A — Vibraciones base ISO 10816",
      "Acta § 2.5-B — Inspección de bridas",
    ],
  },
  {
    rubroId: 3,
    seccion: "3.5",
    imagenReferencia: "Imagen 3 — Corrección de pandeo de ejes",
    actividadContractual: "Corrección de pandeo de ejes de motor",
    quePideLaContratante:
      "Tras enderezar el eje en prensa: demostrar que quedó dentro de runout del fabricante, que el conjunto balancea G2.5 y que no hay microfisuras.",
    ensayosRequeridos: [
      {
        nombre: "Excentricidad (runout)",
        tipo: "mecánico",
        descripcionPractica:
          "Montar eje en centros o en bancada. Medir runout radial con comparador en zonas de rodamiento y acoplamiento.",
        instrumento: "Bancada, centros, comparador dial (0,01 mm)",
        normaReferencia: "Manual del fabricante (referencia típica ≤ 0,05 mm en ejes de alta velocidad)",
        evidenciaAEntregar: "Acta con sketch del eje, puntos medidos y valores en mm.",
      },
      {
        nombre: "Balanceo dinámico G2.5",
        tipo: "mecánico",
        descripcionPractica:
          "Balanceo dinámico del conjunto (eje + acople/elementos montados) en máquina de balanceo. Grado G2.5 según ISO 1940-1.",
        instrumento: "Máquina de balanceo dinámico certificada",
        normaReferencia: "ISO 1940-1",
        evidenciaAEntregar:
          "Certificado del taller de balanceo con masa de corrección, RPM de prueba y grado alcanzado.",
      },
      {
        nombre: "Líquidos penetrantes (END)",
        tipo: "NDT",
        descripcionPractica:
          "Tras enderezamiento hidráulico, inspeccionar zonas de tensión (filetes, cambios de sección) con PT según procedimiento END.",
        instrumento: "Kit penetrante (limpia-penetrante-revelador) o servicio END acreditado",
        normaReferencia: "ASTM E1417 / equivalente ISO 3452",
        evidenciaAEntregar: "Informe END con área inspeccionada, resultado (aceptado/rechazado) y fotos.",
      },
    ],
    documentosGenerados: [
      "Acta § 3.5-A — Runout de eje",
      "Formato § 3.5-B — Certificado balanceo G2.5 (referencia taller)",
      "Informe § 3.5-C — END líquidos penetrantes",
    ],
  },
  {
    rubroId: 4,
    seccion: "4.5",
    imagenReferencia: "Imagen 4 — Mantenimiento de motor",
    actividadContractual: "Mantenimiento de motor",
    quePideLaContratante:
      "Al cerrar el mantenimiento eléctrico-mecánico: aislamiento sano (IP > 2), rodamientos montados según ABB/ISO y rotor balanceado G2.5.",
    ensayosRequeridos: [
      {
        nombre: "Resistencia de aislamiento, IP y DAR",
        tipo: "eléctrico",
        descripcionPractica:
          "Megóhmetro: R a 1 min, R a 10 min. IP = R10/R1 (debe ser > 2,0). DAR = R60s/R30s si se usa ese protocolo. Motor seco y a temperatura estable.",
        instrumento: "Megóhmetro 500–1000 V según clase del motor",
        normaReferencia: "IEEE 43 / práctica de mantenimiento de motores ABB",
        evidenciaAEntregar: "Acta con tabla de tiempos, IP calculado, temperatura ambiente y humedad.",
      },
      {
        nombre: "Ajuste de rodamientos",
        tipo: "mecánico",
        descripcionPractica:
          "Verificar juego/interferencia según manual ABB y tolerancias ISO de asiento en eje y alojamiento. Registrar medidas antes del montaje.",
        instrumento: "Micrómetro, calibre, manual ABB del modelo",
        normaReferencia: "Manual ABB + ISO 286 / tolerancias de ajuste",
        evidenciaAEntregar: "Acta de montaje con código de rodamiento, juego medido y método de instalación.",
      },
      {
        nombre: "Balanceo dinámico del rotor G2.5",
        tipo: "mecánico",
        descripcionPractica: "Certificar balanceo del rotor reparado antes de armar motor.",
        instrumento: "Máquina de balanceo",
        normaReferencia: "ISO 1940-1, grado G2.5",
        evidenciaAEntregar: "Certificado de balanceo anexo al acta de mantenimiento.",
      },
    ],
    documentosGenerados: [
      "Acta § 4.5-A — Megóhmetro (RI, IP, DAR)",
      "Acta § 4.5-B — Montaje de rodamientos",
      "Formato § 4.5-C — Certificado balanceo rotor G2.5",
    ],
  },
]

export function guiaPorRubroId(rubroId: number): GuiaEnsayoRubro | undefined {
  return GUIA_ENSAYOS_CONTRATANTE.find((g) => g.rubroId === rubroId)
}
