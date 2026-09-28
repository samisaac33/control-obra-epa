import { Circle, Line, Path, Rect, Svg } from "@react-pdf/renderer"
import type { ReactElement } from "react"

const W = 64
const H = 64
const STROKE = "#1e3a5f"
const FILL = "#e8eef4"
const ACCENT = "#2563eb"

export type DiagramaPasoId =
  | "loto"
  | "desconexion"
  | "megohmetro"
  | "grafico_ip"
  | "camara"
  | "restaurar"
  | "inspeccion_visual"
  | "puntos_izaje"
  | "grua_control"
  | "reinspeccion"
  | "acta_firma"
  | "bomba_regimen"
  | "acelerometro"
  | "espectro_fft"
  | "tabla_iso"
  | "no_aplica"
  | "limpieza_brida"
  | "lupa_visual"
  | "pie_rey"
  | "foto_escala"
  | "aceptado"
  | "bancada_centros"
  | "comparador"
  | "girar_360"
  | "formula_runout"
  | "croquis_eje"
  | "plano_correccion"
  | "orden_g25"
  | "informe_taller"
  | "anexo_expediente"
  | "delimitar_zona"
  | "kit_pt"
  | "evaluar_indicaciones"
  | "reporte_end"
  | "motor_seco"
  | "termometro"
  | "megohmetro_tiempos"
  | "calculo_ip"
  | "dar"
  | "manual_fabricante"
  | "micrometro"
  | "montaje_rodamiento"
  | "registro_grasa"
  | "enviar_rotor"
  | "verificar_g25"
  | "archivar_actas"

function wrap(children: ReactElement) {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect x={1} y={1} width={W - 2} height={H - 2} rx={4} fill={FILL} stroke={STROKE} strokeWidth={0.8} />
      {children}
    </Svg>
  )
}

