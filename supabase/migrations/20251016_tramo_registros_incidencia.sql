-- Incidencias / hechos extraordinarios (desde mapa), en la misma tabla que jornadas.

alter table public.tramo_registros_maquinaria
  add column if not exists es_incidencia boolean not null default false;

create index if not exists tramo_registros_maquinaria_incidencia_idx
  on public.tramo_registros_maquinaria (tramo_id, fecha desc)
  where es_incidencia = true;
