-- SICC: rol administrador y permisos de gestión de usuarios
-- Ejecutar DESPUÉS de schema-auth.sql

alter type public.sicc_rol add value if not exists 'administrador';

-- Solo administradores pueden cambiar roles de otros usuarios
drop policy if exists "sicc_perfiles_update" on public.sicc_perfiles;
drop policy if exists "sicc_perfiles_update_admin" on public.sicc_perfiles;

create policy "sicc_perfiles_update_admin" on public.sicc_perfiles
  for update to authenticated
  using (public.sicc_rol_usuario() = 'administrador')
  with check (public.sicc_rol_usuario() = 'administrador');

-- Promover el primer administrador manualmente (ejemplo):
-- update public.sicc_perfiles set rol = 'administrador' where email = 'tu-correo@empresa.com';
