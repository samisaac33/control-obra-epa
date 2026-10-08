-- Seed generado desde KMZ — ejecutar en Supabase SQL Editor
-- Requiere migración 20250917_proyectos_multi_obra.sql aplicada previamente.

insert into public.canal_tramos (
  proyecto_id, codigo, canal, longitud_m, geometria, estado, avance_pct, metros_ejecutados
)
values
  (
    'desasolve-canales',
    'tramo 36',
    'Puntos levantados',
    403.03,
    '{"type":"LineString","coordinates":[[-80.51680344335742,-0.8372125466736628,0],[-80.51765436061663,-0.8374550006952478,0],[-80.51782881591821,-0.8374694820339579,0],[-80.51787442818491,-0.8373634213236434,0],[-80.51810998623418,-0.8366348667913985,0],[-80.51829999834834,-0.8360425695194603,0],[-80.51830754082967,-0.8358223494538194,0],[-80.51832280340041,-0.835533716838098,0],[-80.51842867415328,-0.8351241117832308,0],[-80.51847389272822,-0.8350030412544175,0]]}'::jsonb,
    'pendiente',
    0,
    0
  )
on conflict (proyecto_id, codigo) do update set
  canal = excluded.canal,
  longitud_m = excluded.longitud_m,
  geometria = excluded.geometria,
  updated_at = now();
