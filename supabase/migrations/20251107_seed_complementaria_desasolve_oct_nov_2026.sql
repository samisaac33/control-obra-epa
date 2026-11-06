-- Trabajos complementarios y pases cama baja (oct–nov 2026) — idempotente vía observaciones seed.

insert into public.proyecto_maquinaria_complementaria (
  proyecto_id,
  fecha,
  equipo,
  equipo_id,
  duracion_horas,
  descripcion_trabajo,
  ubicacion_referencia,
  observaciones
)
select
  'desasolve-canales',
  v.fecha::date,
  v.equipo_nombre,
  e.id,
  v.horas,
  'Trabajo complementario',
  v.ubicacion,
  v.seed_key
from (
  values
    (
      'seed:complementaria:alcantarilla:2026-10-28',
      '2026-10-28',
      'Excavadora brazo largo',
      3::numeric,
      'Alcantarilla (entrada a las Jaguas)'
    ),
    (
      'seed:complementaria:las-maravillas:2026-10-31',
      '2026-10-31',
      'Excavadora brazo largo',
      5::numeric,
      'Ducto cajón las maravillas'
    ),
    (
      'seed:complementaria:la-guayaba:2026-11-04',
      '2026-11-04',
      'Excavadora brazo largo',
      2::numeric,
      'La Guayaba'
    ),
    (
      'seed:complementaria:la-estancilla:2026-11-04',
      '2026-11-04',
      'Excavadora brazo largo',
      2::numeric,
      'La Estancilla'
    )
) as v(seed_key, fecha, equipo_nombre, horas, ubicacion)
join public.proyecto_equipos_maquinaria e
  on e.proyecto_id = 'desasolve-canales'
 and lower(e.nombre) = lower(v.equipo_nombre)
where not exists (
  select 1
  from public.proyecto_maquinaria_complementaria c
  where c.proyecto_id = 'desasolve-canales'
    and c.observaciones = v.seed_key
);

insert into public.proyecto_movimientos_cama_baja (
  proyecto_id,
  fecha,
  cama_baja,
  maquina_transportada,
  maquina_equipo_id,
  origen,
  destino,
  observaciones
)
select
  'desasolve-canales',
  v.fecha::date,
  v.cama_baja,
  v.maquina_nombre,
  e.id,
  v.origen,
  v.destino,
  v.seed_key
from (
  values
    (
      'seed:cama-baja:alcantarilla:2026-10-28',
      '2026-10-28',
      'MIT',
      'Excavadora brazo largo',
      null::text,
      'Alcantarilla (entrada a las Jaguas)'
    ),
    (
      'seed:cama-baja:las-maravillas:2026-10-31',
      '2026-10-31',
      'MIT',
      'Excavadora brazo largo',
      null::text,
      'Ducto cajón las maravillas'
    ),
    (
      'seed:cama-baja:la-guayaba:2026-11-04',
      '2026-11-04',
      'Consorcio',
      'Excavadora brazo largo',
      'San Eloy',
      'La Guayaba'
    ),
    (
      'seed:cama-baja:la-estancilla:2026-11-04',
      '2026-11-04',
      'Consorcio',
      'Excavadora brazo largo',
      'La Guayaba',
      'La Estancilla'
    )
) as v(seed_key, fecha, cama_baja, maquina_nombre, origen, destino)
join public.proyecto_equipos_maquinaria e
  on e.proyecto_id = 'desasolve-canales'
 and lower(e.nombre) = lower(v.maquina_nombre)
where not exists (
  select 1
  from public.proyecto_movimientos_cama_baja m
  where m.proyecto_id = 'desasolve-canales'
    and m.observaciones = v.seed_key
);
