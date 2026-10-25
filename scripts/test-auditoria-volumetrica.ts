import type { CanalAbscisa, RegistroMaquinariaJornada, TicketDesalojo } from "../src/data/auditoria/types"
import {
  calcularV1DesdeAbscisas,
  calcularV2DesdeTickets,
  calcularV3DesdeJornadas,
  evaluarSemaforoV1V2Desasolve,
  semaforoDesdeRatio,
  triangulacionVolumetrica,
} from "../src/lib/auditoria-volumetrica"

const rango = { desde: "2026-10-01", hasta: "2026-10-01" }

const abscisas: CanalAbscisa[] = [
  {
    id: "1",
    proyecto_id: "desasolve-canales",
    tramo_id: null,
    sector_nombre: "Test",
    abscisa_inicio: 0,
    abscisa_fin: 20,
    codigo_estacion: "0+000 a 0+020",
    geom_geojson: null,
    area_inicial_m2: 10,
    area_final_m2: 12,
    longitud_m: 20,
    volumen_teorico_m3: 220,
    estado: "ejecutado",
    fecha_ejecucion: "2026-10-01",
    created_at: "",
    updated_at: "",
  },
]

const tickets: TicketDesalojo[] = [
  {
    id: "t1",
    proyecto_id: "desasolve-canales",
    numero_ticket: "TK-000001",
    placa_volqueta: "ABC",
    chofer: null,
    capacidad_m3: 8,
    abscisa_id: "1",
    lat_origen: 0,
    lng_origen: 0,
    botadero_nombre: "B1",
    lat_destino: 0,
    lng_destino: 0,
    distancia_km: 3,
    fecha_hora_despacho: "2026-10-01T10:00:00.000Z",
    fecha_hora_recepcion: null,
    estado: "entregado",
    qr_hash: "x",
    observaciones: null,
  },
]

const jornadas: RegistroMaquinariaJornada[] = [
  {
    id: "j1",
    proyecto_id: "desasolve-canales",
    maquina_codigo: "EX-01",
    tipo_maquina: "excavadora_brazo_largo",
    horometro_inicio: 100,
    horometro_fin: 104,
    horas_efectivas: 4,
    fecha: "2026-10-01",
    combustible_galones: null,
  },
]

const v1 = calcularV1DesdeAbscisas(abscisas, rango)
const v2 = calcularV2DesdeTickets(
  Array.from({ length: 27 }, (_, i) => ({
    ...tickets[0]!,
    id: `t${i}`,
    numero_ticket: `TK-${i}`,
  })),
  rango
)
const v3 = calcularV3DesdeJornadas(jornadas, rango)

console.log("V1", v1, "V2", v2, "V3", v3)

const tri = triangulacionVolumetrica(abscisas, tickets, jornadas, rango)
console.log("Semaforo V1V2", tri.semaforoV1V2, tri.mensajeV1V2)

if (evaluarSemaforoV1V2Desasolve(220, 8).semaforo !== "verde") {
  throw new Error("V2 << V1 reconformación debería ser verde")
}
if (evaluarSemaforoV1V2Desasolve(100, 110).semaforo !== "rojo") {
  throw new Error("V2 > V1 debería ser rojo")
}

if (semaforoDesdeRatio(0.05) !== "verde") throw new Error("Umbral verde falló")
if (semaforoDesdeRatio(0.15) !== "amarillo") throw new Error("Umbral amarillo falló")
if (semaforoDesdeRatio(0.25) !== "rojo") throw new Error("Umbral rojo falló")

console.log("test-auditoria-volumetrica: OK")
