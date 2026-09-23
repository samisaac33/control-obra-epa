-- Estado operativo por minitramo (A–B, B–C…), guardado en el punto final del segmento.

alter table public.tramo_puntos_avance
  add column if not exists estado_minitramo text
  check (
    estado_minitramo is null
    or estado_minitramo in (
      'pendiente',
      'programado',
      'en_ejecucion',
      'terminado',
      'suspendido'
    )
  );
