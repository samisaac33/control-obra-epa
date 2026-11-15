/** Fondos suaves para filas del informe completo PDF (@react-pdf), por nombre de equipo. */

const FONDO_SIN_EQUIPO = "#f5f5f5"

const REGLAS_EQUIPO: { match: (nombre: string) => boolean; fondo: string }[] = [
  { match: (n) => /brazo\s+largo/i.test(n), fondo: "#DBEAFE" },
  { match: (n) => /brazo\s+corto/i.test(n), fondo: "#FFEDD5" },
  { match: (n) => /volqueta/i.test(n), fondo: "#DCFCE7" },
  { match: (n) => /tractor/i.test(n), fondo: "#F3E8FF" },
  { match: (n) => /payloader|pala\s*cargadora/i.test(n), fondo: "#FEF9C3" },
  { match: (n) => /motoniveladora/i.test(n), fondo: "#E0E7FF" },
  { match: (n) => /rodillo/i.test(n), fondo: "#FCE7F3" },
  { match: (n) => /gallineta/i.test(n), fondo: "#CCFBF1" },
  { match: (n) => /cama\s*baja/i.test(n), fondo: "#E0F2FE" },
]

/** Colores de respaldo determinísticos para equipos no listados arriba. */
const PALETA_EXTRA = [
  "#F5F5F4",
  "#ECFCCB",
  "#FAE8FF",
  "#FEE2E2",
  "#E7E5E4",
  "#D9F99D",
  "#BFDBFE",
  "#FDE68A",
] as const

function indicePaletaExtra(clave: string): number {
  let h = 0
  for (let i = 0; i < clave.length; i++) {
    h = (h * 31 + clave.charCodeAt(i)) >>> 0
  }
  return h % PALETA_EXTRA.length
}

/** Color de fondo de fila según la columna equipo (o máquina transportada en cama baja). */
export function fondoFilaPorEquipoInformePdf(nombreEquipo: string | null | undefined): string {
  const nombre = nombreEquipo?.trim()
  if (!nombre || nombre === "—") {
    return FONDO_SIN_EQUIPO
  }

  for (const regla of REGLAS_EQUIPO) {
    if (regla.match(nombre)) return regla.fondo
  }

  const clave = nombre.toLowerCase()
  return PALETA_EXTRA[indicePaletaExtra(clave)]!
}