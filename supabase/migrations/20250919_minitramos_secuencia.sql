-- Minitramos secuenciales: puntos A, B, C, D… enlazados en pares (A–B, C–D…).

alter table public.tramo_puntos_avance
  drop constraint if exists tramo_puntos_avance_rol_check;

alter table public.tramo_puntos_avance
  add constraint tramo_puntos_avance_rol_check
  check (rol is null or rol ~ '^[a-z]$');
