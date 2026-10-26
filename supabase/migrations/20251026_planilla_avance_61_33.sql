-- Avance planilla 1 al 61,33 % (cronograma ejecutado EPA y libro de obra).
update public.proyecto_planilla_config
set
  porcentaje_avance_planilla_1 = 61.33,
  updated_at = now()
where proyecto_id = 'desasolve-canales'
  and porcentaje_avance_planilla_1 in (61.34, 51.63, 60.13);
