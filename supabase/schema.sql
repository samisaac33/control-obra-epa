-- SICC: esquema para datos compartidos en tiempo real
-- Ejecutar en el SQL Editor de Supabase (Dashboard → SQL → New query)

create table if not exists public.sicc_metrados (
  id text primary key,
  obra_id text not null,
  rubro_id integer not null,
  fecha date not null,
  cantidad numeric not null check (cantidad >= 0),
  frente text not null,
  observaciones text,
  registrado_por text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sicc_libro_obra (
  id text primary key,
  obra_id text not null,
  fecha date not null,
  clima text not null,
  temperatura text,
  personal integer not null check (personal >= 0),
  actividades text not null,
  materiales text,
  equipos text,
  incidencias text,
  observaciones text,
  residente text not null,
  created_at timestamptz not null default now()
);

create index if not exists sicc_metrados_obra_id_idx on public.sicc_metrados (obra_id);
create index if not exists sicc_libro_obra_obra_id_idx on public.sicc_libro_obra (obra_id);

alter table public.sicc_metrados enable row level security;
alter table public.sicc_libro_obra enable row level security;

-- Políticas demo: acceso público lectura/escritura para el SICC.
-- En producción reemplazar por auth (residente, fiscalizador, etc.).
drop policy if exists "sicc_metrados_select" on public.sicc_metrados;
create policy "sicc_metrados_select" on public.sicc_metrados for select using (true);

drop policy if exists "sicc_metrados_insert" on public.sicc_metrados;
create policy "sicc_metrados_insert" on public.sicc_metrados for insert with check (true);

drop policy if exists "sicc_metrados_delete" on public.sicc_metrados;
create policy "sicc_metrados_delete" on public.sicc_metrados for delete using (true);

drop policy if exists "sicc_libro_select" on public.sicc_libro_obra;
create policy "sicc_libro_select" on public.sicc_libro_obra for select using (true);

drop policy if exists "sicc_libro_insert" on public.sicc_libro_obra;
create policy "sicc_libro_insert" on public.sicc_libro_obra for insert with check (true);

drop policy if exists "sicc_libro_delete" on public.sicc_libro_obra;
create policy "sicc_libro_delete" on public.sicc_libro_obra for delete using (true);

-- Realtime (habilitar replicación en Database → Publications si hace falta)
alter publication supabase_realtime add table public.sicc_metrados;
alter publication supabase_realtime add table public.sicc_libro_obra;
