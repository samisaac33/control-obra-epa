-- Avance planilla 1 vigente (cronograma ejecutado 51,63 %).
update public.proyecto_planilla_config
set
  porcentaje_avance_planilla_1 = 51.63,
  updated_at = now()
where proyecto_id = 'desasolve-canales'
  and porcentaje_avance_planilla_1 = 60.13;
