# Backend de captura de leads — FLUIQ

El sitio es estático, pero los formularios ahora envían los datos a una
**función serverless** que valida, guarda el lead en Supabase (opcional) y
envía una **notificación por email**. Todo dentro de capas gratuitas.

```
Navegador (form)  ──POST /api/lead──▶  Netlify Function (lead.js)
                                          ├─▶ Supabase  (guarda el lead)
                                          └─▶ Resend    (email de aviso)
```

## 1. Desplegar en Netlify (gratis)

1. Entrá a [netlify.com](https://netlify.com) y conectá este repositorio de GitHub.
2. Netlify detecta `netlify.toml` solo. No hace falta configurar build:
   - **Publish directory:** `.`
   - **Functions directory:** `netlify/functions`
3. Deploy. El sitio queda online y la función disponible en `/api/lead`.

## 2. Email con Resend (gratis: 3.000/mes)

1. Creá una cuenta en [resend.com](https://resend.com).
2. **API Keys → Create API Key.** Copiá la clave (`re_...`).
3. Para empezar podés enviar desde el dominio de prueba `onboarding@resend.dev`.
   Para producción, verificá tu propio dominio en **Domains** y usá
   `FROM_EMAIL=FLUIQ <hola@tudominio.com>`.

## 3. Supabase (opcional — guardar los leads)

1. En tu proyecto de Supabase abrí **SQL Editor** y ejecutá el contenido de
   [`supabase/schema.sql`](supabase/schema.sql). Crea la tabla `leads` con
   Row Level Security activado.
2. **Project settings → API:** copiá `Project URL` y la clave **`service_role`**
   (NO la `anon` — la `service_role` se usa solo en el servidor y nunca se
   expone al navegador).

> Si no configurás Supabase, el sistema igual funciona: solo manda el email.

## 4. Variables de entorno en Netlify

**Site settings → Environment variables.** Cargá (ver `.env.example`):

| Variable | Requerida | Valor |
|---|---|---|
| `RESEND_API_KEY` | Sí (email) | `re_...` |
| `NOTIFY_EMAIL` | Recomendada | `santicelemink@gmail.com` |
| `FROM_EMAIL` | Recomendada | `FLUIQ <onboarding@resend.dev>` |
| `SUPABASE_URL` | Opcional | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional | `eyJ...` |
| `ALLOWED_ORIGIN` | Opcional | tu dominio real, ej. `https://fluiq.com` |

Tras cargarlas, **Deploys → Trigger deploy** para que tomen efecto.

## Seguridad del backend

- Validación y saneo de todos los campos **del lado del servidor**.
- Honeypot + chequeo de velocidad de llenado server-side (anti-bot).
- Rate-limiting por IP (máx. 3 envíos/minuto) usando Supabase.
- Límite de tamaño de payload (8 KB) y verificación de método/JSON.
- Escape de HTML en el email para evitar inyección de contenido.
- `service_role` y API keys viven solo como variables de entorno, nunca en el repo.
- RLS activado en la tabla `leads`: inaccesible desde el navegador.

## Adaptar a Vercel

La función usa la firma estándar `exports.handler`. Para Vercel, movela a
`/api/lead.js` adaptando la firma a `(req, res)`, o usá Vercel Functions.
La lógica de validación/email/Supabase es la misma.
