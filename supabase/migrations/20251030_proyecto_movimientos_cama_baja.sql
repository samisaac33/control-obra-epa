-- Movimientos de maquinaria en cama baja / plataforma (traslado entre frentes o sitios).

create table if not exists public.proyecto_movimientos_cama_baja (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  fecha date not null,
  cama_baja text not null,
  maquina_transportada text not null,
  maquina_equipo_id uuid references public.proyecto_equipos_maquinaria (id) on delete set null,
  origen text,
  destino text,
  duracion_horas numeric(6, 2) check (duracion_horas is null or duracion_horas >= 0),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proyecto_movimientos_cama_baja_proyecto_fecha_idx
  on public.proyecto_movimientos_cama_baja (proyecto_id, fecha desc, created_at desc);

alter table public.proyecto_movimientos_cama_baja enable row level security;

drop policy if exists "proyecto_movimientos_cama_baja_select" on public.proyecto_movimientos_cama_baja;
create policy "proyecto_movimientos_cama_baja_select"
on public.proyecto_movimientos_cama_baja
for select
using (true);

drop policy if exists "proyecto_movimientos_cama_baja_insert" on public.proyecto_movimientos_cama_baja;
create policy "proyecto_movimientos_cama_baja_insert"
on public.proyecto_movimientos_cama_baja
for insert
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "proyecto_movimientos_cama_baja_update" on public.proyecto_movimientos_cama_baja;
create policy "proyecto_movimientos_cama_baja_update"
on public.proyecto_movimientos_cama_baja
for update
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
)
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "proyecto_movimientos_cama_baja_delete" on public.proyecto_movimientos_cama_baja;
create policy "proyecto_movimientos_cama_baja_delete"
on public.proyecto_movimientos_cama_baja
for delete
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);