const DIAGRAMAS: Record<DiagramaPasoId, () => ReactElement> = {
  loto: () =>
    wrap(
      <>
        <Rect x={12} y={18} width={40} height={28} rx={2} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Path d="M 20 26 L 44 26" stroke={STROKE} strokeWidth={1.2} />
        <Circle cx={32} cy={34} r={6} fill="#dc2626" stroke={STROKE} strokeWidth={0.8} />
</>
    ),
  desconexion: () =>
    wrap(
      <>
        <Line x1={16} y1={32} x2={48} y2={32} stroke={STROKE} strokeWidth={2} />
        <Circle cx={20} cy={32} r={4} fill={ACCENT} />
        <Circle cx={44} cy={32} r={4} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Path d="M 28 24 L 36 40 M 36 24 L 28 40" stroke="#dc2626" strokeWidth={1.5} />
      </>
    ),
  megohmetro: () =>
    wrap(
      <>
        <Rect x={14} y={16} width={36} height={32} rx={3} fill="#fff" stroke={STROKE} strokeWidth={1} />
<Line x1={20} y1={40} x2={14} y2={48} stroke={STROKE} strokeWidth={1} />
        <Line x1={44} y1={40} x2={50} y2={48} stroke={STROKE} strokeWidth={1} />
      </>
    ),
  grafico_ip: () =>
    wrap(
      <>
        <Path d="M 14 44 L 22 38 L 30 40 L 38 28 L 46 24 L 50 20" stroke={ACCENT} strokeWidth={1.5} fill="none" />
        <Line x1={12} y1={48} x2={52} y2={48} stroke={STROKE} strokeWidth={0.8} />
</>
    ),
  camara: () =>
    wrap(
      <>
        <Rect x={18} y={22} width={28} height={20} rx={3} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Circle cx={32} cy={32} r={6} fill={FILL} stroke={STROKE} strokeWidth={1} />
        <Rect x={28} y={18} width={8} height={6} fill={STROKE} />
      </>
    ),
  restaurar: () =>
    wrap(
      <>
        <Path d="M 32 18 A 14 14 0 1 1 20 36" stroke={ACCENT} strokeWidth={1.5} fill="none" />
        <Path d="M 18 22 L 20 36 L 26 30" stroke={ACCENT} strokeWidth={1.2} fill="none" />
        <Line x1={16} y1={32} x2={48} y2={32} stroke={STROKE} strokeWidth={1.5} />
      </>
    ),
  inspeccion_visual: () =>
    wrap(
      <>
        <Circle cx={28} cy={30} r={10} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Circle cx={28} cy={30} r={4} fill={ACCENT} />
        <Line x1={36} y1={38} x2={48} y2={50} stroke={STROKE} strokeWidth={2} />
      </>
    ),
  puntos_izaje: () =>
    wrap(
      <>
        <Rect x={24} y={20} width={16} height={28} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Line x1={32} y1={12} x2={32} y2={20} stroke={STROKE} strokeWidth={1.5} />
        <Path d="M 22 14 L 32 8 L 42 14" stroke={ACCENT} strokeWidth={1.2} fill="none" />
        <Circle cx={32} cy={26} r={3} fill="#22c55e" />
      </>
    ),
  grua_control: () =>
    wrap(
      <>
        <Line x1={32} y1={10} x2={32} y2={22} stroke={STROKE} strokeWidth={2} />
        <Line x1={18} y1={22} x2={46} y2={22} stroke={STROKE} strokeWidth={1.5} />
        <Line x1={32} y1={22} x2={32} y2={36} stroke={STROKE} strokeWidth={1} />
        <Rect x={22} y={36} width={20} height={14} fill="#fff" stroke={STROKE} strokeWidth={1} />
      </>
    ),
  reinspeccion: () =>
    wrap(
      <>
        <Rect x={14} y={20} width={18} height={24} fill="#fff" stroke={STROKE} strokeWidth={0.8} />
        <Rect x={32} y={20} width={18} height={24} fill="#fff" stroke={STROKE} strokeWidth={0.8} />
        <Path d="M 26 32 L 30 36 L 38 28" stroke="#22c55e" strokeWidth={1.5} fill="none" />
      </>
    ),
  acta_firma: () =>
    wrap(
      <>
        <Rect x={16} y={14} width={32} height={38} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Line x1={20} y1={22} x2={44} y2={22} stroke="#ccc" strokeWidth={0.8} />
        <Line x1={20} y1={28} x2={44} y2={28} stroke="#ccc" strokeWidth={0.8} />
        <Path d="M 22 42 Q 28 36 34 42 T 46 38" stroke={ACCENT} strokeWidth={1.2} fill="none" />
      </>
    ),
  bomba_regimen: () =>
    wrap(
      <>
        <Circle cx={32} cy={34} r={14} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Circle cx={32} cy={34} r={4} fill={STROKE} />
        <Path d="M 32 20 L 36 28 L 32 26 L 28 28 Z" fill={ACCENT} />
      </>
    ),
  acelerometro: () =>
    wrap(
      <>
        <Rect x={26} y={16} width={12} height={20} fill={STROKE} />
        <Rect x={22} y={36} width={20} height={8} fill="#fff" stroke={STROKE} strokeWidth={0.8} />
        <Line x1={32} y1={44} x2={32} y2={52} stroke={STROKE} strokeWidth={1} />
      </>
    ),
  espectro_fft: () =>
    wrap(
      <>
        {[14, 20, 26, 32, 38, 44].map((x, i) => (
          <Rect key={x} x={x} y={48 - (i % 3) * 8 - 8} width={4} height={(i % 3) * 8 + 8} fill={ACCENT} />
        ))}
</>
    ),
  tabla_iso: () =>
    wrap(
      <>
        <Rect x={14} y={18} width={36} height={28} fill="#fff" stroke={STROKE} strokeWidth={0.8} />
        <Line x1={14} y1={26} x2={50} y2={26} stroke={STROKE} strokeWidth={0.6} />
        <Line x1={14} y1={34} x2={50} y2={34} stroke={STROKE} strokeWidth={0.6} />
</>
    ),
  no_aplica: () =>
    wrap(
      <>
        <Rect x={16} y={18} width={32} height={28} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Line x1={20} y1={22} x2={44} y2={42} stroke="#94a3b8" strokeWidth={2} />
</>
    ),
  limpieza_brida: () =>
    wrap(
      <>
        <Circle cx={32} cy={34} r={16} fill="#fff" stroke={STROKE} strokeWidth={1.2} />
        <Circle cx={32} cy={34} r={6} fill={FILL} stroke={STROKE} strokeWidth={0.8} />
        <Path d="M 48 20 L 52 16 M 50 28 L 56 26" stroke={ACCENT} strokeWidth={1} />
      </>
    ),
  lupa_visual: () =>
    wrap(
      <>
        <Circle cx={28} cy={28} r={12} fill="#fff" stroke={STROKE} strokeWidth={1.2} />
        <Line x1={36} y1={36} x2={48} y2={48} stroke={STROKE} strokeWidth={2} />
        <Circle cx={24} cy={26} r={2} fill="#dc2626" />
      </>
    ),
  pie_rey: () =>
    wrap(
      <>
        <Rect x={14} y={28} width={36} height={4} fill={STROKE} />
        <Line x1={20} y1={20} x2={20} y2={48} stroke={ACCENT} strokeWidth={1.5} />
        <Line x1={44} y1={24} x2={44} y2={44} stroke={ACCENT} strokeWidth={1.5} />
      </>
    ),
  foto_escala: () =>
    wrap(
      <>
        <Rect x={18} y={20} width={28} height={22} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Line x1={22} y1={46} x2={42} y2={46} stroke={STROKE} strokeWidth={1} />
</>
    ),
  aceptado: () =>
    wrap(
      <>
        <Circle cx={32} cy={32} r={18} fill="#fff" stroke="#22c55e" strokeWidth={2} />
        <Path d="M 22 32 L 28 38 L 42 24" stroke="#22c55e" strokeWidth={2.5} fill="none" />
      </>
    ),
  bancada_centros: () =>
    wrap(
      <>
        <Line x1={12} y1={40} x2={52} y2={40} stroke={STROKE} strokeWidth={2} />
        <Line x1={20} y1={40} x2={20} y2={28} stroke={STROKE} strokeWidth={1} />
        <Line x1={44} y1={40} x2={44} y2={28} stroke={STROKE} strokeWidth={1} />
        <Line x1={14} y1={28} x2={50} y2={28} stroke={ACCENT} strokeWidth={2} />
      </>
    ),
  comparador: () =>
    wrap(
      <>
        <Rect x={28} y={14} width={8} height={12} fill={STROKE} />
        <Line x1={32} y1={26} x2={32} y2={36} stroke={STROKE} strokeWidth={1} />
        <Circle cx={32} cy={42} r={3} fill={ACCENT} />
        <Line x1={16} y1={42} x2={48} y2={42} stroke={STROKE} strokeWidth={1.5} />
      </>
    ),
  girar_360: () =>
    wrap(
      <>
        <Circle cx={32} cy={34} r={14} fill="none" stroke={STROKE} strokeWidth={1.2} />
        <Path d="M 32 20 L 36 16 L 32 12 L 28 16 Z" fill={ACCENT} />
</>
    ),
  formula_runout: () =>
    wrap(
      <>
<Line x1={18} y1={30} x2={46} y2={30} stroke={STROKE} strokeWidth={0.8} />
</>
    ),
  croquis_eje: () =>
    wrap(
      <>
        <Line x1={14} y1={32} x2={50} y2={32} stroke={STROKE} strokeWidth={2} />
        <Circle cx={20} cy={32} r={4} fill={FILL} stroke={STROKE} strokeWidth={0.8} />
        <Circle cx={44} cy={32} r={4} fill={FILL} stroke={STROKE} strokeWidth={0.8} />
        <Path d="M 28 24 L 36 40" stroke={ACCENT} strokeWidth={1} />
      </>
    ),
  plano_correccion: () =>
    wrap(
      <>
        <Rect x={16} y={16} width={32} height={32} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Circle cx={32} cy={32} r={8} fill="none" stroke={ACCENT} strokeWidth={1} />
        <Line x1={32} y1={24} x2={32} y2={40} stroke={STROKE} strokeWidth={0.8} />
      </>
    ),
  orden_g25: () =>
    wrap(
      <>
        <Rect x={14} y={14} width={36} height={36} fill="#fff" stroke={STROKE} strokeWidth={1} />

</>
    ),
  informe_taller: () =>
    wrap(
      <>
        <Rect x={18} y={12} width={28} height={40} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Rect x={22} y={16} width={20} height={8} fill={FILL} />
        <Line x1={22} y1={30} x2={42} y2={30} stroke="#ccc" strokeWidth={0.6} />
        <Line x1={22} y1={36} x2={38} y2={36} stroke="#ccc" strokeWidth={0.6} />
      </>
    ),
  anexo_expediente: () =>
    wrap(
      <>
        <Rect x={20} y={14} width={24} height={32} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Rect x={24} y={18} width={24} height={32} fill={FILL} stroke={STROKE} strokeWidth={0.8} />
        <Path d="M 28 38 L 32 42 L 40 34" stroke="#22c55e" strokeWidth={1.2} fill="none" />
      </>
    ),
  delimitar_zona: () =>
    wrap(
      <>
        <Line x1={16} y1={32} x2={48} y2={32} stroke={STROKE} strokeWidth={3} />
        <Rect x={22} y={24} width={20} height={16} fill="none" stroke="#dc2626" strokeWidth={1.5} />
      </>
    ),
  kit_pt: () =>
    wrap(
      <>
        <Rect x={14} y={22} width={12} height={24} fill="#93c5fd" />
        <Rect x={26} y={22} width={12} height={24} fill="#fde68a" />
        <Rect x={38} y={22} width={12} height={24} fill="#fff" stroke={STROKE} strokeWidth={0.8} />
</>
    ),
  evaluar_indicaciones: () =>
    wrap(
      <>
        <Line x1={20} y1={28} x2={44} y2={36} stroke="#dc2626" strokeWidth={1.5} />
        <Circle cx={32} cy={32} r={14} fill="none" stroke={STROKE} strokeWidth={1} />
        <Path d="M 26 40 L 30 44 L 38 36" stroke="#22c55e" strokeWidth={1.2} fill="none" />
      </>
    ),
  reporte_end: () =>
    wrap(
      <>
        <Rect x={16} y={14} width={32} height={38} fill="#fff" stroke={STROKE} strokeWidth={1} />
<Path d="M 22 38 L 26 42 L 34 34" stroke={ACCENT} strokeWidth={1} fill="none" />
      </>
    ),
  motor_seco: () =>
    wrap(
      <>
        <Rect x={20} y={22} width={24} height={28} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Path d="M 24 18 Q 32 10 40 18" stroke={ACCENT} strokeWidth={1} fill="none" />
        <Line x1={26} y1={18} x2={26} y2={14} stroke={ACCENT} strokeWidth={0.8} />
        <Line x1={38} y1={18} x2={38} y2={14} stroke={ACCENT} strokeWidth={0.8} />
      </>
    ),
  termometro: () =>
    wrap(
      <>
        <Circle cx={32} cy={40} r={10} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Line x1={32} y1={16} x2={32} y2={32} stroke={STROKE} strokeWidth={2} />
        <Circle cx={32} cy={40} r={4} fill="#dc2626" />
      </>
    ),
  megohmetro_tiempos: () =>
    wrap(
      <>
        <Rect x={14} y={20} width={36} height={24} fill="#fff" stroke={STROKE} strokeWidth={1} />

</>
    ),
  calculo_ip: () =>
    wrap(
      <>

</>
    ),
  dar: () =>
    wrap(
      <>

</>
    ),
  manual_fabricante: () =>
    wrap(
      <>
        <Rect x={16} y={14} width={32} height={40} fill="#fff" stroke={STROKE} strokeWidth={1} />
<Line x1={20} y1={34} x2={44} y2={34} stroke="#ccc" strokeWidth={0.6} />
      </>
    ),
  micrometro: () =>
    wrap(
      <>
        <Rect x={12} y={30} width={40} height={8} fill={STROKE} />
        <Line x1={24} y1={22} x2={24} y2={38} stroke={ACCENT} strokeWidth={2} />
        <Line x1={40} y1={26} x2={40} y2={34} stroke={ACCENT} strokeWidth={2} />
      </>
    ),
  montaje_rodamiento: () =>
    wrap(
      <>
        <Circle cx={32} cy={32} r={12} fill="#fff" stroke={STROKE} strokeWidth={1.2} />
        <Circle cx={32} cy={32} r={6} fill={FILL} stroke={STROKE} strokeWidth={0.8} />
        <Circle cx={32} cy={32} r={2} fill={STROKE} />
      </>
    ),
  registro_grasa: () =>
    wrap(
      <>
        <Rect x={16} y={18} width={32} height={28} fill="#fff" stroke={STROKE} strokeWidth={1} />
</>
    ),
  enviar_rotor: () =>
    wrap(
      <>
        <Rect x={14} y={28} width={20} height={16} fill="#fff" stroke={STROKE} strokeWidth={1} />
        <Path d="M 36 36 L 48 36 L 44 32 M 48 36 L 44 40" stroke={ACCENT} strokeWidth={1.2} fill="none" />
        <Circle cx={24} cy={36} r={6} fill="none" stroke={STROKE} strokeWidth={1} />
      </>
    ),
  verificar_g25: () =>
    wrap(
      <>
        <Rect x={14} y={16} width={36} height={32} fill="#fff" stroke={STROKE} strokeWidth={1} />
<Path d="M 22 40 L 26 44 L 38 32" stroke="#22c55e" strokeWidth={1.5} fill="none" />
      </>
    ),
  archivar_actas: () =>
    wrap(
      <>
        <Rect x={18} y={20} width={14} height={18} fill={FILL} stroke={STROKE} strokeWidth={0.8} />
        <Rect x={26} y={24} width={14} height={18} fill={FILL} stroke={STROKE} strokeWidth={0.8} />
        <Rect x={34} y={28} width={14} height={18} fill="#fff" stroke={STROKE} strokeWidth={0.8} />
      </>
    ),
}

