alter table public.registros_fotograficos
  add column if not exists numero_rubro smallint,
  add column if not exists ubicacion_abscisa text,
  add column if not exists actividad_especifica text,
  add column if not exists maquinaria_utilizada text,
  add column if not exists estado_hito text,
  add column if not exists observacion_tecnica text;
