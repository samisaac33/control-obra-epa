import assert from "node:assert/strict"

import type { RegistroDia } from "../src/data/registro-maquinaria"
import { construirMatrizJimmyEquiposPorFrente } from "../src/lib/maquinaria-informe-jimmy-equipos"

const dias: RegistroDia[] = [
  {
    fecha: "2026-06-01",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Volqueta", duracion: "dia_completo", accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Tractor", duracion: "medio_dia", accionista: "mauricio", frente: "poza_honda" },
    ],
  },
]

const matriz = construirMatrizJimmyEquiposPorFrente(dias)
assert.equal(matriz.equipos.length, 1)
assert.equal(matriz.equipos[0], "Excavadora brazo largo")
assert.equal(matriz.filas.length, 1)
assert.equal(matriz.filas[0].horasPorEquipo["Excavadora brazo largo"], 8)
assert.equal(matriz.totalGeneral, 8)

console.log("OK maquinaria-informe-jimmy-equipos")