export function DiagramaPaso({ id }: { id: DiagramaPasoId }) {
  const render = DIAGRAMAS[id] ?? DIAGRAMAS.inspeccion_visual
  return render()
}

/** Flujo horizontal de actividades por rubro (cajas + flechas). */
export function DiagramaFlujoRubro({ etiquetas }: { etiquetas: string[] }) {
  const n = etiquetas.length
  const boxW = Math.min(72, (W * 4) / n)
  const totalW = 468
  const startX = 0
  const gap = (totalW - n * boxW) / Math.max(n - 1, 1)

  const nodes: ReactElement[] = []
  etiquetas.forEach((_label, i) => {
    const x = startX + i * (boxW + gap)
    nodes.push(
      <Rect
        key={`box-${i}`}
        x={x}
        y={8}
        width={boxW}
        height={32}
        rx={3}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={0.8}
      />
    )
    nodes.push(
)
    if (i < n - 1) {
      nodes.push(
        <Line
          key={`arrow-${i}`}
          x1={x + boxW + 2}
          y1={24}
          x2={x + boxW + gap - 2}
          y2={24}
          stroke={ACCENT}
          strokeWidth={1}
        />
      )
    }
  })

  return (
    <Svg width={totalW} height={48} viewBox={`0 0 ${totalW} 48`}>
      {nodes}
    </Svg>
  )
}
