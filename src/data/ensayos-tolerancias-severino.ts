/**
 * Ensayos y tolerancias solicitados por la entidad contratante (EPA)
 * para los rubros 1–4 de Reparación de Bombas y Motores — EB Severino.
 * Origen: observaciones a la Planilla 3 / especificaciones técnicas del pliego.
 */

export type EstadoCumplimientoEnsayo =
  | "pendiente"
  | "en_proceso"
  | "cumplido"
  | "no_aplica"

export type RequisitoEnsayo = {
  id: string
  texto: string
  /** Norma o criterio de aceptación cuando aplica. */
  criterio?: string
}

export type EspecificacionEnsayosRubro = {
  rubroId: number
  seccion: string
  titulo: string
  rubroDetalle: string
  requisitos: RequisitoEnsayo[]
}

export const SOLICITUD_CONTRATANTE = {
  planillaReferencia: 3,
  entidad: "Empresa Pública del Agua (EPA)",
  categoria: "REPARACION DE BOMBAS Y MOTORES DE LA EB SEVERINO",
  resumen:
    "La entidad contratante solicita documentar y cumplir los ensayos y tolerancias de las secciones 1.5, 2.5, 3.5 y 4.5 de las especificaciones técnicas, vinculados a la Planilla 3 presentada.",
} as const

export const ENSAYOS_TOLERANCIAS_SEVERINO: EspecificacionEnsayosRubro[] = [
  {
    rubroId: 1,
    seccion: "1.5",
    titulo: "Ensayos y Tolerancias",
    rubroDetalle: "Desmontaje de motores de Severino",
    requisitos: [
      {
        id: "1.5-aislamiento",
        texto: "Prueba de aislamiento inicial (resistencia y polarización).",
        criterio: "Registro de resistencia de aislamiento e índice de polarización previo al desmontaje.",
      },
      {
        id: "1.5-dano-fisico",
        texto:
          "Tolerancia: Se exige 0% de daño físico a la carcasa, eje, bridas y borneras durante la maniobra.",
        criterio: "0% de daño físico en carcasa, eje, bridas y borneras.",
      },
    ],
  },
  {
    rubroId: 2,
    seccion: "2.5",
    titulo: "Ensayos y Tolerancias",
    rubroDetalle: "Desmontaje de bombas de Severino",
    requisitos: [
      {
        id: "2.5-vibraciones",
        texto:
          "Registro espectral de vibraciones base (si aplica) bajo normativa ISO 10816.",
        criterio: "ISO 10816 — registro espectral de vibraciones base (cuando aplique).",
      },
      {
        id: "2.5-bridas",
        texto:
          "Tolerancia nula a la deformación de las caras maquinadas de las bridas de succión y descarga.",
        criterio: "Tolerancia nula a deformación en caras maquinadas de bridas de succión y descarga.",
      },
    ],
  },
  {
    rubroId: 3,
    seccion: "3.5",
    titulo: "Ensayos y Tolerancias",
    rubroDetalle: "Corrección de pandeo de ejes de motor",
    requisitos: [
      {
        id: "3.5-runout",
        texto:
          "Ensayo de excentricidad (Runout): La tolerancia máxima admisible será determinada por la norma del fabricante (típicamente ≤ 0.05 mm para ejes de alta velocidad).",
        criterio: "Según norma del fabricante; típicamente ≤ 0.05 mm (ejes de alta velocidad).",
      },
      {
        id: "3.5-balanceo",
        texto:
          "Certificación de Balanceo Dinámico del conjunto bajo normativa ISO 1940-1, alcanzando mínimo un grado de calidad G2.5.",
        criterio: "ISO 1940-1 — grado de calidad mínimo G2.5.",
      },
      {
        id: "3.5-penetrantes",
        texto:
          "Ensayos No Destructivos (Líquidos Penetrantes) para descartar microfisuras tras el enderezamiento con prensa hidráulica.",
        criterio: "END por líquidos penetrantes post-enderezamiento; sin microfisuras.",
      },
    ],
  },
  {
    rubroId: 4,
    seccion: "4.5",
    titulo: "Ensayos y Tolerancias",
    rubroDetalle: "Mantenimiento de motor",
    requisitos: [
      {
        id: "4.5-aislamiento-ip-dar",
        texto:
          "Pruebas de Resistencia de Aislamiento y cálculo del Índice de Polarización (IP) y Relación de Absorción Dieléctrica (DAR) utilizando el megóhmetro. Valores IP deben ser > 2.0.",
        criterio: "Megóhmetro; IP > 2.0; registro de DAR.",
      },
      {
        id: "4.5-rodamientos-balanceo",
        texto:
          "Tolerancias de ajuste de rodamientos según manual ABB e ISO. Balanceo dinámico del rotor certificado G2.5.",
        criterio: "Ajustes según manual ABB e ISO; balanceo dinámico rotor certificado G2.5.",
      },
    ],
  },
]

export function totalRequisitosEnsayos(
  especificaciones: EspecificacionEnsayosRubro[] = ENSAYOS_TOLERANCIAS_SEVERINO
): number {
  return especificaciones.reduce((sum, e) => sum + e.requisitos.length, 0)
}

export function idsRequisitosEnsayos(
  especificaciones: EspecificacionEnsayosRubro[] = ENSAYOS_TOLERANCIAS_SEVERINO
): string[] {
  return especificaciones.flatMap((e) => e.requisitos.map((r) => r.id))
}
