-- Enlace de jornadas de tramo al catálogo proyecto_equipos_maquinaria (nombres vigentes al renombrar).

alter table public.tramo_registros_maquinaria
  add column if not exists equipo_id uuid references public.proyecto_equipos_maquinaria (id) on delete set null;

create index if not exists tramo_registros_maquinaria_equipo_id_idx
  on public.tramo_registros_maquinaria (equipo_id)
  where equipo_id is not null;

-- Backfill: coincidencia exacta de nombre (mismo proyecto vía tramo).
update public.tramo_registros_maquinaria r
set equipo_id = e.id
from public.canal_tramos t,
     public.proyecto_equipos_maquinaria e
where r.tramo_id = t.id
  and e.proyecto_id = t.proyecto_id
  and r.equipo_id is null
  and lower(trim(r.equipo)) = lower(trim(e.nombre));

-- Backfill heurístico: substring unívico (mín. 8 caracteres en el fragmento más corto).
with candidatos as (
  select
    r.id as registro_id,
    e.id as equipo_id,
    count(*) over (partition by r.id) as coincidencias
  from public.tramo_registros_maquinaria r
  join public.canal_tramos t on t.id = r.tramo_id
  join public.proyecto_equipos_maquinaria e on e.proyecto_id = t.proyecto_id
  where r.equipo_id is null
    and length(trim(r.equipo)) >= 8
    and length(trim(e.nombre)) >= 8
    and (
      position(lower(trim(r.equipo)) in lower(trim(e.nombre))) > 0
      or position(lower(trim(e.nombre)) in lower(trim(r.equipo))) > 0
    )
)
update public.tramo_registros_maquinaria r
set equipo_id = c.equipo_id
from candidatos c
where r.id = c.registro_id
  and c.coincidencias = 1;
