-- Ejecutar en Supabase SQL Editor.
-- 1) Correo autorizado del residente: pedroeker61@gmail.com.
-- 2) Crea primero el bucket "evidencias" en Storage (privado).

create table if not exists public.registros_fotograficos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  fecha_captura timestamptz not null,
  lat numeric(10, 7),
  lng numeric(10, 7),
  sector text not null,
  descripcion text,
  numero_rubro text,
  ubicacion_abscisa text,
  actividad_especifica text,
  maquinaria_utilizada text,
  estado_hito text,
  observacion_tecnica text,
  grupo_id uuid,
  image_path text not null
);

create index if not exists registros_fotograficos_grupo_id_idx
  on public.registros_fotograficos (grupo_id);

-- Si la tabla ya existe, ejecutar en SQL Editor:
-- alter table public.registros_fotograficos
--   add column if not exists numero_rubro text,
--   add column if not exists ubicacion_abscisa text,
--   add column if not exists actividad_especifica text,
--   add column if not exists maquinaria_utilizada text,
--   add column if not exists estado_hito text,
--   add column if not exists observacion_tecnica text;

alter table public.registros_fotograficos enable row level security;

drop policy if exists "resident_select" on public.registros_fotograficos;
create policy "resident_select"
on public.registros_fotograficos
for select
using (true);

drop policy if exists "resident_insert" on public.registros_fotograficos;
create policy "resident_insert"
on public.registros_fotograficos
for insert
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
  and created_by = auth.uid()
);

drop policy if exists "resident_update" on public.registros_fotograficos;
create policy "resident_update"
on public.registros_fotograficos
for update
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
  and created_by = auth.uid()
)
with check (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
  and created_by = auth.uid()
);

drop policy if exists "resident_delete" on public.registros_fotograficos;
create policy "resident_delete"
on public.registros_fotograficos
for delete
using (
  auth.jwt()->>'email' = 'pedroeker61@gmail.com'
  and created_by = auth.uid()
);

-- Políticas para bucket privado "evidencias"
drop policy if exists "resident_storage_read" on storage.objects;
create policy "resident_storage_read"
on storage.objects
for select
using (
  bucket_id = 'evidencias'
);

drop policy if exists "resident_storage_insert" on storage.objects;
create policy "resident_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'evidencias'
  and auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "resident_storage_update" on storage.objects;
create policy "resident_storage_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'evidencias'
  and auth.jwt()->>'email' = 'pedroeker61@gmail.com'
)
with check (
  bucket_id = 'evidencias'
  and auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);

drop policy if exists "resident_storage_delete" on storage.objects;
create policy "resident_storage_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'evidencias'
  and auth.jwt()->>'email' = 'pedroeker61@gmail.com'
);
