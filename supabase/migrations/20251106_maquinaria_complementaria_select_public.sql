-- Lectura pública de trabajos complementarios (igual que movimientos cama baja) para reportes en /maquinaria.

drop policy if exists "proyecto_maquinaria_complementaria_select" on public.proyecto_maquinaria_complementaria;
create policy "proyecto_maquinaria_complementaria_select"
on public.proyecto_maquinaria_complementaria
for select
using (true);
