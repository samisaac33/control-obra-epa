alter table public.registros_fotograficos
  add column if not exists grupo_id uuid;

create index if not exists registros_fotograficos_grupo_id_idx
  on public.registros_fotograficos (grupo_id);
