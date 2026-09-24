import type { InfimaAnexoFotografico, InfimaInformeData } from "@/src/data/infimas/types"

const ANEXOS_CRUCITA_BASE = "/infimas/anexos/crucita-leopoldo-cedeno"

export const ANEXOS_FOTOGRAFICOS_CRUCITA_LEOPOLDO_CEDENO: InfimaAnexoFotografico[] = [
  {
    numero: 1,
    descripcion:
      "Desmontaje de la estructura metálica corroída existente mediante retroexcavadora.",
    archivo: `${ANEXOS_CRUCITA_BASE}/01-desmontaje-estructura-corroida.jpg`,
  },
  {
    numero: 2,
    descripcion:
      "Desazolve manual del canal y retiro de sedimentos previo a las obras de bypass.",
    archivo: `${ANEXOS_CRUCITA_BASE}/02-desazolve-manual-canal.jpg`,
  },
  {
    numero: 3,
    descripcion:
      "Excavación del desvío provisional e instalación inicial de tuberías para manejo de caudal.",
    archivo: `${ANEXOS_CRUCITA_BASE}/03-excavacion-tuberias-bypass.jpg`,
  },
  {
    numero: 4,
    descripcion:
      "Batería de tres tuberías corrugadas de HDPE de 500 mm instaladas para bypass hidráulico.",
    archivo: `${ANEXOS_CRUCITA_BASE}/04-bateria-tuberias-hdpe-500mm.jpg`,
  },
  {
    numero: 5,
    descripcion:
      "Corte y dimensionamiento de planchas metálicas para fabricación de pantallas nuevas.",
    archivo: `${ANEXOS_CRUCITA_BASE}/05-corte-planchas-metalicas.jpg`,
  },
  {
    numero: 6,
    descripcion:
      "Fabricación de pantallas de acero A36: corte de plancha con amoladora angular.",
    archivo: `${ANEXOS_CRUCITA_BASE}/06-fabricacion-pantallas-amoladora.jpg`,
  },
  {
    numero: 7,
    descripcion:
      "Instalación de guías laterales metálicas tipo U sobre la estructura de hormigón.",
    archivo: `${ANEXOS_CRUCITA_BASE}/07-instalacion-guias-laterales.jpg`,
  },
  {
    numero: 8,
    descripcion:
      "Montaje y nivelación de soportes verticales para el sistema de compuertas.",
    archivo: `${ANEXOS_CRUCITA_BASE}/08-montaje-soportes-verticales.jpg`,
  },
  {
    numero: 9,
    descripcion:
      "Montaje de pantallas nuevas en guías laterales; verificación de alineación.",
    archivo: `${ANEXOS_CRUCITA_BASE}/13-montaje-pantallas-guias.jpg`,
  },
  {
    numero: 10,
    descripcion:
      "Ajuste final del mecanismo de izamiento y acabado de compuertas en sitio.",
    archivo: `${ANEXOS_CRUCITA_BASE}/14-ajuste-final-compuertas.jpg`,
  },
  {
    numero: 11,
    descripcion:
      "Instalación de la estructura metálica de compuertas sobre el canal, con personal técnico en plataforma de trabajo y equipos de soldadura en sitio.",
    archivo: `${ANEXOS_CRUCITA_BASE}/15-instalacion-estructura-compuertas-canal.jpg`,
  },
  {
    numero: 12,
    descripcion:
      "Ajuste final del mecanismo de izamiento y verificación operativa de las compuertas en la estructura instalada.",
    archivo: `${ANEXOS_CRUCITA_BASE}/16-ajuste-mecanismo-izamiento-compuertas.jpg`,
  },
]

