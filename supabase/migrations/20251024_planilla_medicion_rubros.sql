-- Mediciones por rubro vinculadas a cada planilla de pago.

create table if not exists public.planilla_medicion_rubros (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  planilla_numero smallint not null check (planilla_numero in (1, 2)),
  rubro_id integer not null,
  cantidad_periodo numeric(16, 4) not null default 0 check (cantidad_periodo >= 0),
  cantidad_acumulada_anterior numeric(16, 4) not null default 0 check (cantidad_acumulada_anterior >= 0),
  observaciones text,
  updated_at timestamptz not null default now(),
  unique (proyecto_id, planilla_numero, rubro_id)
);

create index if not exists planilla_medicion_rubros_proyecto_planilla_idx
  on public.planilla_medicion_rubros (proyecto_id, planilla_numero);

alter table public.planilla_medicion_rubros enable row level security;

drop policy if exists "planilla_medicion_rubros_select" on public.planilla_medicion_rubros;
create policy "planilla_medicion_rubros_select"
on public.planilla_medicion_rubros for select using (true);

drop policy if exists "planilla_medicion_rubros_insert" on public.planilla_medicion_rubros;
create policy "planilla_medicion_rubros_insert"
on public.planilla_medicion_rubros for insert
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "planilla_medicion_rubros_update" on public.planilla_medicion_rubros;
create policy "planilla_medicion_rubros_update"
on public.planilla_medicion_rubros for update
using (auth.jwt()->>'email' = 'pedroeker61@gmail.com')
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "planilla_medicion_rubros_delete" on public.planilla_medicion_rubros;
create policy "planilla_medicion_rubros_delete"
on public.planilla_medicion_rubros for delete
using (auth.jwt()->>'email' = 'pedroeker61@gmail.com');
