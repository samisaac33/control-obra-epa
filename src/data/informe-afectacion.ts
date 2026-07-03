export type KpiInforme = {
  id: string
  label: string
  valor: string
  detalle?: string
}

export type Afectacion = {
  id: string
  titulo: string
  resumen: string
  detalle: string
}

export type OficioBeneficiario = {
  id: string
  entidad: string
  referencia: string
  fecha: string
  resumen: string
}

export type CriterioEmergencia = {
  letra: string
  titulo: string
  descripcion: string
}

export type PresaDerivadora = {
  nombre: string
  canales: { nombre: string; longitudKm: number }[]
  totalKm: number
}

export const INFORME_META = {
  titulo:
    "Informe técnico — Situación actual sobre la afectación a los canales Poza Honda y compuertas La Estancilla y La Ciénega",
  entidad: "Empresa Pública del Agua (EPA EP)",
  autor: "Econ. Darwin García Guadamud",
  cargoAutor: "Responsable de los Sistemas Trasvases Manabí",
  periodoReferencia: "Etapa invernal 2025 (febrero–marzo)",
} as const

export const INFORME_KPIS: KpiInforme[] = [
  {
    id: "hormigon",
    label: "Canales de hormigón",
    valor: "96.26 km",
    detalle: "Principales y secundarios del sistema Poza Honda",
  },
  {
    id: "tierra",
    label: "Canales de tierra",
    valor: "153.74 km",
    detalle: "Derivados de 8 presas en ríos Portoviejo y Chico",
  },
  {
    id: "lluvia",
    label: "Precipitación Feb–Mar 2025",
    valor: "1 151.10 mm",
    detalle: "752.10 mm (feb.) + 399 mm (mar.) — superior a históricos",
  },
  {
    id: "riego",
    label: "Área de riego",
    valor: "7 000 ha",
    detalle: "De 10 500 ha diseñadas en el sistema",
  },
  {
    id: "presas",
    label: "Presas derivadoras",
    valor: "8",
    detalle: "Sobre ríos Portoviejo y Chico",
  },
  {
    id: "afectaciones",
    label: "Tipos de afectación",
    valor: "4",
    detalle: "Azolvamiento, taludes, hormigón y compuertas",
  },
]

export const GENERALIDADES = {
  parrafo1:
    "La EPA EP administra, opera y mantiene 14 sistemas hídricos a nivel nacional, beneficiando a 34 plantas potabilizadoras, más de 2.5 millones de habitantes y protegiendo 262 425 hectáreas.",
  parrafo2:
    "En la provincia de Manabí, el periodo invernal 2025 ha afectado los canales Poza Honda del Sistema Trasvase Manabí y las compuertas La Estancilla y La Ciénega, infraestructura que abastece agua cruda para consumo humano y actividades productivas.",
}

export const SISTEMA_TRASVASE = {
  descripcion:
    "El trasvase inicia en el embalse Daule Peripa, alimenta La Esperanza por gravedad, abastece Poza Honda mediante la estación de bombeo Severino, y desde Poza Honda conduce agua por el túnel Mancha Grande al valle del Río Chico, uniéndose al Río Portoviejo para irrigar el sistema Poza Honda.",
  componentes: [
    {
      nombre: "Embalse La Esperanza",
      detalle:
        "Sobre el Río Carrizal. Presa de 696 m con vertedero de 900 m³/s. Altura 47 m desde el lecho del río.",
    },
    {
      nombre: "Estación de Bombeo Severino",
      detalle:
        "6 unidades de 3.2 m³/s cada una, motores de 2 400 kW. Subestación eléctrica 138/4 160 kV.",
    },
    {
      nombre: "Embalse Poza Honda",
      detalle:
        "Sobre el Río Portoviejo. Presa de 330 m con vertedero de 875 m³/s. Altura 40 m desde el lecho del río.",
    },
    {
      nombre: "Canales Poza Honda",
      detalle:
        "250 km de recorrido en hormigón y tierra. Riega cuatro cantones (Santa Ana, Portoviejo, Rocafuerte y Sucre) y abastece plantas potabilizadoras 4 Esquinas, El Ceibal y comunidades Sosote, Tres Charcos y Danzarín.",
    },
  ],
}

