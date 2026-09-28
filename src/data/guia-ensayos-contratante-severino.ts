/**
 * Interpretación operativa de lo que solicita la EPA (procedimiento, fotos, entregables).
 */

export type ClasificacionActividadCalidad =
  | "ensayo"
  | "medición"
  | "inspección"
  | "certificación externa"
  | "informe"

export type FotoAdjuntaGuia = {
  id: string
  titulo: string
  momento: string
  contenidoMinimo: string
}

export type EnsayoRequeridoGuia = {
  nombre: string
  clasificacion: ClasificacionActividadCalidad
  tipo: "eléctrico" | "mecánico" | "NDT" | "documental" | "inspección"
  descripcionPractica: string
  instrumento: string
  normaReferencia: string
  evidenciaAEntregar: string
  pasos: string[]
  fotosAdjuntar: FotoAdjuntaGuia[]
}

export type GuiaEnsayoRubro = {
  rubroId: number
  seccion: string
  imagenReferencia: string
  actividadContractual: string
  quePideLaContratante: string
  ensayosRequeridos: EnsayoRequeridoGuia[]
  documentosGenerados: string[]
}

export const GUIA_ENSAYOS_CONTRATANTE: GuiaEnsayoRubro[] = [
  {
    rubroId: 1,
    seccion: "1.5",
    imagenReferencia: "Imagen 1 — Desmontaje de motores",
    actividadContractual: "Desmontaje de motores de Severino",
    quePideLaContratante:
      "Antes y durante el desmontaje: demostrar aislamiento inicial y 0 % de daño físico en carcasa, eje, bridas y borneras.",
    ensayosRequeridos: [
      {
        nombre: "Prueba de aislamiento inicial",
        clasificacion: "medición",
        tipo: "eléctrico",
        descripcionPractica:
          "Medición megométrica previa al desmontaje definitivo, con motor desenergizado y borneras accesibles.",
        instrumento: "Megóhmetro calibrado (500 V CC o según placa del motor), cables y puesta a tierra verificada",
        normaReferencia: "IEEE 43 / manual del fabricante ABB",
        evidenciaAEntregar: "Acta con MΩ por fase, ambiente y fotos de conexión.",
        pasos: [
          "Confirmar bloqueo eléctrico (LOTO) y ausencia de tensión en borneras.",
          "Desconectar cables de alimentación dejando bornes accesibles; limpiar superficies de contacto.",
          "Conectar megóhmetro fase–tierra (carcasa puesta a tierra); registrar R a 1 min por fase.",
          "Opcional: repetir a 10 min para línea base de IP si fiscalización lo solicita en esta etapa.",
          "Fotografiar conexiones y placa de identificación del motor.",
          "Restaurar conexiones o dejar preparado para desmontaje según procedimiento.",
        ],
        fotosAdjuntar: [
          {
            id: "F1.1",
            titulo: "Placa de identificación",
            momento: "Antes de desconectar",
            contenidoMinimo: "Tag, potencia, tensión, serie legibles.",
          },
          {
            id: "F1.2",
            titulo: "Conexión megóhmetro",
            momento: "Durante la medición",
            contenidoMinimo: "Bornes, cables de prueba y equipo visible.",
          },
          {
            id: "F1.3",
            titulo: "Pantalla / acta de lectura",
            momento: "Al registrar",
            contenidoMinimo: "Valor MΩ y fecha en acta o foto del display.",
          },
        ],
      },
      {
        nombre: "Integridad mecánica en maniobra (0 % daño)",
        clasificacion: "inspección",
        tipo: "inspección",
        descripcionPractica:
          "Inspección visual documentada antes, durante y después del izaje/desacople; no se admiten golpes ni deformaciones.",
        instrumento: "Checklist, cámara, plan de izaje (grúa/certificado)",
        normaReferencia: "Procedimiento de maniobra + criterio 0 % daño del pliego",
        evidenciaAEntregar: "Acta checklist firmada + fotos comparativas pre/post.",
        pasos: [
          "Registrar estado inicial de carcasa, eje expuesto, bridas y caja de borneras (foto F1.4).",
          "Verificar puntos de izaje aprobados (sin eslingar en bridas ni eje).",
          "Ejecutar desacople/izaje con velocidad controlada; prohibido golpear con maza en bridas.",
          "Re-inspeccionar las cuatro zonas al posar el motor en bancada o carro.",
          "Marcar en acta: Sin daño (S/N). Si hay daño, detener y notificar a fiscalización EPA.",
        ],
        fotosAdjuntar: [
          {
            id: "F1.4",
            titulo: "Estado pre-maniobra",
            momento: "Antes de izar",
            contenidoMinimo: "Vista general motor acoplado o en cárcamo.",
          },
          {
            id: "F1.5",
            titulo: "Puntos de izaje",
            momento: "Antes de levantar",
            contenidoMinimo: "Eslingas en puntos autorizados, sin contacto en brida/eje.",
          },
          {
            id: "F1.6",
            titulo: "Estado post-maniobra",
            momento: "En bancada",
            contenidoMinimo: "Bridas, borneras y carcasa sin abolladuras visibles.",
          },
        ],
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
      "Línea base de vibración (ISO 10816) si aplica, y cero deformación en caras de brida de succión y descarga.",
    ensayosRequeridos: [
      {
        nombre: "Registro espectral de vibraciones base",
        clasificacion: "informe",
        tipo: "mecánico",
        descripcionPractica:
          "Medición triaxial en rodamientos o carcasa con bomba en operación estable; adjuntar espectro FFT.",
        instrumento: "Analizador de vibraciones + acelerómetro, tacómetro o pastilla reflexiva",
        normaReferencia: "ISO 10816",
        evidenciaAEntregar: "Informe con RMS, espectro, RPM y zona A/B/C/D.",
        pasos: [
          "Confirmar bomba en régimen estable (caudal y nivel de succión representativos).",
          "Limpiar superficie de medición y fijar acelerómetro (H, V, A en puntos definidos).",
          "Registrar RPM y capturar espectro en banda según manual del analizador.",
          "Comparar velocidad RMS con tablas ISO 10816 para la clase de máquina.",
          "Si la bomba ya está fuera de servicio: elaborar acta «No aplica» firmada por fiscalización.",
        ],
        fotosAdjuntar: [
          {
            id: "F2.1",
            titulo: "Punto de medición",
            momento: "Durante ensayo",
            contenidoMinimo: "Sensor colocado en carcasa/rodamiento.",
          },
          {
            id: "F2.2",
            titulo: "Espectro / pantalla",
            momento: "Al guardar registro",
            contenidoMinimo: "Gráfico espectral legible o export PDF.",
          },
        ],
      },
      {
        nombre: "Bridas succión/descarga sin deformación",
        clasificacion: "inspección",
        tipo: "inspección",
        descripcionPractica:
          "Control de planitud y ausencia de rebabas tras desmontaje; tolerancia nula a deformación.",
        instrumento: "Pie de rey, regla de precisión, lupa",
        normaReferencia: "Pliego + manual de bomba",
        evidenciaAEntregar: "Acta con 4 mediciones por brida + fotos de caras.",
        pasos: [
          "Limpiar caras maquinadas succión y descarga (sin abrasivo agresivo).",
          "Inspección visual: rebabas, golpes, hundimientos, corrosión que afecte sellado.",
          "Medir planitud en cruz (N-S-E-O) con pie de rey; anotar máxima separación.",
          "Fotografiar cada cara con escala o referencia.",
          "Concluir Aceptado solo si no hay deformación y mediciones dentro de criterio del fabricante.",
        ],
        fotosAdjuntar: [
          { id: "F2.3", titulo: "Brida succión", momento: "Post-desmontaje", contenidoMinimo: "Cara maquinada completa." },
          { id: "F2.4", titulo: "Brida descarga", momento: "Post-desmontaje", contenidoMinimo: "Cara maquinada completa." },
          { id: "F2.5", titulo: "Medición pie de rey", momento: "Durante inspección", contenidoMinimo: "Instrumento sobre la brida." },
        ],
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
      "Runout conforme fabricante, balanceo G2.5 certificado y END penetrante tras enderezamiento.",
    ensayosRequeridos: [
      {
        nombre: "Excentricidad (runout)",
        clasificacion: "medición",
        tipo: "mecánico",
        descripcionPractica: "Medición de runout radial en centros después de enderezar en prensa.",
        instrumento: "Bancada, centros, comparador 0,01 mm",
        normaReferencia: "Manual fabricante (típ. ≤ 0,05 mm)",
        evidenciaAEntregar: "Acta con croquis y valores mm.",
        pasos: [
          "Montar eje en centros limpios; limpiar zonas de apoyo.",
          "Colocar comparador en zona de rodamiento DE y NDE y en acople.",
          "Girar 360° y registrar lectura máxima y mínima por punto.",
          "Calcular runout = (max − min) / 2 o según procedimiento del comparador.",
          "Comparar con límite del fabricante; adjuntar sketch del eje.",
        ],
        fotosAdjuntar: [
          { id: "F3.1", titulo: "Montaje en bancada", momento: "Durante runout", contenidoMinimo: "Centros y comparador visibles." },
          { id: "F3.2", titulo: "Lectura comparador", momento: "Registro", contenidoMinimo: "Valor legible en mm." },
        ],
      },
      {
        nombre: "Balanceo dinámico G2.5",
        clasificacion: "certificación externa",
        tipo: "mecánico",
        descripcionPractica: "Enviar conjunto a taller; obtener certificado ISO 1940-1 grado G2.5.",
        instrumento: "Máquina de balanceo del taller",
        normaReferencia: "ISO 1940-1",
        evidenciaAEntregar: "Certificado original o PDF con masa y ángulo de corrección.",
        pasos: [
          "Definir plano de corrección con el taller (eje + elementos montados).",
          "Solicitar grado G2.5 explícito en orden de trabajo.",
          "Recibir informe con residual final y RPM de prueba.",
          "Anexar certificado al paquete del rubro 3.",
        ],
        fotosAdjuntar: [
          { id: "F3.3", titulo: "Certificado balanceo", momento: "Entrega taller", contenidoMinimo: "PDF o foto legible del informe." },
        ],
      },
      {
        nombre: "Líquidos penetrantes (END)",
        clasificacion: "ensayo",
        tipo: "NDT",
        descripcionPractica: "PT en zonas tensionadas post-prensa para descartar microfisuras.",
        instrumento: "Kit PT nivel II o empresa END acreditada",
        normaReferencia: "ASTM E1417 / ISO 3452",
        evidenciaAEntregar: "Informe END con resultado y croquis.",
        pasos: [
          "Delimitar área inspeccionada (filetes, cambios de diámetro, zonas de prensa).",
          "Aplicar limpieza, penetrante, tiempo de penetración y revelador según procedimiento.",
          "Evaluar indicaciones lineales; ninguna indicación relevante = aceptado.",
          "Fotografiar zona inspeccionada y reporte firmado por operador calificado.",
        ],
        fotosAdjuntar: [
          { id: "F3.4", titulo: "Zona inspeccionada", momento: "Post END", contenidoMinimo: "Área del eje marcada en croquis." },
        ],
      },
    ],
    documentosGenerados: [
      "Acta § 3.5-A — Runout de eje",
      "Formato § 3.5-B — Certificado balanceo G2.5",
      "Informe § 3.5-C — END líquidos penetrantes",
    ],
  },
  {
    rubroId: 4,
    seccion: "4.5",
    imagenReferencia: "Imagen 4 — Mantenimiento de motor",
    actividadContractual: "Mantenimiento de motor",
    quePideLaContratante:
      "Al cierre: IP > 2,0, rodamientos según ABB/ISO y rotor balanceado G2.5.",
    ensayosRequeridos: [
      {
        nombre: "Resistencia de aislamiento, IP y DAR",
        clasificacion: "medición",
        tipo: "eléctrico",
        descripcionPractica: "Megóhmetro tras secado del devanado; IP = R10min/R1min > 2,0.",
        instrumento: "Megóhmetro 500–1000 V CC",
        normaReferencia: "IEEE 43 / ABB",
        evidenciaAEntregar: "Acta con tabla de tiempos e IP calculado.",
        pasos: [
          "Confirmar motor seco (horas de ventilación o calefacción según procedimiento).",
          "Medir temperatura ambiente y del devanado si hay sonda.",
          "Registrar R a 30 s, 60 s y 10 min fase–tierra en fase más crítica.",
          "Calcular IP = R10/R1; verificar IP > 2,0.",
          "Opcional: DAR = R60s/R30s; anotar en acta.",
        ],
        fotosAdjuntar: [
          { id: "F4.1", titulo: "Medición post-mantenimiento", momento: "Cierre eléctrico", contenidoMinimo: "Megóhmetro conectado, motor identificado." },
        ],
      },
      {
        nombre: "Ajuste de rodamientos",
        clasificacion: "inspección",
        tipo: "mecánico",
        descripcionPractica: "Medir juegos e montar según hoja ABB del modelo; método calor o hidráulico.",
        instrumento: "Micrómetro, calibre, inducción o kit hidráulico",
        normaReferencia: "Manual ABB + ISO 286",
        evidenciaAEntregar: "Acta con códigos SKF/ FAG y juegos medidos.",
        pasos: [
          "Consultar manual ABB para tolerancia de asiento en eje y alojamiento.",
          "Medir diámetro de eje y alojamiento en zonas de rodamiento.",
          "Montar rodamientos sin golpes en pistas; verificar juego axial final.",
          "Registrar método (calor/hidráulico) y código de grasa si aplica.",
        ],
        fotosAdjuntar: [
          { id: "F4.2", titulo: "Rodamiento antes de montaje", momento: "Montaje", contenidoMinimo: "Código visible en empaque o rodamiento." },
        ],
      },
      {
        nombre: "Balanceo dinámico del rotor G2.5",
        clasificacion: "certificación externa",
        tipo: "mecánico",
        descripcionPractica: "Certificado de taller para rotor reparado antes de cerrar motor.",
        instrumento: "Máquina de balanceo",
        normaReferencia: "ISO 1940-1 G2.5",
        evidenciaAEntregar: "Certificado anexo al acta de mantenimiento.",
        pasos: [
          "Enviar rotor balanceado en eje o conjunto según taller.",
          "Verificar grado G2.5 en informe.",
          "Archivar con acta § 4.5-A y § 4.5-B.",
        ],
        fotosAdjuntar: [
          { id: "F4.3", titulo: "Certificado rotor", momento: "Cierre", contenidoMinimo: "Informe de balanceo legible." },
        ],
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

export const ETIQUETA_CLASIFICACION: Record<ClasificacionActividadCalidad, string> = {
  ensayo: "Ensayo",
  medición: "Medición",
  inspección: "Inspección",
  "certificación externa": "Certificación externa",
  informe: "Informe técnico",
}
