import type { EnsayoRequeridoGuia } from "@/data/guia-ensayos-contratante-severino"

import type { DiagramaPasoId } from "./diagramas-paso"

/** Mapa curado: un diagrama por cada paso de «Cómo se realiza». */
export const DIAGRAMA_IDS_POR_ENSAYO: Record<string, DiagramaPasoId[]> = {
  "Prueba de aislamiento inicial": [
    "loto",
    "desconexion",
    "megohmetro",
    "grafico_ip",
    "camara",
    "restaurar",
  ],
  "Integridad mecánica en maniobra (0 % daño)": [
    "inspeccion_visual",
    "puntos_izaje",
    "grua_control",
    "reinspeccion",
    "acta_firma",
  ],
  "Registro espectral de vibraciones base": [
    "bomba_regimen",
    "acelerometro",
    "espectro_fft",
    "tabla_iso",
    "no_aplica",
  ],
  "Bridas succión/descarga sin deformación": [
    "limpieza_brida",
    "lupa_visual",
    "pie_rey",
    "foto_escala",
    "aceptado",
  ],
  "Excentricidad (runout)": [
    "bancada_centros",
    "comparador",
    "girar_360",
    "formula_runout",
    "croquis_eje",
  ],
  "Balanceo dinámico G2.5": ["plano_correccion", "orden_g25", "informe_taller", "anexo_expediente"],
  "Líquidos penetrantes (END)": ["delimitar_zona", "kit_pt", "evaluar_indicaciones", "reporte_end"],
  "Resistencia de aislamiento, IP y DAR": [
    "motor_seco",
    "termometro",
    "megohmetro_tiempos",
    "calculo_ip",
    "dar",
  ],
  "Ajuste de rodamientos": ["manual_fabricante", "micrometro", "montaje_rodamiento", "registro_grasa"],
  "Balanceo dinámico del rotor G2.5": ["enviar_rotor", "verificar_g25", "archivar_actas"],
}

const FALLBACK_POR_TIPO: Record<EnsayoRequeridoGuia["tipo"], DiagramaPasoId[]> = {
  eléctrico: ["loto", "megohmetro", "grafico_ip", "camara", "restaurar"],
  mecánico: ["bancada_centros", "comparador", "espectro_fft", "informe_taller", "aceptado"],
  NDT: ["delimitar_zona", "kit_pt", "evaluar_indicaciones", "reporte_end"],
  documental: ["anexo_expediente", "acta_firma", "archivar_actas"],
  inspección: ["inspeccion_visual", "lupa_visual", "pie_rey", "foto_escala", "aceptado"],
}

export function diagramaIdParaPaso(ensayo: EnsayoRequeridoGuia, pasoIndex: number): DiagramaPasoId {
  const lista = DIAGRAMA_IDS_POR_ENSAYO[ensayo.nombre]
  if (lista && lista[pasoIndex]) {
    return lista[pasoIndex]
  }
  const fallback = FALLBACK_POR_TIPO[ensayo.tipo]
  return fallback[pasoIndex % fallback.length] ?? "inspeccion_visual"
}
