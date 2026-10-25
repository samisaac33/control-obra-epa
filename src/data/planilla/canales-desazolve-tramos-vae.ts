/**
 * Tramos VAE — CANALES_DESAZOLVE_EMERGENCIA (Excel usuario).
 * Fila «san antonio» (0 m / 0 m³) ignorada; usar «SAN ANTONIO» (1455 m, 71 692,45 m³).
 */

export type FrenteDesazolveVae = "trasvase" | "san_antonio"

export type TramoDesazolveVae = {
  id: string
  nombre: string
  frente: FrenteDesazolveVae
  longitudM: number
  volumenM3: number
}

function slug(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function tramo(
  nombre: string,
  frente: FrenteDesazolveVae,
  longitudM: number,
  volumenM3: number
): TramoDesazolveVae {
  return { id: slug(nombre), nombre: nombre.trim(), frente, longitudM, volumenM3 }
}

/** 24 tramos trasvase + San Antonio — Σ m³ = 597 268,45 (525 576 + 71 692,45). */
export const TRAMOS_DESAZOLVE_VAE: TramoDesazolveVae[] = [
  tramo("Canal pasaje las maravillas", "trasvase", 606, 7272),
  tramo("Canal tabacales el horcon", "trasvase", 293, 3516),
  tramo("Canal valdes bachillero", "trasvase", 221, 2652),
  tramo("Canal puerto loor dos bocas", "trasvase", 739, 8868),
  tramo("Canal puerto loor el horcon", "trasvase", 1275, 15300),
  tramo("puente - hacienda leonery", "trasvase", 556, 6672),
  tramo("guanipera - hacienda leonery", "trasvase", 428, 5136),
  tramo("hacienda leonery - mina de oro", "trasvase", 1472, 17664),
  tramo("mina de oro - final", "trasvase", 1699, 20388),
  tramo("puente - alcantarilla", "trasvase", 1609, 19308),
  tramo("alcantarilla - tramo recto", "trasvase", 1672, 20064),
  tramo("alcantarilla - mina de oro", "trasvase", 1101, 13212),
  tramo("guanipera - curva", "trasvase", 731, 8772),
  tramo("hacienda leonery - guabital", "trasvase", 1136, 13632),
  tramo("las jaguas - san eloy", "trasvase", 1246, 14952),
  tramo("Canal nueva Granada correagua", "trasvase", 1439, 17268),
  tramo("canal messia", "trasvase", 2419, 29028),
  tramo("tamarindo marbella", "trasvase", 3259, 39108),
  tramo("Inicio del canal las jaguas san eloy", "trasvase", 2486, 29832),
  tramo("canal mata palo sector las jaguas", "trasvase", 2818, 33816),
  tramo("canal el mango", "trasvase", 4724, 56688),
  tramo("canal guayaba", "trasvase", 3116, 37392),
  tramo("poza chica", "trasvase", 1504, 18048),
  tramo("messias inicia", "trasvase", 7249, 86988),
  tramo("SAN ANTONIO", "san_antonio", 1455, 71692.45),
]

export const VOLUMEN_TOTAL_TRASVASE_M3 = 525_576
export const VOLUMEN_TOTAL_SAN_ANTONIO_M3 = 71_692.45141

export function tramosPorFrente(frente: FrenteDesazolveVae): TramoDesazolveVae[] {
  return TRAMOS_DESAZOLVE_VAE.filter((t) => t.frente === frente)
}

export function volumenContratoFrente(frente: FrenteDesazolveVae): number {
  return frente === "trasvase" ? VOLUMEN_TOTAL_TRASVASE_M3 : VOLUMEN_TOTAL_SAN_ANTONIO_M3
}