export const INFORME_CRUCITA_LEOPOLDO_CEDENO: InfimaInformeData = {
  titulo: "INFORME TÉCNICO DEFINITIVO DE FINALIZACIÓN DE SERVICIO",
  fecha: "08 de septiembre del 2026",
  para: "Ing. Carlos Alberto Pino Pinargote – Administrador de la Orden de Compra No. IC-EPA EP-052-2026",
  de: "Zambrano Mendoza Milton Joseph",
  asunto:
    "Informe Técnico de Finalización de Obra y Recepción Definitiva del Servicio de Rehabilitación Integral de la Compuerta \"Leopoldo Cedeño\".",
  datosGenerales: [
    { etiqueta: "Entidad Contratante", valor: "Empresa Pública del Agua (EPA-EP)" },
    {
      etiqueta: "Objeto Contractual",
      valor:
        'Provisión e Instalación de Materiales para el Mantenimiento Integral de la Compuerta "Leopoldo Cedeño", conforme el detalle de la Orden de Compra IC-EPA EP-052-2026.',
    },
    {
      etiqueta: "Ubicación",
      valor:
        'Compuerta Leopoldo Cedeño, sector las Gilces de la Parroquia Crucita del cantón Portoviejo, provincia Manabí.',
    },
    { etiqueta: "Tipo de Proceso", valor: "Ínfima Cuantía" },
    { etiqueta: "No. Orden de Compra", valor: "IC-EPA EP-052-2026" },
    { etiqueta: "Fecha de Emisión O/C", valor: "19 de agosto de 2026" },
    { etiqueta: "Proveedor", valor: "Zambrano Mendoza Milton Joseph" },
    { etiqueta: "RUC Proveedor", valor: "1313540997001" },
    { etiqueta: "Monto Contractual (Sin IVA)", valor: "$ 9,852.00" },
    { etiqueta: "IVA (15%)", valor: "$ 1,477.80" },
    { etiqueta: "TOTAL CON IVA", valor: "$ 11,329.80" },
    { etiqueta: "Plazo Ejecución", valor: "15 días calendario" },
    { etiqueta: "Fecha de Culminación", valor: "03 de septiembre del 2026" },
  ],
  secciones: [
    {
      titulo: "INTRODUCCIÓN Y ANTECEDENTES",
      parrafos: [
        "Mediante Orden de Compra No. IC-EPA EP-052-2026, emitida el 19 de agosto de 2026, la Empresa Pública del Agua EPA-EP contrató el servicio de rehabilitación integral de la compuerta Leopoldo Cedeño en Crucita. El objetivo primordial del proyecto era recuperar la funcionalidad del sistema de control hídrico, el cual se encontraba deshabilitado por el avanzado deterioro corrosivo de las pantallas y el desgaste del mecanismo de izamiento, comprometiendo la operación técnica de los canales de aducción.",
        "Este Informe Técnico tiene como finalidad dejar constancia de la culminación del 100% de las actividades contratadas, de acuerdo con los Términos de Referencia (TDRs) aprobados, las especificaciones técnicas detalladas en el Catálogo Provisional de Productos (CPC) de la orden de compra y los cronogramas vigentes, garantizando la operatividad hídrica del sistema.",
      ],
    },
    {
      titulo: "DESCRIPCIÓN TÉCNICA DE LOS SERVICIOS EJECUTADOS",
      parrafos: [
        "A continuación, se detallan las actividades ejecutadas para la rehabilitación integral de la compuerta Leopoldo Cedeño:",
      ],
      subsecciones: [
        {
          titulo: "Obras Preliminares, Maquinaria y Bypass Hidráulico",
          parrafos: [
            "Se realizó el desmontaje técnico de la estructura metálica corroída existente.",
            "Obra Civil y Bypass: Se utilizó maquinaria pesada (retroexcavadora) para la demolición controlada del muro de hormigón que obstruía el bypass y la excavación del desvío provisional, cumpliendo con la planificación hídrica.",
            "Bypass Hidráulico: Se instaló una batería de tres (3) tuberías corrugadas de HDPE de 500mm para el manejo del caudal del canal. Se mantuvo operando dos motobombas de 4\" durante 3 días calendario para asegurar el trabajo en seco del área de compuertas.",
          ],
        },
        {
          titulo: "Mecanizado y Extensión Técnica de Ejes de Izamiento con Rosca ACME",
          parrafos: [
            "Se ejecutó la extensión técnica de 1.00 metro (hacia arriba) en cada uno de los cuatro (4) ejes sinfín originales (longitud total final de 3.20m), utilizando Acero SAE 1045 por su alta dureza y resistencia al desgaste por fricción, cumpliendo la especificación mecánica.",
            "El trabajo incluyó un mecanizado especializado de acople interno cono-cilíndrico para garantizar alineación concéntrica perfecta, seguida de soldadura de penetración total y rectificación de la rosca ACME.",
            "Se verificó que los ejes no presentaran \"alabeo\" radial, asegurando la continuidad del hilo de la rosca a través de la unión para el paso libre de las tuercas.",
          ],
        },
        {
          titulo: "Metalmecánica y Montaje (Sede de Obra - Crucita)",
          items: [
            "Fabricación y montaje de cuatro (4) pantallas nuevas de acero A36 (3mm espesor) con bastidores reforzados de Perfiles Tipo C pesados (6mm).",
            "Instalación de las nuevas guías laterales (ángulos de 2x1/4\").",
            'Reposición integral del puente de operación (6.40m x 40cm) con plancha estriada "alfajor" para seguridad industrial del operador.',
            "Instalación de las cuatro (4) tuercas de bronce SAE 65 de alta fricción y los cuatro (4) volantes de maniobra adaptados a los nuevos ejes extendidos.",
          ],
        },
        {
          titulo: "Acabados, Estanqueidad y Obra Civil de Cierre",
          items: [
            "Se aplicó un sistema de protección anticorrosiva de dos capas (Base epóxica + Acabado Epóxico Grado Marino, conforme CPC ítem 12) en toda la estructura metálica.",
            'Instalación de 25 metros de sellos elastoméricos tipo "P" (EPDM, dureza 60-70 Shore A) para garantizar la estanqueidad de las 4 pantallas.',
            "Se resanaron los muros de hormigón con Grout de alta resistencia en la zona del bypass.",
          ],
        },
      ],
    },
    {
      titulo: "VERIFICACIÓN Y PRUEBAS DE CAMPO (CONTROL DE CALIDAD)",
      parrafos: [
        "Se realizaron las siguientes pruebas funcionales en presencia de la Fiscalización de la EPA-EP:",
      ],
      items: [
        "Prueba de Movilidad: Se operaron las 4 pantallas por separado, logrando un recorrido de apertura total de los 3.20 metros gracias a la extensión técnica de los ejes y la rectificación continua de la rosca ACME. No hubo trabas ni saltos en la zona de unión, confirmando que las pantallas suben por completo y no obstruyen el flujo.",
        'Prueba de Estanqueidad: Se cerraron las compuertas y se verificó que los sellos de caucho tipo "P" logran el cierre hermético, sin fugas de caudal significativas hacia el canal de aducción.',
      ],
    },
    {
      titulo: "LIQUIDACIÓN ECONÓMICA Y PLAZOS",
      items: [
        "Monto Facturado (Sin IVA): $ 9,852.00.",
        "Monto TOTAL (Con IVA 15%): $ 11,329.80.",
        "Garantía Técnica: Se entrega la Garantía Técnica de 1 año sobre los materiales instalados y la mano de obra, conforme a lo establecido en la página 4 de la Orden de Compra.",
        "Plazos: No se registraron prorrogas. El servicio se entregó el día 03 de septiembre del 2026, cumpliendo el plazo contractual de 15 días calendario.",
      ],
    },
    {
      titulo: "CONCLUSIÓN Y RECOMENDACIÓN",
      parrafos: [
        "Con base en la revisión técnica detallada, la fiscalización de campo y las pruebas funcionales realizadas en sitio, se concluye que el servicio de rehabilitación integral de la compuerta Leopoldo Cedeño ha sido ejecutado satisfactoriamente por el proveedor Zambrano Mendoza Milton Joseph, cumpliendo al 100% con los TDRs, las especificaciones técnicas CPC y las condiciones contractuales de la Orden de Compra No. IC-EPA EP-052-2026. La compuerta es ahora plenamente operativa, funcional y estanca, logrando el rango de apertura total requerido.",
        "Por lo tanto, se recomienda a la Administración del Contrato, Ing. Carlos Alberto Pino Pinargote, proceder con la recepción definitiva y formal del servicio, dejando constancia de su entrega en correcto estado y funcionamiento.",
      ],
    },
  ],
  anexosFotograficos: ANEXOS_FOTOGRAFICOS_CRUCITA_LEOPOLDO_CEDENO,
  firma: {
    nombre: "Zambrano Mendoza Milton Joseph",
    ruc: "1313540997001",
    cargo: "Contratista",
  },
}

export const ARCHIVO_PDF_CRUCITA_LEOPOLDO_CEDENO =
  "informe-finalizacion-compuerta-leopoldo-cedeno-ic-epa-ep-052-2026.pdf"
