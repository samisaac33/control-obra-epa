-- Blindaje técnico y trazabilidad antiglosa — EPA-EPA-2026-00134-RES (desasolve-canales).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_abscisa_canal') then
    create type public.estado_abscisa_canal as enum (
      'pendiente',
      'en_proceso',
      'ejecutado',
      'conciliado_fiscalizacion'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'estado_ticket_desalojo') then
    create type public.estado_ticket_desalojo as enum (
      'en_transito',
      'entregado',
      'rechazado'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'tipo_evento_paralizacion') then
    create type public.tipo_evento_paralizacion as enum (
      'lluvia_intensa',
      'crecida_caudal_canal',
      'falla_suministro_electrico',
      'bloqueo_acceso_terreno'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'tipo_maquina_jornada') then
    create type public.tipo_maquina_jornada as enum (
      'excavadora_brazo_corto',
      'excavadora_brazo_largo',
      'volqueta',
      'tractor_oruga',
      'motoniveladora'
    );
  end if;
end $$;

update public.proyectos
set
  nombre = 'Emergencia Severino y Trasvase Manabí — Desazolve',
  numero_contrato = 'EPA-EPA-2026-00134-RES',
  objeto = 'MANTENIMIENTO DE LA SUBESTACIÓN ELÉCTRICA SEVERINO Y CANALES DEL TRASVASE MANABÍ',
  sistema = 'Trasvase Manabí — Canales Menores y Canal 2 San Antonio By Pass–Cativo (Chone)'
where id = 'desasolve-canales';

create table if not exists public.proyecto_botaderos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  nombre text not null,
  lat double precision not null,
  lng double precision not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists proyecto_botaderos_proyecto_nombre_idx
  on public.proyecto_botaderos (proyecto_id, lower(nombre));

create index if not exists proyecto_botaderos_proyecto_activo_idx
  on public.proyecto_botaderos (proyecto_id, activo);

create table if not exists public.canal_abscisas (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  tramo_id uuid references public.canal_tramos (id) on delete set null,
  sector_nombre text not null,
  abscisa_inicio numeric(12, 2) not null check (abscisa_inicio >= 0),
  abscisa_fin numeric(12, 2) not null check (abscisa_fin > abscisa_inicio),
  codigo_estacion text not null,
  geom_geojson jsonb,
  area_inicial_m2 numeric(14, 4),
  area_final_m2 numeric(14, 4),
  longitud_m numeric(12, 2) generated always as (abscisa_fin - abscisa_inicio) stored,
  volumen_teorico_m3 numeric(16, 4) generated always as (
    case
      when area_inicial_m2 is not null and area_final_m2 is not null
        then ((area_inicial_m2 + area_final_m2) / 2.0) * (abscisa_fin - abscisa_inicio)
      else null
    end
  ) stored,
  estado public.estado_abscisa_canal not null default 'pendiente',
  fecha_ejecucion date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (proyecto_id, sector_nombre, abscisa_inicio, abscisa_fin)
);

create index if not exists canal_abscisas_proyecto_sector_idx
  on public.canal_abscisas (proyecto_id, sector_nombre, abscisa_inicio);

create index if not exists canal_abscisas_proyecto_estado_idx
  on public.canal_abscisas (proyecto_id, estado);

create index if not exists canal_abscisas_fecha_ejecucion_idx
  on public.canal_abscisas (proyecto_id, fecha_ejecucion)
  where fecha_ejecucion is not null;

create sequence if not exists public.tickets_desalojo_num_seq start with 1 increment by 1;

