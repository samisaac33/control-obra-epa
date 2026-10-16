import assert from "node:assert/strict"

import type { RegistroDia } from "../src/data/registro-maquinaria"
import {
  construirInformeConsolidadoMaquinaria,
  horasMaquinaDesdeRegistro,
} from "../src/lib/maquinaria-informe-consolidado"

const diasPrueba: RegistroDia[] = [
  {
    fecha: "2026-06-01",
    diaSemana: "Lunes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo largo", duracion: "dia_completo", accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Viajes de arena", duracion: "viajes", cantidad: 3, accionista: "consorcio", frente: "poza_honda" },
      { equipo: "Tractor", duracion: "medio_dia", accionista: "mauricio", frente: "pechiche" },
      { equipo: "Viajes de material para vía", duracion: "viajes", cantidad: 2, accionista: "mauricio", frente: "pechiche" },
    ],
  },
  {
    fecha: "2026-06-02",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "hora", cantidad: 4, accionista: "consorcio" },
    ],
  },
]

assert.equal(horasMaquinaDesdeRegistro(diasPrueba[0].registros[0]), 8)
assert.equal(horasMaquinaDesdeRegistro(diasPrueba[0].registros[2]), 4)
assert.equal(horasMaquinaDesdeRegistro(diasPrueba[1].registros[0]), 4)

const informe = construirInformeConsolidadoMaquinaria(diasPrueba)

const poza = informe.filas.find((f) => f.frente === "poza_honda")
assert.ok(poza)
assert.equal(poza!.horasMaquina, 8)
assert.equal(poza!.viajesJimmy, 3)
assert.equal(poza!.viajesMauricio, 0)
assert.equal(poza!.viajesTotal, 3)

const pechiche = informe.filas.find((f) => f.frente === "pechiche")
assert.ok(pechiche)
assert.equal(pechiche!.horasMaquina, 4)
assert.equal(pechiche!.viajesMauricio, 2)

const lasPenasE1 = informe.filas.find((f) => f.frente === null)
assert.ok(lasPenasE1)
assert.equal(lasPenasE1!.label, "Las Peñas etapa 1")
assert.equal(lasPenasE1!.horasMaquina, 4)

assert.equal(informe.detallePorFrente.length, informe.filas.length)
const detalleE1 = informe.detallePorFrente.find((s) => s.frente === null)
assert.ok(detalleE1)
assert.ok(detalleE1!.filas.some((f) => f.equipo === "Excavadora brazo corto" && f.horasMaquina === 4))

assert.equal(informe.totales.horasMaquina, 16)
assert.equal(informe.totales.viajesJimmy, 3)
assert.equal(informe.totales.viajesMauricio, 2)
assert.equal(informe.totales.viajesTotal, 5)

console.log("OK maquinaria-informe-consolidado")
