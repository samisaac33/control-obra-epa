-- Normaliza estado_hito a valores canónicos: inicial, en_ejecucion, culminado.
-- Ejecutar en Supabase SQL Editor si la tabla ya tiene registros con texto libre.

UPDATE public.registros_fotograficos
SET estado_hito = 'culminado'
WHERE estado_hito IS NOT NULL
  AND lower(trim(estado_hito)) IN (
    'terminado',
    'terminada',
    'culminado',
    'culminada',
    'finalizado',
    'finalizada'
  );

UPDATE public.registros_fotograficos
SET estado_hito = 'en_ejecucion'
WHERE estado_hito IS NOT NULL
  AND (
    lower(trim(estado_hito)) IN (
      'en ejecucion',
      'en ejecución',
      'ejecucion',
      'ejecución'
    )
    OR lower(trim(estado_hito)) LIKE 'en ejec%'
  );

UPDATE public.registros_fotograficos
SET estado_hito = 'inicial'
WHERE estado_hito IS NOT NULL
  AND lower(trim(estado_hito)) IN ('inicial', 'inicio', 'pendiente');

-- Ya canónicos en minúsculas (por si acaso)
UPDATE public.registros_fotograficos
SET estado_hito = 'inicial'
WHERE lower(trim(estado_hito)) = 'inicial' AND estado_hito <> 'inicial';

UPDATE public.registros_fotograficos
SET estado_hito = 'en_ejecucion'
WHERE lower(trim(estado_hito)) = 'en_ejecucion' AND estado_hito <> 'en_ejecucion';

UPDATE public.registros_fotograficos
SET estado_hito = 'culminado'
WHERE lower(trim(estado_hito)) = 'culminado' AND estado_hito <> 'culminado';
