-- Varios puntos con parpadeo de frente en mapa (independiente de estado_minitramo).

alter table public.tramo_puntos_avance
  add column if not exists frente_mapa boolean not null default false;

create index if not exists tramo_puntos_avance_frente_mapa_idx
  on public.tramo_puntos_avance (tramo_id)
  where frente_mapa = true;

-- Migrar frente único legacy (canal_tramos.punto_frente_mapa_id).
update public.tramo_puntos_avance p
set frente_mapa = true
from public.canal_tramos t
where t.punto_frente_mapa_id = p.id;
