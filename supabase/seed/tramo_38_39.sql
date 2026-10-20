-- Seed generado desde KMZ — ejecutar en Supabase SQL Editor
-- Requiere migración 20250917_proyectos_multi_obra.sql aplicada previamente.

insert into public.canal_tramos (
  proyecto_id, codigo, canal, longitud_m, geometria, estado, avance_pct, metros_ejecutados
)
values
  (
    'desasolve-canales',
    'tramo 38',
    'Puntos levantados',
    449.37,
    '{"type":"LineString","coordinates":[[-80.52694322570892,-0.8457290977819534,0],[-80.52717273136196,-0.8466883333719201,0],[-80.5273397080663,-0.8472514328878076,0],[-80.52744679632936,-0.8478178365521531,0],[-80.52722852857377,-0.8483686661262875,0],[-80.52744462058928,-0.8491709787755863,0],[-80.52755547716062,-0.8496254523881245,0]]}'::jsonb,
    'pendiente',
    0,
    0
  ),
  (
    'desasolve-canales',
    'tramo 39',
    'Puntos levantados',
    150.88,
    '{"type":"LineString","coordinates":[[-80.52844455718804,-0.8371178946783966,0],[-80.5283432505412,-0.8357647478626231,0]]}'::jsonb,
    'pendiente',
    0,
    0
  )
on conflict (proyecto_id, codigo) do update set
  canal = excluded.canal,
  longitud_m = excluded.longitud_m,
  geometria = excluded.geometria,
  updated_at = now();
