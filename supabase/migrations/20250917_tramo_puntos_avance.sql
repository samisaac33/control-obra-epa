-- Historial de puntos GPS confirmados por tramo (avance por coordenadas).

create table if not exists public.tramo_puntos_avance (
  id uuid primary key default gen_random_uuid(),
  tramo_id uuid not null references public.canal_tramos (id) on delete cascade,
  registro_foto_id uuid references public.registros_fotograficos (id) on delete set null,
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  abscisa_m numeric(12, 2) not null check (abscisa_m >= 0),
  confirmado boolean not null default false,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists tramo_puntos_avance_tramo_id_idx
  on public.tramo_puntos_avance (tramo_id, created_at desc);

create index if not exists tramo_puntos_avance_foto_id_idx
  on public.tramo_puntos_avance (registro_foto_id);

alter table public.tramo_puntos_avance enable row level security;

drop policy if exists "tramo_puntos_avance_select" on public.tramo_puntos_avance;
create policy "tramo_puntos_avance_select"
on public.tramo_puntos_avance
for select
using (true);

drop policy if exists "tramo_puntos_avance_insert" on public.tramo_puntos_avance;
create policy "tramo_puntos_avance_insert"
on public.tramo_puntos_avance
for insert
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "tramo_puntos_avance_update" on public.tramo_puntos_avance;
create policy "tramo_puntos_avance_update"
on public.tramo_puntos_avance
for update
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
)
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "tramo_puntos_avance_delete" on public.tramo_puntos_avance;
create policy "tramo_puntos_avance_delete"
on public.tramo_puntos_avance
for delete
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);
