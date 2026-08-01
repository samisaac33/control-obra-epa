export type Accionista = "mauricio" | "consorcio"

export type DuracionEquipo =
  | "dia_completo"
  | "medio_dia"
  | "hora"
  | "viajes"
  | "actividad"

export type RegistroEquipo = {
  equipo: string
  duracion: DuracionEquipo
  cantidad?: number
  accionista: Accionista
  nota?: string
}

export type RegistroDia = {
  fecha: string
  diaSemana: string
  trabajado: boolean
  registros: RegistroEquipo[]
}

export const PERIODO_MAQUINARIA = {
  inicio: "2026-05-11",
  fin: "2026-06-28",
  etiqueta: "11 mayo – 28 junio 2026",
} as const

export const ACCIONISTA_META = {
  mauricio: {
    label: "Mauricio",
    badgeClass:
      "border-amber-500/60 bg-amber-50 text-amber-950 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-100",
    dotClass: "bg-amber-500",
    chipClass: "border-amber-500/40 bg-amber-50 text-amber-900",
    celdaPlena: "bg-amber-500",
    celdaMedia: "bg-amber-400",
    celdaBaja: "bg-amber-300",
  },
  consorcio: {
    label: "Jimmy",
    badgeClass:
      "border-blue-600/60 bg-blue-50 text-blue-950 ring-1 ring-blue-500/20 dark:bg-blue-950/40 dark:text-blue-100",
    dotClass: "bg-blue-600",
    chipClass: "border-blue-500/40 bg-blue-50 text-blue-900",
    celdaPlena: "bg-blue-600",
    celdaMedia: "bg-blue-500",
    celdaBaja: "bg-blue-400",
  },
} as const

export const REGISTRO_MAQUINARIA: RegistroDia[] = [
  {
    fecha: "2026-05-11",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Tractor", duracion: "medio_dia", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-12",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-13",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "medio_dia", accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "medio_dia", cantidad: 2, accionista: "mauricio" },
    ],
  },
  {
    fecha: "2026-05-14",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      {
        equipo: "Excavadora brazo largo",
        duracion: "medio_dia",
        accionista: "consorcio",
        nota: "Se dañó",
      },
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "medio_dia", accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "medio_dia", cantidad: 2, accionista: "mauricio" },
    ],
  },
  {
    fecha: "2026-05-15",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      {
        equipo: "Excavadora brazo largo",
        duracion: "medio_dia",
        accionista: "consorcio",
        nota: "Se dañó",
      },
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "medio_dia", cantidad: 1, accionista: "mauricio" },
    ],
  },
  {
    fecha: "2026-05-16",
    diaSemana: "Sábado",
    trabajado: true,
    registros: [
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Viajes de arena", duracion: "viajes", cantidad: 8, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-18",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "medio_dia", cantidad: 1, accionista: "mauricio" },
      { equipo: "Viajes de arena", duracion: "viajes", cantidad: 3, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-19",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "mauricio" },
      { equipo: "Viajes de arena", duracion: "viajes", cantidad: 3, accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-20",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-21",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "medio_dia", accionista: "mauricio" },
      { equipo: "Volqueta", duracion: "medio_dia", cantidad: 2, accionista: "mauricio" },
      {
        equipo: "Descarga de tubos de hormigón",
        duracion: "actividad",
        accionista: "consorcio",
      },
    ],
  },
  {
    fecha: "2026-05-22",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "medio_dia", cantidad: 1, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-23",
    diaSemana: "Sábado",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-25",
    diaSemana: "Lunes",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-05-26",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "mauricio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "mauricio" },
    ],
  },
  {
    fecha: "2026-05-27",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-28",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-29",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-05-30",
    diaSemana: "Sábado",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-01",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "mauricio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "mauricio" },
    ],
  },
  {
    fecha: "2026-06-02",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "mauricio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "mauricio" },
    ],
  },
  {
    fecha: "2026-06-03",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "mauricio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "mauricio" },
    ],
  },
  {
    fecha: "2026-06-04",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
      { equipo: "Gallineta", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-05",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
      { equipo: "Gallineta", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-06",
    diaSemana: "Sábado",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 1, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-08",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-09",
    diaSemana: "Martes",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-06-10",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-11",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Tractor", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-12",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      {
        equipo: "Descarga de segundo lote de tubos de hormigón",
        duracion: "actividad",
        accionista: "consorcio",
      },
    ],
  },
  {
    fecha: "2026-06-13",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-06-15",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Gallineta", duracion: "medio_dia", accionista: "consorcio" },
      { equipo: "Instalación de tubos", duracion: "actividad", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-16",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "medio_dia", accionista: "consorcio" },
      { equipo: "Instalación de tubos", duracion: "actividad", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-17",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Viajes de arena", duracion: "viajes", cantidad: 3, accionista: "consorcio" },
      { equipo: "Instalación de tubos", duracion: "actividad", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-18",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Viajes de arena", duracion: "viajes", cantidad: 6, accionista: "consorcio" },
      { equipo: "Instalación de tubos", duracion: "actividad", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-19",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Instalación de tubos", duracion: "actividad", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-20",
    diaSemana: "Sábado",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Instalación de tubos", duracion: "actividad", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-22",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-23",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "medio_dia", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-24",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-25",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-26",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "dia_completo", cantidad: 2, accionista: "consorcio" },
    ],
  },
  {
    fecha: "2026-06-28",
    diaSemana: "Domingo",
    trabajado: true,
    registros: [
      { equipo: "Motoniveladora", duracion: "dia_completo", accionista: "consorcio" },
      { equipo: "Rodillo", duracion: "dia_completo", accionista: "consorcio" },
    ],
  },
]
