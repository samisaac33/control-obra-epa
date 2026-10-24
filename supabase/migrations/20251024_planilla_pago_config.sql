-- Configuración de planillas de pago por proyecto (plazo, avance objetivo planilla 1).

create table if not exists public.proyecto_planilla_config (
  proyecto_id text primary key references public.proyectos (id) on delete cascade,
  fecha_inicio_plazo date not null,
  plazo_dias integer not null default 60 check (plazo_dias > 0),
  dias_por_planilla integer not null default 30 check (dias_por_planilla > 0),
  porcentaje_avance_planilla_1 numeric(5, 2) not null check (
    porcentaje_avance_planilla_1 > 0 and porcentaje_avance_planilla_1 < 100
  ),
  observaciones text,
  registrado_por uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proyecto_planilla_config enable row level security;

drop policy if exists "proyecto_planilla_config_select" on public.proyecto_planilla_config;
create policy "proyecto_planilla_config_select"
on public.proyecto_planilla_config for select using (true);

drop policy if exists "proyecto_planilla_config_insert" on public.proyecto_planilla_config;
create policy "proyecto_planilla_config_insert"
on public.proyecto_planilla_config for insert
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "proyecto_planilla_config_update" on public.proyecto_planilla_config;
create policy "proyecto_planilla_config_update"
on public.proyecto_planilla_config for update
using (auth.jwt()->>'email' = 'pedroeker61@gmail.com')
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');
