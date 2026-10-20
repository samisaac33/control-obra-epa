-- Seed generado desde KMZ — ejecutar en Supabase SQL Editor
-- Requiere migración 20250917_proyectos_multi_obra.sql aplicada previamente.

insert into public.canal_tramos (
  proyecto_id, codigo, canal, longitud_m, geometria, estado, avance_pct, metros_ejecutados
)
values
  (
    'desasolve-canales',
    'tramo 40',
    'Puntos levantados',
    1450.92,
    '{"type":"LineString","coordinates":[[-80.17011495188446,-0.7179972648610607,0],[-80.1688165289791,-0.7179995285139066,0],[-80.16816817619907,-0.7179894369488686,0],[-80.16763268738016,-0.7178061523507586,0],[-80.16709908319507,-0.7175776417231366,0],[-80.1661857545896,-0.7171822262461014,0],[-80.16509396526897,-0.7167157638933589,0],[-80.16393591949819,-0.716217357334055,0],[-80.163141388597,-0.715871244662938,0],[-80.16192412394686,-0.7153652988154768,0],[-80.16124952858969,-0.7150823391175493,0],[-80.16054515871248,-0.7147748285136012,0],[-80.1597041976414,-0.7143914059280065,0],[-80.15899293208979,-0.7140949489452787,0],[-80.15860917284718,-0.7139293277525767,0],[-80.15795573193516,-0.7136390856489436,0]]}'::jsonb,
    'pendiente',
    0,
    0
  )
on conflict (proyecto_id, codigo) do update set
  canal = excluded.canal,
  longitud_m = excluded.longitud_m,
  geometria = excluded.geometria,
  updated_at = now();
