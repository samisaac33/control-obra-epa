-- Seed generado desde KMZ — ejecutar en Supabase SQL Editor
-- Requiere migración 20250917_proyectos_multi_obra.sql aplicada previamente.

insert into public.canal_tramos (
  proyecto_id, codigo, canal, longitud_m, geometria, estado, avance_pct, metros_ejecutados
)
values
  (
    'desasolve-canales',
    'tramo 26',
    'Puntos levantados',
    1049.78,
    '{"type":"LineString","coordinates":[[-80.43473234224474,-0.9131517308479087,0],[-80.43448530674759,-0.9104105307352598,0],[-80.43443121113702,-0.9094314074609102,0],[-80.43423122026536,-0.9091642680904611,0],[-80.4341185265158,-0.9088975806433521,0],[-80.43404668085488,-0.9085018697017666,0],[-80.43374866259151,-0.907963758127322,0],[-80.43325325708972,-0.9073238519153479,0],[-80.43295487474234,-0.9071745858654796,0],[-80.43229072557251,-0.9067672109192549,0],[-80.43041726727213,-0.9057209814416577,0]]}'::jsonb,
    'pendiente',
    0,
    0
  ),
  (
    'desasolve-canales',
    'tramo 27',
    'Puntos levantados',
    1356.88,
    '{"type":"LineString","coordinates":[[-80.43045817561226,-0.9052064441556036,0],[-80.43162167535205,-0.9030884976614746,0],[-80.43243158013499,-0.901297459944973,0],[-80.43232226860752,-0.9010117956810094,0],[-80.42950952512022,-0.9002990137669341,0],[-80.42710262780794,-0.8983923625126289,0],[-80.42671577198071,-0.8979709381311066,0],[-80.42629831974891,-0.8974551614701938,0],[-80.42610741219654,-0.897213940848409,0]]}'::jsonb,
    'pendiente',
    0,
    0
  )
on conflict (proyecto_id, codigo) do update set
  canal = excluded.canal,
  longitud_m = excluded.longitud_m,
  geometria = excluded.geometria,
  updated_at = now();
