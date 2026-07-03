-- Latitud/longitud opcionales; número de rubro como texto libre.

alter table public.registros_fotograficos
  alter column lat drop not null,
  alter column lng drop not null;

alter table public.registros_fotograficos
  alter column numero_rubro type text using numero_rubro::text;
