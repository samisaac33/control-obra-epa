import assert from "node:assert/strict"

import type { RegistroDia } from "../src/data/registro-maquinaria"
import {
  construirInformeConsolidadoMaquinaria,
  diasVolquetaDesdeHoras,
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
      { equipo: "Volqueta", duracion: "dia_completo", accionista: "consorcio", frente: "poza_honda" },
    ],
  },
  {
    fecha: "2026-06-02",
    diaSemana: "Martes",
    trabajado: true,
    registros: [
      { equipo: "Excavadora brazo corto", duracion: "hora", cantidad: 4, accionista: "consorcio" },
      { equipo: "Volqueta", duracion: "medio_dia", accionista: "mauricio" },
    ],
  },
]

assert.equal(horasMaquinaDesdeRegistro(diasPrueba[0].registros[0]), 8)
assert.equal(horasMaquinaDesdeRegistro(diasPrueba[0].registros[2]), 4)
assert.equal(horasMaquinaDesdeRegistro(diasPrueba[1].registros[0]), 4)
assert.equal(diasVolquetaDesdeHoras(8), 1)
assert.equal(diasVolquetaDesdeHoras(260), 33)

const informe = construirInformeConsolidadoMaquinaria(diasPrueba)

const jimmy = informe.resumenPorAccionista.find((r) => r.accionista === "consorcio")!
const mauricio = informe.resumenPorAccionista.find((r) => r.accionista === "mauricio")!

const pozaJimmy = jimmy.filas.find((f) => f.frente === "poza_honda")!
assert.equal(pozaJimmy.horasMaquina, 8)
assert.equal(pozaJimmy.viajesArena, 3)
assert.equal(pozaJimmy.viajesMejoramiento, 0)
assert.equal(pozaJimmy.diasVolquetas, 1)

const pechicheMauricio = mauricio.filas.find((f) => f.frente === "pechiche")!
assert.equal(pechicheMauricio.horasMaquina, 4)
assert.equal(pechicheMauricio.viajesMejoramiento, 2)

const lasPenasE1Jimmy = jimmy.filas.find((f) => f.frente === null)!
assert.equal(lasPenasE1Jimmy.label, "Las Peñas etapa 1")
assert.equal(lasPenasE1Jimmy.horasMaquina, 4)

const lasPenasE1Mauricio = mauricio.filas.find((f) => f.frente === null)!
assert.ok(lasPenasE1Mauricio)
assert.equal(lasPenasE1Mauricio.diasVolquetas, 1)

const detalleE1 = informe.detallePorFrente.find((s) => s.frente === null)!
assert.ok(detalleE1.filas.some((f) => f.equipo === "Volqueta" && f.horasMaquina === 4))

assert.equal(jimmy.totales.horasMaquina, 12)
assert.equal(jimmy.totales.viajesArena, 3)
assert.equal(mauricio.totales.viajesMejoramiento, 2)

console.log("OK maquinaria-informe-consolidado")
