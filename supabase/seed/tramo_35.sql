-- Seed generado desde KMZ — ejecutar en Supabase SQL Editor
-- Requiere migración 20250917_proyectos_multi_obra.sql aplicada previamente.

insert into public.canal_tramos (
  proyecto_id, codigo, canal, longitud_m, geometria, estado, avance_pct, metros_ejecutados
)
values
  (
    'desasolve-canales',
    'tramo 35',
    'Puntos levantados',
    295.36,
    '{"type":"LineString","coordinates":[[-80.52692938848523,-0.845664262882375,0],[-80.52684280604957,-0.8454000284184803,0],[-80.5260862538766,-0.8449431077474987,0],[-80.52595917274144,-0.8446230061776271,0],[-80.5255563213932,-0.8443536872289217,0],[-80.52510883839062,-0.8441157287869394,0],[-80.52500395114893,-0.8439966439773189,0]]}'::jsonb,
    'pendiente',
    0,
    0
  )
on conflict (proyecto_id, codigo) do update set
  canal = excluded.canal,
  longitud_m = excluded.longitud_m,
  geometria = excluded.geometria,
  updated_at = now();
