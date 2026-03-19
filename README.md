# Wegox Booking Frontend

Frontend web de Wegox Booking, una plataforma SaaS de reservas multi-tenant para negocios de servicios.

## Que incluye esta aplicacion

- login de administradores
- restauracion de sesion con refresh token y CSRF
- dashboard privado por rol
- flujo publico de reservas por `tenantSlug`
- branding dinamico por tenant y por plataforma
- gestion de servicios, empleados y bookings
- onboarding visual para tenant admins
- activacion de cuenta y password reset

## Stack tecnico

- Next.js 16.1.6
- React 19.2.3
- TypeScript
- Tailwind CSS 4
- Radix UI
- Recharts
- driver.js

## Rutas principales

- `/`: login
- `/forgot-password`: solicitud de recuperacion o reenvio de acceso
- `/reset-password`: definicion de nueva password mediante token
- `/activate-account`: activacion inicial de cuenta de tenant admin
- `/book/[tenantSlug]`: reserva publica
- `/dashboard`: resumen por rol
- `/services`: gestion de servicios
- `/employees`: gestion de empleados
- `/bookings`: gestion de reservas
- `/tenants`: gestion de tenants para `SUPER_ADMIN`
- `/users`: gestion de tenant admins para `SUPER_ADMIN`
- `/audit-logs`: auditoria
- `/settings`: branding y configuracion visual

## Requisitos

- Node.js 20+
- pnpm
- backend compatible levantado

## Puesta en marcha local

1. Instala dependencias:

```bash
pnpm install
```

2. Configura `.env` con al menos:

- `NEXT_PUBLIC_API_URL`

3. Levanta el entorno de desarrollo:

```bash
pnpm dev
```

4. Para validar produccion local:

```bash
pnpm build
pnpm start
```

## Scripts utiles

```bash
pnpm dev
pnpm build
pnpm lint
pnpm exec tsc --noEmit
```

## Alcance funcional validado

El estado actual del frontend cubre:

- login seguro con captcha opcional
- access token solo en memoria
- refresh automatico ante `401`
- dashboard con navegacion segun `SUPER_ADMIN` o `TENANT_ADMIN`
- CRUD visual de servicios
- CRUD visual de empleados
- upload y visualizacion de avatars de empleados
- creacion y gestion de bookings
- flujo publico de reserva multi-step
- branding dinamico con logo, favicon, titulo y variables CSS
- tour inicial para tenant admins
- activacion de cuenta y password reset por token

## Compatibilidad de release

Para la primera salida publica del MVP, este frontend esta pensado para emparejarse con el backend `v1.0.0-beta.1`.

## Limitaciones conocidas

- no hay suite automatizada de tests frontend todavia
- no hay pagos integrados
- no hay WhatsApp o SMS nativo
- no hay calendar sync
- la app depende de una configuracion correcta de `NEXT_PUBLIC_API_URL`, cookies y CORS
