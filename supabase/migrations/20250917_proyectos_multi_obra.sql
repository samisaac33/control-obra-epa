-- Multi-proyecto: catálogo de obras, tramos de canal y vínculo con evidencias fotográficas.

create table if not exists public.proyectos (
  id text primary key,
  nombre text not null,
  numero_contrato text,
  cliente text,
  objeto text,
  sistema text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.proyectos (id, nombre, numero_contrato, cliente, objeto, sistema)
values (
  'emergencia-manabi',
  'Contrato de Emergencia EPA Manabí',
  'CTO-2026-EP-0142',
  'Empresa Pública del Agua (EPA EP)',
  'Desazolve y rehabilitación — Canales Poza Honda y compuertas La Estancilla y La Ciénega',
  'Trasvase Manabí — Sistema de Riego Canales Poza Honda'
)
on conflict (id) do nothing;

insert into public.proyectos (id, nombre, numero_contrato, cliente, objeto, sistema)
values (
  'desasolve-canales',
  'Desasolve de canales de riego',
  'Pendiente',
  'Empresa Pública del Agua (EPA EP)',
  'Desasolve de canales de riego con excavadoras — Sistema Trasvase Manabí',
  'Trasvase Manabí — Canales de riego'
)
on conflict (id) do nothing;

alter table public.registros_fotograficos
  add column if not exists proyecto_id text not null default 'emergencia-manabi'
    references public.proyectos (id);

create index if not exists registros_fotograficos_proyecto_id_idx
  on public.registros_fotograficos (proyecto_id);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_tramo') then
    create type public.estado_tramo as enum (
      'pendiente',
      'programado',
      'en_ejecucion',
      'terminado',
      'suspendido'
    );
  end if;
end $$;

create table if not exists public.canal_tramos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  codigo text not null,
  canal text not null,
  longitud_m numeric(12, 2) not null check (longitud_m > 0),
  geometria jsonb not null,
  estado public.estado_tramo not null default 'pendiente',
  avance_pct numeric(5, 2) not null default 0 check (avance_pct >= 0 and avance_pct <= 100),
  metros_ejecutados numeric(12, 2) not null default 0 check (metros_ejecutados >= 0),
  fecha_inicio date,
  fecha_fin date,
  semana_programada date,
  maquinaria_asignada text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (proyecto_id, codigo)
);

create index if not exists canal_tramos_proyecto_estado_idx
  on public.canal_tramos (proyecto_id, estado);

create index if not exists canal_tramos_proyecto_canal_idx
  on public.canal_tramos (proyecto_id, canal);

alter table public.registros_fotograficos
  add column if not exists tramo_id uuid references public.canal_tramos (id) on delete set null;

create index if not exists registros_fotograficos_tramo_id_idx
  on public.registros_fotograficos (tramo_id);

alter table public.proyectos enable row level security;
alter table public.canal_tramos enable row level security;

drop policy if exists "proyectos_select" on public.proyectos;
create policy "proyectos_select"
on public.proyectos
for select
using (true);

drop policy if exists "canal_tramos_select" on public.canal_tramos;
create policy "canal_tramos_select"
on public.canal_tramos
for select
using (true);

-- Sustituir TU_CORREO_RESIDENTE por el correo real al ejecutar en Supabase.
drop policy if exists "canal_tramos_insert" on public.canal_tramos;
create policy "canal_tramos_insert"
on public.canal_tramos
for insert
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "canal_tramos_update" on public.canal_tramos;
create policy "canal_tramos_update"
on public.canal_tramos
for update
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
)
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "canal_tramos_delete" on public.canal_tramos;
create policy "canal_tramos_delete"
on public.canal_tramos
for delete
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);
