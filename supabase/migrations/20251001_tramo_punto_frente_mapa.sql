-- Frente de trabajo resaltado en mapa (parpadeo), independiente de estado_minitramo.

alter table public.canal_tramos
  add column if not exists punto_frente_mapa_id uuid references public.tramo_puntos_avance (id) on delete set null;

create index if not exists canal_tramos_punto_frente_mapa_idx
  on public.canal_tramos (punto_frente_mapa_id)
  where punto_frente_mapa_id is not null;
