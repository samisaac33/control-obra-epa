-- Vincula jornadas de maquinaria al punto de avance que cierra el minitramo.

alter table public.tramo_registros_maquinaria
  add column if not exists punto_avance_id uuid references public.tramo_puntos_avance (id) on delete set null;

create unique index if not exists tramo_registros_maquinaria_punto_avance_id_idx
  on public.tramo_registros_maquinaria (punto_avance_id)
  where punto_avance_id is not null;

-- Backfill: fecha del registro = fecha de confirmación del punto final (letra par B, D, F…).
with puntos_fin as (
  select
    p.id as punto_id,
    p.tramo_id,
    p.created_at::date as fecha_punto
  from public.tramo_puntos_avance p
  where p.confirmado
    and p.rol is not null
    and (ascii(lower(p.rol)) - 96) % 2 = 0
),
candidatos as (
  select
    pf.punto_id,
    r.id as registro_id,
    count(*) over (partition by pf.punto_id) as coincidencias
  from puntos_fin pf
  join public.tramo_registros_maquinaria r
    on r.tramo_id = pf.tramo_id
   and r.punto_avance_id is null
   and r.fecha = pf.fecha_punto
)
update public.tramo_registros_maquinaria r
set punto_avance_id = c.punto_id
from candidatos c
where r.id = c.registro_id
  and c.coincidencias = 1;
