-- Trabajos complementarios y pases cama baja (sept–oct 2026) — idempotente vía observaciones seed.

insert into public.proyecto_equipos_maquinaria (proyecto_id, nombre)
select v.proyecto_id, v.nombre
from (
  values
    ('desasolve-canales', 'Motoniveladora'),
    ('desasolve-canales', 'Excavadora brazo corto'),
    ('desasolve-canales', 'Excavadora brazo largo')
) as v(proyecto_id, nombre)
where not exists (
  select 1
  from public.proyecto_equipos_maquinaria e
  where e.proyecto_id = v.proyecto_id
    and lower(e.nombre) = lower(v.nombre)
);

-- Jornadas complementarias
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
    ('seed:complementaria:portoviejo:2026-09-29', '2026-09-29', 'Motoniveladora', 7::numeric, 'Portoviejo'),
    ('seed:complementaria:las-coronas:2026-09-24', '2026-09-24', 'Excavadora brazo corto', 6::numeric, 'Las Coronas'),
    ('seed:complementaria:las-coronas:2026-09-25', '2026-09-25', 'Excavadora brazo corto', 6::numeric, 'Las Coronas'),
    ('seed:complementaria:las-coronas:2026-09-26', '2026-09-26', 'Excavadora brazo corto', 6::numeric, 'Las Coronas'),
    ('seed:complementaria:santa-teresa:2026-09-26', '2026-09-26', 'Excavadora brazo largo', 5.33::numeric, 'Santa Teresa'),
    ('seed:complementaria:santa-teresa:2026-09-28', '2026-09-28', 'Excavadora brazo largo', 5.33::numeric, 'Santa Teresa'),
    ('seed:complementaria:santa-teresa:2026-10-01', '2026-10-01', 'Excavadora brazo largo', 5.34::numeric, 'Santa Teresa'),
    ('seed:complementaria:poza-honda:2026-10-09', '2026-10-09', 'Excavadora brazo largo', 7::numeric, 'Poza Honda'),
    ('seed:complementaria:poza-honda:2026-10-10', '2026-10-10', 'Excavadora brazo largo', 7::numeric, 'Poza Honda'),
    ('seed:complementaria:poza-honda:2026-10-11', '2026-10-11', 'Excavadora brazo largo', 7::numeric, 'Poza Honda'),
    ('seed:complementaria:san-clemente:2026-10-15', '2026-10-15', 'Excavadora brazo corto', 5::numeric, 'San Clemente'),
    ('seed:complementaria:san-clemente:2026-10-16', '2026-10-16', 'Excavadora brazo corto', 5::numeric, 'San Clemente')
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

-- Pases cama baja
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
      'seed:cama-baja:santa-teresa-ida:2026-09-26',
      '2026-09-26',
      'Ministerio de Agricultura',
      'Excavadora brazo largo',
      'Ducto cajón Las Maravillas',
      'Santa Teresa'
    ),
    (
      'seed:cama-baja:santa-teresa-vuelta:2026-10-01',
      '2026-10-01',
      'EPA',
      'Excavadora brazo largo',
      'Santa Teresa',
      'Patio de máquinas'
    ),
    (
      'seed:cama-baja:poza-honda:2026-10-09',
      '2026-10-09',
      'Consorcio',
      'Excavadora brazo largo',
      'Patio de máquinas',
      'Poza Honda'
    ),
    (
      'seed:cama-baja:san-clemente:2026-10-15',
      '2026-10-15',
      'Consorcio',
      'Excavadora brazo corto',
      'Higuerón',
      'San Clemente'
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
