-- Pares A–B para avance por tramo intervenido (no necesariamente desde el inicio).

alter table public.tramo_puntos_avance
  add column if not exists rol text check (rol in ('a', 'b')),
  add column if not exists grupo_id uuid;

create index if not exists tramo_puntos_avance_grupo_idx
  on public.tramo_puntos_avance (grupo_id);
