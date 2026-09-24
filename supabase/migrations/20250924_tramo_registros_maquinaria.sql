-- Jornadas de maquinaria registradas por tramo (residente).

create table if not exists public.tramo_registros_maquinaria (
  id uuid primary key default gen_random_uuid(),
  tramo_id uuid not null references public.canal_tramos (id) on delete cascade,
  fecha date not null,
  metros_desasolados numeric(12, 2) not null check (metros_desasolados >= 0),
  equipo text not null,
  duracion_horas numeric(6, 2) check (duracion_horas is null or duracion_horas >= 0),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tramo_registros_maquinaria_tramo_fecha_idx
  on public.tramo_registros_maquinaria (tramo_id, fecha desc, created_at desc);

alter table public.tramo_registros_maquinaria enable row level security;

drop policy if exists "tramo_registros_maquinaria_select" on public.tramo_registros_maquinaria;
create policy "tramo_registros_maquinaria_select"
on public.tramo_registros_maquinaria
for select
using (true);

drop policy if exists "tramo_registros_maquinaria_insert" on public.tramo_registros_maquinaria;
create policy "tramo_registros_maquinaria_insert"
on public.tramo_registros_maquinaria
for insert
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "tramo_registros_maquinaria_update" on public.tramo_registros_maquinaria;
create policy "tramo_registros_maquinaria_update"
on public.tramo_registros_maquinaria
for update
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
)
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "tramo_registros_maquinaria_delete" on public.tramo_registros_maquinaria;
create policy "tramo_registros_maquinaria_delete"
on public.tramo_registros_maquinaria
for delete
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);
