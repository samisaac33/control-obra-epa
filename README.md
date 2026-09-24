# Control de Obra EPA

Sistema en Next.js para seguimiento de obra con autenticacion de residente y registro fotografico georreferenciado.

## Configuracion

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
cp .env.example .env.local
```

3. Completa en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RESIDENTE_EMAIL` (correo autorizado para editar)

4. En Supabase:

- Crea un bucket privado llamado `evidencias`.
- Ejecuta `supabase/schema.sql` en el SQL Editor.
- Ejecuta las migraciones en `supabase/migrations/`, incluida `20250917_tramo_puntos_avance.sql` (historial GPS de avance por tramo en `/mapa`).
- Reemplaza `TU_CORREO_RESIDENTE` por tu correo real antes de ejecutar (debe coincidir con `NEXT_PUBLIC_RESIDENTE_EMAIL` y las políticas RLS).

### Avance por tramos en `/mapa`

- El avance **georreferenciado** se registra con «Marcar avance en mapa» → «Confirmar avance».
- La edición manual de metros/% en el formulario **no** crea puntos GPS; use el mapa para corregir después.
- Requiere sesión con el correo residente autorizado en RLS.

5. Levanta el proyecto:

```bash
npm run dev
```

## Flujo implementado

- `/login`: acceso por correo y contrasena.
- Middleware de proteccion para rutas privadas.
- Cierre de sesion desde el header.
- `/fotos`: carga de imagen + latitud/longitud + sector + observacion.
- Evidencias guardadas en Storage y metadatos en `registros_fotograficos`.
