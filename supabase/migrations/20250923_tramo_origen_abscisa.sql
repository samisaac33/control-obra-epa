-- Orientación del tramo: qué extremo de la geometría KMZ es el inicio lógico (punto A).

alter table public.canal_tramos
  add column if not exists origen_extremo text
    check (origen_extremo is null or origen_extremo in ('geometria_inicio', 'geometria_fin'));