export const ZONAS_CANALES = [
  {
    id: "zona1",
    nombre: "Zona 1",
    descripcion:
      "Desde la represa de Santa Ana hasta Portoviejo. Dos canales abiertos de hormigón: margen izquierda (15 km hasta El Naranjo) y margen derecha (21.2 km hasta Fátima). Incluye 25 km de canales secundarios de hormigón.",
  },
  {
    id: "zona2",
    nombre: "Zona 2",
    descripcion:
      "Túnel cerrado de 2.85 km por Portoviejo (Fátima–UTM), canal abierto de 9 km hasta Río Chico, sifón Río Chico (2.54 km), sifón Portoviejo (2.67 km) y canal abierto de 18 km hasta Buenos Aires de Rocafuerte.",
  },
]

export const PRESAS_DERIVADORAS: PresaDerivadora[] = [
  {
    nombre: "Presa El Ceibal",
    canales: [
      { nombre: "Canal Ceibal Guabital", longitudKm: 4 },
      { nombre: "Canal Guabital California", longitudKm: 2 },
      { nombre: "Canal Mina de Oro", longitudKm: 1.7 },
      { nombre: "Canal Aviles", longitudKm: 2 },
      { nombre: "Canal Las Maravillas", longitudKm: 12 },
      { nombre: "Canal Estero Mesías", longitudKm: 15 },
      { nombre: "Canal Cerecito", longitudKm: 1.5 },
    ],
    totalKm: 38.2,
  },
  {
    nombre: "Presa Las Jaguas",
    canales: [
      { nombre: "Canal La Jagua San Eloy", longitudKm: 4 },
      { nombre: "Canal Rio Viejo", longitudKm: 18 },
    ],
    totalKm: 22,
  },
  {
    nombre: "Presa El Cerrito",
    canales: [
      { nombre: "Canal El Diablo", longitudKm: 6 },
      { nombre: "Canal La Virgen", longitudKm: 2 },
    ],
    totalKm: 8,
  },
  {
    nombre: "Presa La Guayaba",
    canales: [
      { nombre: "Canal Guayaba Correagua", longitudKm: 6 },
      { nombre: "Canal El Mango", longitudKm: 7 },
      { nombre: "Canal Poza Honda", longitudKm: 4 },
      { nombre: "Canal Poza Honda – Tamarindo – Malbella", longitudKm: 3.5 },
    ],
    totalKm: 20.5,
  },
  {
    nombre: "Presa La Ciénega",
    canales: [
      { nombre: "Principal La Cienega", longitudKm: 8 },
      { nombre: "Canal Santa Martha", longitudKm: 2 },
      { nombre: "Canal Playa Prieta", longitudKm: 2 },
      { nombre: "Canal La Loma", longitudKm: 2 },
      { nombre: "Canal El Corozo", longitudKm: 1.5 },
      { nombre: "Canal El Tillo", longitudKm: 2 },
      { nombre: "Canal Del Medio", longitudKm: 1.5 },
    ],
    totalKm: 19,
  },
  {
    nombre: "Presa El Pechiche",
    canales: [
      { nombre: "Canal Principal El Zapote", longitudKm: 2 },
      { nombre: "Canal Las Chácaras", longitudKm: 1.6 },
      { nombre: "Sección Los Chácaras", longitudKm: 2 },
    ],
    totalKm: 5.6,
  },
  {
    nombre: "Presa El Pasaje",
    canales: [{ nombre: "Canal Pasaje", longitudKm: 8 }],
    totalKm: 8,
  },
  {
    nombre: "Presa Mejía",
    canales: [
      { nombre: "Canal Principal Mejía San José de Las Peñas", longitudKm: 20 },
      { nombre: "Canal Sección Mejía Guayabo", longitudKm: 2.5 },
      { nombre: "Canal Saco y Topo", longitudKm: 6 },
      { nombre: "Canal Sección Del Saco y Topo", longitudKm: 4 },
    ],
    totalKm: 32.5,
  },
]

