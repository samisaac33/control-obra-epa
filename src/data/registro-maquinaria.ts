import {
  PROYECTO_DESASOLVE_CANALES,
  PROYECTO_EMERGENCIA_MANABI,
} from "@/src/data/proyectos/catalog"

export type Accionista = "mauricio" | "consorcio"

export type FrenteObra = "cienega" | "pechiche" | "poza_honda" | "las_penas"

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
  frente?: FrenteObra
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
  fin: "2026-09-16",
  etiqueta: "11 mayo – 16 septiembre 2026",
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

export const FRENTE_META = {
  cienega: { label: "Ciénega", abrev: "Cien." },
  poza_honda: { label: "Poza Honda", abrev: "P.H." },
  pechiche: { label: "Pechiche", abrev: "Pech." },
  las_penas: { label: "Las Peñas", abrev: "L.P." },
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
  {
    fecha: "2026-06-29",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-06-30",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-01",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-02",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-03",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-04",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-07-06",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-07",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-08",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-09",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-10",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-11",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-07-13",
    diaSemana: "Lunes",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-07-14",
    diaSemana: "Martes",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-07-15",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
      { equipo: "Payloader", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-16",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-17",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-18",
    diaSemana: "Sábado",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-20",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-21",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-22",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-23",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "cienega" },
    ],
  },
  {
    fecha: "2026-07-24",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "medio_dia", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-07-25",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-07-27",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-07-28",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "medio_dia", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-07-29",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-07-30",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-07-31",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "medio_dia", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-01",
    diaSemana: "Sábado",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-03",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-04",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-05",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-06",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-07",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "medio_dia", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-08",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-08-10",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-11",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-12",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-08-13",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "medio_dia", accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-08-14",
    diaSemana: "Viernes",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-08-15",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-08-17",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-08-18",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-08-19",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "medio_dia", accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-08-20",
    diaSemana: "Jueves",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-08-21",
    diaSemana: "Viernes",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-08-22",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-08-24",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 5, accionista: "consorcio", frente: "pechiche" },
      { equipo: "Motoniveladora", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-08-25",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 5, accionista: "consorcio", frente: "pechiche" },
      { equipo: "Motoniveladora", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Rodillo", duracion: "dia_completo", accionista: "consorcio", frente: "pechiche" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 10, accionista: "consorcio", frente: "las_penas" },
    ],
  },
  {
    fecha: "2026-08-26",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Rodillo", duracion: "dia_completo", accionista: "consorcio", frente: "las_penas" },
      { equipo: "Motoniveladora", duracion: "dia_completo", accionista: "consorcio", frente: "las_penas" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 14, accionista: "mauricio", frente: "las_penas" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 10, accionista: "consorcio", frente: "las_penas" },
    ],
  },
  {
    fecha: "2026-08-27",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Rodillo", duracion: "dia_completo", accionista: "consorcio", frente: "las_penas" },
      { equipo: "Motoniveladora", duracion: "dia_completo", accionista: "consorcio", frente: "las_penas" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 25, accionista: "mauricio", frente: "las_penas" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 15, accionista: "consorcio", frente: "las_penas" },
    ],
  },
  {
    fecha: "2026-08-28",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Rodillo", duracion: "dia_completo", accionista: "consorcio", frente: "las_penas" },
      { equipo: "Motoniveladora", duracion: "dia_completo", accionista: "consorcio", frente: "las_penas" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 20, accionista: "mauricio", frente: "las_penas" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 18, accionista: "consorcio", frente: "las_penas" },
    ],
  },
  {
    fecha: "2026-08-29",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-08-31",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-01",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-02",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-03",
    diaSemana: "Jueves",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-04",
    diaSemana: "Viernes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-07",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-08",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-09",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-10",
    diaSemana: "Jueves",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-09-11",
    diaSemana: "Viernes",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-09-12",
    diaSemana: "Sábado",
    trabajado: false,
    registros: [],
  },
  {
    fecha: "2026-09-14",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-15",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-09-16",
    diaSemana: "Miércoles",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", cantidad: 2, accionista: "consorcio", frente: "poza_honda" },
    ],
  },
]

export const PERIODO_MAQUINARIA_VACIO = {
  inicio: "",
  fin: "",
  etiqueta: "Sin registros aún",
} as const

export function getRegistroMaquinaria(proyectoId: string): RegistroDia[] {
  if (proyectoId === PROYECTO_EMERGENCIA_MANABI) {
    return REGISTRO_MAQUINARIA
  }
  if (proyectoId === PROYECTO_DESASOLVE_CANALES) {
    return []
  }
  return []
}

export function getPeriodoMaquinaria(proyectoId: string): typeof PERIODO_MAQUINARIA | typeof PERIODO_MAQUINARIA_VACIO {
  if (proyectoId === PROYECTO_EMERGENCIA_MANABI) {
    return PERIODO_MAQUINARIA
  }
  return PERIODO_MAQUINARIA_VACIO
}
