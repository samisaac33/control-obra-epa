-- Jornadas de maquinaria fuera del contrato de desasolve (trabajos complementarios).

create table if not exists public.proyecto_maquinaria_complementaria (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  fecha date not null,
  equipo text not null,
  equipo_id uuid references public.proyecto_equipos_maquinaria (id) on delete set null,
  duracion_horas numeric(6, 2) check (duracion_horas is null or duracion_horas >= 0),
  descripcion_trabajo text not null,
  ubicacion_referencia text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proyecto_maquinaria_complementaria_proyecto_fecha_idx
  on public.proyecto_maquinaria_complementaria (proyecto_id, fecha desc, created_at desc);

alter table public.proyecto_maquinaria_complementaria enable row level security;

drop policy if exists "proyecto_maquinaria_complementaria_select" on public.proyecto_maquinaria_complementaria;
create policy "proyecto_maquinaria_complementaria_select"
on public.proyecto_maquinaria_complementaria
for select
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "proyecto_maquinaria_complementaria_insert" on public.proyecto_maquinaria_complementaria;
create policy "proyecto_maquinaria_complementaria_insert"
on public.proyecto_maquinaria_complementaria
for insert
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "proyecto_maquinaria_complementaria_update" on public.proyecto_maquinaria_complementaria;
create policy "proyecto_maquinaria_complementaria_update"
on public.proyecto_maquinaria_complementaria
for update
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
)
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "proyecto_maquinaria_complementaria_delete" on public.proyecto_maquinaria_complementaria;
create policy "proyecto_maquinaria_complementaria_delete"
on public.proyecto_maquinaria_complementaria
for delete
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);
