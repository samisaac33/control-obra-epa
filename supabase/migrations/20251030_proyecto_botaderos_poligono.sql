-- Polígonos de escombrera / botadero (Google Earth → KML → import).

alter table public.proyecto_botaderos
  add column if not exists geom_geojson jsonb,
  add column if not exists area_m2 numeric(16, 2) check (area_m2 is null or area_m2 >= 0);

comment on column public.proyecto_botaderos.geom_geojson is
  'Polígono GeoJSON (Polygon) del área de desalojo; lat/lng sigue siendo el centroide para tickets.';
comment on column public.proyecto_botaderos.area_m2 is
  'Área aproximada del polígono en m² (calculada al importar KML).';
