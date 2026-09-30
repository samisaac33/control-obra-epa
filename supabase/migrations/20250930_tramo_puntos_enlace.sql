-- Minitramos ramificados: vértice de inicio explícito (p. ej. enlazar D desde B, no solo desde C).

alter table public.tramo_puntos_avance
  add column if not exists punto_enlace_id uuid references public.tramo_puntos_avance (id) on delete set null;

create index if not exists tramo_puntos_avance_enlace_idx
  on public.tramo_puntos_avance (punto_enlace_id)
  where punto_enlace_id is not null;

-- Backfill: enlace = punto confirmado anterior en el mismo tramo (por fecha).
with ordenados as (
  select
    id,
    tramo_id,
    lag(id) over (partition by tramo_id order by created_at asc) as prev_id,
    rol
  from public.tramo_puntos_avance
  where confirmado = true
)
update public.tramo_puntos_avance p
set punto_enlace_id = o.prev_id
from ordenados o
where p.id = o.id
  and o.prev_id is not null
  and o.rol is distinct from 'a'
  and p.punto_enlace_id is null;
