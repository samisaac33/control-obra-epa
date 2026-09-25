-- Restablece avance GPS de tramos 1 y 8 (proyecto desasolve-canales).
-- Equivalente a: npx tsx scripts/reset-tramos-avance-gps.ts --proyecto desasolve-canales --codigos 1,8
-- Ejecutar en Supabase SQL Editor (revisa el SELECT previo).

begin;

-- Vista previa (debe devolver exactamente 2 filas)
select id, codigo, origen_extremo, metros_ejecutados, avance_pct
from public.canal_tramos
where proyecto_id = 'desasolve-canales'
  and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('1', '8');

do $$
declare
  cnt int;
begin
  select count(*) into cnt
  from public.canal_tramos
  where proyecto_id = 'desasolve-canales'
    and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('1', '8');

  if cnt <> 2 then
    raise exception 'Se esperaban 2 tramos (1 y 8); encontrados %', cnt;
  end if;
end $$;

with tramos_objetivo as (
  select id
  from public.canal_tramos
  where proyecto_id = 'desasolve-canales'
    and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('1', '8')
)
delete from public.tramo_registros_maquinaria m
using tramos_objetivo t
where m.tramo_id = t.id;

with tramos_objetivo as (
  select id
  from public.canal_tramos
  where proyecto_id = 'desasolve-canales'
    and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('1', '8')
)
delete from public.tramo_puntos_avance p
using tramos_objetivo t
where p.tramo_id = t.id;

with tramos_objetivo as (
  select id
  from public.canal_tramos
  where proyecto_id = 'desasolve-canales'
    and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('1', '8')
)
update public.registros_fotograficos f
set tramo_id = null
from tramos_objetivo t
where f.tramo_id = t.id;

with tramos_objetivo as (
  select id
  from public.canal_tramos
  where proyecto_id = 'desasolve-canales'
    and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('1', '8')
)
update public.canal_tramos c
set
  origen_extremo = null,
  metros_ejecutados = 0,
  avance_pct = 0,
  updated_at = now()
from tramos_objetivo t
where c.id = t.id;

select codigo, origen_extremo, metros_ejecutados, avance_pct
from public.canal_tramos
where proyecto_id = 'desasolve-canales'
  and lower(trim(regexp_replace(codigo, '^tramo\s+', '', 'i'))) in ('1', '8');

commit;
