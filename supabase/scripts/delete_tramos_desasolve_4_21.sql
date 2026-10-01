-- Elimina tramos 4 y 21 del proyecto desasolve-canales.
-- Equivalente: npx tsx scripts/delete-tramos.ts --proyecto desasolve-canales --codigos 4,21
-- Ejecutar en Supabase SQL Editor (revisa el SELECT previo).

begin;

select id, codigo, longitud_m, estado
from public.canal_tramos
where proyecto_id = 'desasolve-canales'
  and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('4', '21');

do $$
declare
  cnt int;
begin
  select count(*) into cnt
  from public.canal_tramos
  where proyecto_id = 'desasolve-canales'
    and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('4', '21');

  if cnt = 0 then
    raise notice 'No hay tramos 4 ni 21; posiblemente ya fueron eliminados.';
  end if;
end $$;

with tramos_objetivo as (
  select id
  from public.canal_tramos
  where proyecto_id = 'desasolve-canales'
    and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('4', '21')
)
update public.registros_fotograficos f
set tramo_id = null
from tramos_objetivo t
where f.tramo_id = t.id;

with tramos_objetivo as (
  select id
  from public.canal_tramos
  where proyecto_id = 'desasolve-canales'
    and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('4', '21')
)
delete from public.canal_tramos c
using tramos_objetivo t
where c.id = t.id;

select codigo
from public.canal_tramos
where proyecto_id = 'desasolve-canales'
  and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('4', '21');

commit;
