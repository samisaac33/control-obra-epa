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
- **Asistente multimodal en `/mapa` (residente):** usa **Google AI directo** (facturación/cuota en tu cuenta Google).
  - Cree una API key en [Google AI Studio](https://aistudio.google.com/apikey).
  - En Vercel → **Environment Variables** → **`GOOGLE_GENERATIVE_AI_API_KEY`** = esa clave (Production y Preview). **Redeploy**.
  - No necesita AI Gateway ni `AI_GATEWAY_API_KEY` para el asistente.
  - **Opcional (modelos):** `MAPA_ASISTENTE_CHAT_MODEL` y `MAPA_ASISTENTE_VISION_MODEL` (acepta `google/gemini-3.6-flash` o `gemini-3.6-flash`). Si el principal falla, respaldos: `gemini-3.5-flash-lite`, `gemini-2.5-flash-lite` (no usar `gemini-2.0-*`, retirados por Google).
- **Acceso visitantes (opcional):** `VISITANTE_SESSION_SECRET` (cadena aleatoria ≥ 32 caracteres) y `VISITANTE_PIN` o `VISITANTE_PIN_SHA256` (hash SHA-256 en hex del PIN). Si están definidos, quien no sea residente debe ingresar el PIN en `/ingreso` (cookie firmada ~30 días; sin cuentas en Supabase).

  Generar hash del PIN (ejemplo PIN `482910`):

  ```bash
  node -e "const c=require('crypto');console.log(c.createHash('sha256').update('482910','utf8').digest('hex'))"
  ```

4. En Supabase:

- Crea un bucket privado llamado `evidencias`.
- Ejecuta `supabase/schema.sql` en el SQL Editor.
- Ejecuta las migraciones en `supabase/migrations/`, incluida `20250917_tramo_puntos_avance.sql` (historial GPS de avance por tramo en `/mapa`).
- Reemplaza `TU_CORREO_RESIDENTE` por tu correo real antes de ejecutar (debe coincidir con `NEXT_PUBLIC_RESIDENTE_EMAIL` y las políticas RLS).

### Avance por tramos en `/mapa`

- El avance **georreferenciado** se registra con «Marcar avance en mapa» → «Confirmar avance».
- La edición manual de metros/% en el formulario **no** crea puntos GPS; use el mapa para corregir después.
- Requiere sesión con el correo residente autorizado en RLS.
- **Restablecer tramos en bloque** (puntos GPS, jornadas maquinaria del tramo, vínculo `tramo_id` en fotos):

```bash
npm run reset:tramos-gps:dry-run -- --proyecto desasolve-canales --codigos 1,8
npm run reset:tramos-gps -- --proyecto desasolve-canales --codigos 1,8
```

  Requiere `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`. Alternativa: ejecutar [`supabase/scripts/reset_tramos_desasolve_1_8.sql`](supabase/scripts/reset_tramos_desasolve_1_8.sql) en el SQL Editor de Supabase.

5. Levanta el proyecto:

```bash
npm run dev
```

## Flujo implementado

- `/ingreso`: PIN compartido de obra para visitantes (solo si configuró variables de visita). Tras el PIN, destino por defecto: mapa de desasolve-canales (`/desasolve-canales/mapa`).
- `/login`: acceso por correo y contrasena del residente (omite el PIN).
- Proxy de proteccion: redirige a `/ingreso` sin cookie de visita válida.
- Cierre de sesion del residente o «Salir» de visita desde el header del panel de obra.
- `/fotos`: carga de imagen + latitud/longitud + sector + observacion.
- Evidencias guardadas en Storage y metadatos en `registros_fotograficos`.
