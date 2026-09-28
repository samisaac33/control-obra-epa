import { getProyecto, PROYECTO_EMERGENCIA_MANABI } from "@/data/proyectos/catalog"
import { SISTEMA_TRASVASE } from "@/data/informe-afectacion"

const proyecto = getProyecto(PROYECTO_EMERGENCIA_MANABI)

const estacionSeverino = SISTEMA_TRASVASE.componentes.find(
  (e) => e.nombre === "Estación de Bombeo Severino"
)

/** Marca texto inventado que debe reemplazarse (se renderiza en amarillo). */
export function sustituir(texto: string): string {
  return `[[${texto}]]`
}

export const CONTEXTO_SEVERINO = {
  confirmado: {
    nombreObra: proyecto.nombreObra,
    numeroContrato: proyecto.numeroContrato,
    cliente: proyecto.cliente,
    sistema: proyecto.sistema,
    ubicacion: "Manabí, Ecuador — Estación de Bombeo Severino",
    estacion: "Estación de Bombeo Severino",
    estacionDetalle:
      estacionSeverino?.detalle ??
      "Unidades de bombeo del trasvase hacia embalse Poza Honda.",
    unidadesOperativas: 6,
    caudalUnitarioM3s: 3.2,
    potenciaMotorKw: 2400,
    cantidadesContrato: {
      desmontajeMotores: 4,
      desmontajeBombas: 4,
      correccionEjes: 15,
      mantenimientoMotores: 2,
    },
    notaReplicacion:
      "Los documentos modelo usan una unidad de ejemplo. Replicar por cada motor/bomba/eje según cantidades contractuales.",
  },
} as const

export type PerfilEquipoEjemplo = {
  rubroId: number
  etiqueta: string
  tag: string
  marcaModelo: string
  serie: string
  potenciaOCaudal: string
}

/** Un perfil ficticio por rubro (tags/marcas en [[...]]). */
export function perfilEquipoEjemplo(rubroId: number): PerfilEquipoEjemplo {
  const { potenciaMotorKw, caudalUnitarioM3s } = CONTEXTO_SEVERINO.confirmado
  switch (rubroId) {
    case 1:
      return {
        rubroId: 1,
        etiqueta: "Motor vertical de bombeo — unidad 1",
        tag: sustituir("SEV-M01"),
        marcaModelo: sustituir(`ABB M3BP 355 LKB 4 / ${potenciaMotorKw} kW`),
        serie: sustituir("MOT-2018-00471"),
        potenciaOCaudal: `${potenciaMotorKw} kW (dato de ficha de estación)`,
      }
    case 2:
      return {
        rubroId: 2,
        etiqueta: "Bomba vertical — unidad 1",
        tag: sustituir("SEV-B01"),
        marcaModelo: sustituir("KSB UPA 350-480 / 1450 rpm"),
        serie: sustituir("BOM-2017-11203"),
        potenciaOCaudal: `${caudalUnitarioM3s} m³/s por unidad (referencia estación)`,
      }
    case 3:
      return {
        rubroId: 3,
        etiqueta: "Eje de motor — unidad intervenida",
        tag: sustituir("SEV-EJE-03"),
        marcaModelo: sustituir("Eje acero forjado Ø 120 mm × 1840 mm"),
        serie: sustituir("EJE-LOT-2026-07"),
        potenciaOCaudal: sustituir("Asociado a motor SEV-M03"),
      }
    case 4:
      return {
        rubroId: 4,
        etiqueta: "Motor en mantenimiento — unidad 2",
        tag: sustituir("SEV-M02"),
        marcaModelo: sustituir(`ABB M3BP 355 LKB 4 / ${potenciaMotorKw} kW`),
        serie: sustituir("MOT-2018-00472"),
        potenciaOCaudal: `${potenciaMotorKw} kW`,
      }
    default:
      return {
        rubroId,
        etiqueta: "Equipo",
        tag: sustituir("TAG"),
        marcaModelo: sustituir("Marca / modelo"),
        serie: sustituir("Serie"),
        potenciaOCaudal: sustituir("Capacidad"),
      }
  }
}