export const CLIMATOLOGIA = {
  febrero2025: "752.10 mm",
  marzo2025: "399 mm",
  acumulado: "1 151.10 mm",
  notaErfen:
    "Según el Boletín ERFEN del 7 de marzo de 2025, las lluvias de febrero superaron el promedio por factores oceánicos y atmosféricos. Se prevé persistencia de precipitaciones en el Litoral durante marzo.",
}

export const AFECTACIONES: Afectacion[] = [
  {
    id: "azolvamiento",
    titulo: "Azolvamiento de canales y compuertas",
    resumen: "Sedimentos reducen la capacidad de conducción y dificultan la distribución del agua.",
    detalle:
      "El aumento del caudal ha provocado erosión de taludes y arrastre de sedimentos hacia canales de riego y compuertas derivadoras, generando acumulaciones que afectan la producción agrícola y exigen intervenciones constantes de limpieza.",
  },
  {
    id: "taludes",
    titulo: "Deslizamiento de taludes",
    resumen: "Debilitamiento de taludes aledaños con taponamientos y daños estructurales.",
    detalle:
      "Las intensas lluvias han provocado deslizamientos de tierra en inmediaciones de los canales, afectando la estabilidad, provocando taponamientos y bloqueos en la conducción del agua.",
  },
  {
    id: "hormigon",
    titulo: "Daños en canales de hormigón",
    resumen: "Desprendimiento de placas, fractura de losas y colapso de secciones críticas.",
    detalle:
      "En los canales de hormigón de ambos márgenes se registran graves daños por sobrecarga hídrica y erosión: desprendimiento de placas, fractura de losas de revestimiento, colapso de secciones y deformación de rejillas y pantallas.",
  },
  {
    id: "compuertas",
    titulo: "Daños en compuertas La Ciénega y La Estancilla",
    resumen: "Atascos por material flotante, troncos y residuos arrastrados por la corriente.",
    detalle:
      "La acumulación de material flotante ha generado daños significativos en las compuertas de madera de La Ciénega y La Estancilla, con atascos que comprometen la regulación del flujo.",
  },
]

export const JUSTIFICATIVO = {
  parrafos: [
    "Los daños por las intensas lluvias afectan de manera generalizada toda la infraestructura hídrica, requiriendo intervención urgente y a gran escala.",
    "La maquinaria disponible resulta insuficiente para atender simultáneamente todos los sectores. El convenio con el GAD Provincial de Manabí no ha podido facilitar equipos adicionales por emergencias propias del GADPM.",
    "Sin acción inmediata, los canales perderán capacidad hidráulica, las compuertas seguirán deteriorándose y se comprometerá la regulación del agua, con riesgo de inundaciones en época lluviosa y escasez en época seca.",
  ],
}

