-- SICC: autenticación y roles (ejecutar DESPUÉS de schema.sql)
-- Desactivar "Confirm email" en Auth → Providers → Email para acceso inmediato en demo.

create type public.sicc_rol as enum (
  'residente',
  'visitante',
  'fiscalizador',
  'administrador'
);

create table if not exists public.sicc_perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  obra_id text not null default 'obra-severino-2026',
  rol public.sicc_rol not null,
  nombre text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.sicc_perfiles enable row level security;

drop policy if exists "sicc_perfiles_select" on public.sicc_perfiles;
create policy "sicc_perfiles_select" on public.sicc_perfiles
  for select to authenticated using (true);

drop policy if exists "sicc_perfiles_insert" on public.sicc_perfiles;
create policy "sicc_perfiles_insert" on public.sicc_perfiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "sicc_perfiles_update" on public.sicc_perfiles;
drop policy if exists "sicc_perfiles_update_admin" on public.sicc_perfiles;
create policy "sicc_perfiles_update_admin" on public.sicc_perfiles
  for update to authenticated
  using (public.sicc_rol_usuario() = 'administrador')
  with check (public.sicc_rol_usuario() = 'administrador');

-- Función auxiliar para políticas RLS
create or replace function public.sicc_rol_usuario()
returns public.sicc_rol
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.sicc_perfiles where id = auth.uid()
$$;

-- Reemplazar políticas abiertas por políticas basadas en rol
drop policy if exists "sicc_metrados_select" on public.sicc_metrados;
drop policy if exists "sicc_metrados_insert" on public.sicc_metrados;
drop policy if exists "sicc_metrados_delete" on public.sicc_metrados;
drop policy if exists "sicc_libro_select" on public.sicc_libro_obra;
drop policy if exists "sicc_libro_insert" on public.sicc_libro_obra;
drop policy if exists "sicc_libro_delete" on public.sicc_libro_obra;

-- Lectura: cualquier usuario autenticado
create policy "sicc_metrados_select" on public.sicc_metrados
  for select to authenticated using (true);

create policy "sicc_libro_select" on public.sicc_libro_obra
  for select to authenticated using (true);

-- Escritura en campo: solo residente
create policy "sicc_metrados_insert" on public.sicc_metrados
  for insert to authenticated
  with check (public.sicc_rol_usuario() = 'residente');

create policy "sicc_libro_insert" on public.sicc_libro_obra
  for insert to authenticated
  with check (public.sicc_rol_usuario() = 'residente');

-- Reinicio demo: solo residente
create policy "sicc_metrados_delete" on public.sicc_metrados
  for delete to authenticated
  using (public.sicc_rol_usuario() = 'residente');

create policy "sicc_libro_delete" on public.sicc_libro_obra
  for delete to authenticated
  using (public.sicc_rol_usuario() = 'residente');

-- Fallback lectura anónima (modo sin login, solo si aún no migró a auth)
-- Comentar estas dos líneas una vez todos usen login:
-- create policy "sicc_metrados_select_anon" on public.sicc_metrados for select to anon using (true);
-- create policy "sicc_libro_select_anon" on public.sicc_libro_obra for select to anon using (true);