create table if not exists public.tickets_desalojo (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  numero_ticket text not null unique,
  placa_volqueta text not null,
  chofer text,
  capacidad_m3 numeric(6, 2) not null default 8.0 check (capacidad_m3 > 0),
  abscisa_id uuid references public.canal_abscisas (id) on delete set null,
  lat_origen double precision,
  lng_origen double precision,
  botadero_nombre text not null,
  lat_destino double precision,
  lng_destino double precision,
  distancia_km numeric(8, 3) check (distancia_km is null or distancia_km >= 0),
  fecha_hora_despacho timestamptz not null default now(),
  fecha_hora_recepcion timestamptz,
  estado public.estado_ticket_desalojo not null default 'en_transito',
  qr_hash text not null unique,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_desalojo_proyecto_despacho_idx
  on public.tickets_desalojo (proyecto_id, fecha_hora_despacho desc);

create index if not exists tickets_desalojo_proyecto_estado_idx
  on public.tickets_desalojo (proyecto_id, estado);

create index if not exists tickets_desalojo_abscisa_idx
  on public.tickets_desalojo (abscisa_id)
  where abscisa_id is not null;

create or replace function public.format_numero_ticket_desalojo()
returns trigger
language plpgsql
as $$
begin
  if new.numero_ticket is null or trim(new.numero_ticket) = '' then
    new.numero_ticket := 'TK-' || lpad(nextval('public.tickets_desalojo_num_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists tickets_desalojo_numero_ticket on public.tickets_desalojo;
create trigger tickets_desalojo_numero_ticket
before insert on public.tickets_desalojo
for each row
execute function public.format_numero_ticket_desalojo();

create table if not exists public.eventos_paralizacion (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  tipo_evento public.tipo_evento_paralizacion not null,
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz,
  horas_perdidas numeric(8, 2) check (horas_perdidas is null or horas_perdidas >= 0),
  descripcion text,
  texto_libro_obra text,
  foto_evidencia_url text,
  registrado_por uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fecha_fin is null or fecha_fin >= fecha_inicio)
);

create index if not exists eventos_paralizacion_proyecto_inicio_idx
  on public.eventos_paralizacion (proyecto_id, fecha_inicio desc);

create table if not exists public.registros_maquinaria_jornada (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.proyectos (id) on delete cascade,
  maquina_codigo text not null,
  tipo_maquina public.tipo_maquina_jornada not null,
  horometro_inicio numeric(10, 2) not null check (horometro_inicio >= 0),
  horometro_fin numeric(10, 2) not null check (horometro_fin >= horometro_inicio),
  horas_efectivas numeric(8, 2) generated always as (horometro_fin - horometro_inicio) stored,
  fecha date not null,
  combustible_galones numeric(10, 2) check (combustible_galones is null or combustible_galones >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registros_maquinaria_jornada_proyecto_fecha_idx
  on public.registros_maquinaria_jornada (proyecto_id, fecha desc);

-- RLS
alter table public.proyecto_botaderos enable row level security;
alter table public.canal_abscisas enable row level security;
alter table public.tickets_desalojo enable row level security;
alter table public.eventos_paralizacion enable row level security;
alter table public.registros_maquinaria_jornada enable row level security;

drop policy if exists "proyecto_botaderos_select" on public.proyecto_botaderos;
create policy "proyecto_botaderos_select" on public.proyecto_botaderos for select using (true);

drop policy if exists "proyecto_botaderos_insert" on public.proyecto_botaderos;
create policy "proyecto_botaderos_insert" on public.proyecto_botaderos for insert
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "proyecto_botaderos_update" on public.proyecto_botaderos;
create policy "proyecto_botaderos_update" on public.proyecto_botaderos for update
using (auth.jwt()->>'email' = 'pedroeker61@gmail.com')
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "canal_abscisas_select" on public.canal_abscisas;
create policy "canal_abscisas_select" on public.canal_abscisas for select using (true);

drop policy if exists "canal_abscisas_insert" on public.canal_abscisas;
create policy "canal_abscisas_insert" on public.canal_abscisas for insert
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "canal_abscisas_update" on public.canal_abscisas;
create policy "canal_abscisas_update" on public.canal_abscisas for update
using (auth.jwt()->>'email' = 'pedroeker61@gmail.com')
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "tickets_desalojo_select" on public.tickets_desalojo;
create policy "tickets_desalojo_select" on public.tickets_desalojo for select using (true);

drop policy if exists "tickets_desalojo_insert" on public.tickets_desalojo;
create policy "tickets_desalojo_insert" on public.tickets_desalojo for insert
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "tickets_desalojo_update" on public.tickets_desalojo;
create policy "tickets_desalojo_update" on public.tickets_desalojo for update
using (auth.jwt()->>'email' = 'pedroeker61@gmail.com')
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "eventos_paralizacion_select" on public.eventos_paralizacion;
create policy "eventos_paralizacion_select" on public.eventos_paralizacion for select using (true);

drop policy if exists "eventos_paralizacion_insert" on public.eventos_paralizacion;
create policy "eventos_paralizacion_insert" on public.eventos_paralizacion for insert
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "eventos_paralizacion_update" on public.eventos_paralizacion;
create policy "eventos_paralizacion_update" on public.eventos_paralizacion for update
using (auth.jwt()->>'email' = 'pedroeker61@gmail.com')
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "registros_maquinaria_jornada_select" on public.registros_maquinaria_jornada;
create policy "registros_maquinaria_jornada_select" on public.registros_maquinaria_jornada for select using (true);

drop policy if exists "registros_maquinaria_jornada_insert" on public.registros_maquinaria_jornada;
create policy "registros_maquinaria_jornada_insert" on public.registros_maquinaria_jornada for insert
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');

drop policy if exists "registros_maquinaria_jornada_update" on public.registros_maquinaria_jornada;
create policy "registros_maquinaria_jornada_update" on public.registros_maquinaria_jornada for update
using (auth.jwt()->>'email' = 'pedroeker61@gmail.com')
with check (auth.jwt()->>'email' = 'pedroeker61@gmail.com');