export const OFICIOS_BENEFICIARIOS: OficioBeneficiario[] = [
  {
    id: "sosote",
    entidad: "Junta Administradora de Agua Potable SOSOTE",
    referencia: "Oficio No. JAAP-0522-S",
    fecha: "10 de marzo de 2025",
    resumen:
      "Solicita maquinaria para desazolve del canal que abastece la planta potabilizadora, afectado por azolvamiento.",
  },
  {
    id: "crucita",
    entidad: "Junta General de Riego y Drenaje de la Parroquia Crucita",
    referencia: "Oficio S/N",
    fecha: "18 de marzo de 2025",
    resumen:
      "Reporta afectación por azolvamiento y rotura de muros de protección que afectan cultivos y población.",
  },
  {
    id: "rocafuerte",
    entidad: "GAD Municipal del Cantón Rocafuerte",
    referencia: "GADMCR-VICEALCALDESA/CONCEJAL-2025-05-NSZZ",
    fecha: "18 de marzo de 2025",
    resumen:
      "Informa taponamiento de la quebrada Valdez y azolvamiento del canal Pasaje Maravillas que abastece planta potabilizadora.",
  },
  {
    id: "cady",
    entidad: "Junta de Riego y Drenaje El Cady (Parroquia Colón, Portoviejo)",
    referencia: "Oficio S/N",
    fecha: "19 de marzo de 2025",
    resumen:
      "Solicita desazolve de aproximadamente 13 km de canal por azolvamiento e inundaciones que afectaron cultivos.",
  },
  {
    id: "abdon-calderon",
    entidad: "GAD Parroquial Abdón Calderón",
    referencia: "GADPAC-RN-042-2025",
    fecha: "19 de marzo de 2025",
    resumen:
      "Informa colapso de más de 20 km de canales de riego por deslaves en varias comunidades; ya se realizó intervención parcial.",
  },
  {
    id: "riochico",
    entidad: "GAD Parroquial Riochico",
    referencia: "N°097-2025-GAD-EMCI-RIOCHICO",
    fecha: "19 de marzo de 2025",
    resumen:
      "Solicita limpieza emergente en comunidades El Milagro, Guayabo, La Balsita, El Corozo 2, Los Casinos, San Gabriel, Chacras Adentro y El Pechiche.",
  },
]

export const CRITERIOS_EMERGENCIA: CriterioEmergencia[] = [
  {
    letra: "a",
    titulo: "Concreta",
    descripcion:
      "Deterioro en estructuras de riego, acumulación de sedimentos y riesgo de desbordamientos que amenazan cultivos y comunidades.",
  },
  {
    letra: "b",
    titulo: "Inmediata",
    descripcion:
      "Ocurre en este momento y requiere respuesta urgente para evitar impactos irreversibles.",
  },
  {
    letra: "c",
    titulo: "Imprevista",
    descripcion:
      "La magnitud de las afectaciones y la falta de maquinaria no pudieron anticiparse por las precipitaciones anormales.",
  },
  {
    letra: "d",
    titulo: "Probada",
    descripcion:
      "Existen reportes técnicos, verificaciones de campo y fotografías que evidencian la problemática.",
  },
  {
    letra: "e",
    titulo: "Objetiva",
    descripcion:
      "Las condiciones pueden verificarse mediante criterios técnicos, sin depender de interpretaciones subjetivas.",
  },
]

export const AREA_INFLUENCIA = {
  cantones: [
    "Sucre",
    "Tosagua",
    "Chone",
    "Bolívar",
    "Portoviejo",
    "Rocafuerte",
    "Santa Ana",
    "Jipijapa",
    "24 de Mayo",
    "Montecristí",
    "Manta",
    "Jaramijó",
  ],
  aguaPotable: [
    "EPMAPAP Guarumo",
    "EPMAPAS-J Cazalagarto",
    "EPMAPAP 4 Esquinas",
    "EPAM Ceibal",
    "EPAM Colorado",
    "EMAARS-EP La Estancilla",
    "JAAPP Sosote, Tres Charcos, Danzarín",
    "RDP Montecristi y Jaramijó",
    "EPAR Rocafuerte",
  ],
}

export const MARCO_JURIDICO =
  "Art. 57 de la Ley Orgánica del Sistema Nacional de Contratación Pública: la máxima autoridad debe emitir resolución motivada que declare la emergencia, calificándola como concreta, inmediata, imprevista, probada y objetiva."

export const CONCLUSION =
  "Ante la emergencia por intensas lluvias, resulta imprescindible ejecutar intervenciones inmediatas para garantizar la operatividad de los sistemas de riego y drenaje. La acumulación de sedimentos incrementa el riesgo de desbordamientos, y el deterioro de compuertas compromete el abastecimiento de agua para usos agrícolas y humanos."
