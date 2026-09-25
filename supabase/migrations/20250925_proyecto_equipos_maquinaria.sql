-- Catálogo de equipos de maquinaria por proyecto (select en jornadas del mapa).

create table if not exists public.proyecto_equipos_maquinaria (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  nombre text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists proyecto_equipos_maquinaria_proyecto_nombre_idx
  on public.proyecto_equipos_maquinaria (proyecto_id, lower(nombre));

create index if not exists proyecto_equipos_maquinaria_proyecto_activo_idx
  on public.proyecto_equipos_maquinaria (proyecto_id, activo);

alter table public.proyecto_equipos_maquinaria enable row level security;

drop policy if exists "proyecto_equipos_maquinaria_select" on public.proyecto_equipos_maquinaria;
create policy "proyecto_equipos_maquinaria_select"
on public.proyecto_equipos_maquinaria
for select
using (true);

drop policy if exists "proyecto_equipos_maquinaria_insert" on public.proyecto_equipos_maquinaria;
create policy "proyecto_equipos_maquinaria_insert"
on public.proyecto_equipos_maquinaria
for insert
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "proyecto_equipos_maquinaria_update" on public.proyecto_equipos_maquinaria;
create policy "proyecto_equipos_maquinaria_update"
on public.proyecto_equipos_maquinaria
for update
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
)
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "proyecto_equipos_maquinaria_delete" on public.proyecto_equipos_maquinaria;
create policy "proyecto_equipos_maquinaria_delete"
on public.proyecto_equipos_maquinaria
for delete
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

-- Seed inicial emergencia-manabi (nombres del registro operativo histórico).
insert into public.proyecto_equipos_maquinaria (proyecto_id, nombre)
select v.proyecto_id, v.nombre
from (
  values
    ('emergencia-manabi', 'Excavadora brazo largo'),
    ('emergencia-manabi', 'Excavadora brazo corto'),
    ('emergencia-manabi', 'Tractor'),
    ('emergencia-manabi', 'Volqueta'),
    ('emergencia-manabi', 'Gallineta'),
    ('emergencia-manabi', 'Viajes de arena'),
    ('emergencia-manabi', 'Descarga de tubos de hormigón')
) as v(proyecto_id, nombre)
where not exists (
  select 1
  from public.proyecto_equipos_maquinaria e
  where e.proyecto_id = v.proyecto_id
    and lower(e.nombre) = lower(v.nombre)
);
