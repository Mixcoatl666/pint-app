<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — pint-app

> Memoria del proyecto para agentes. Mantener actualizado.

## Proyecto

- **pint-app**: clon de Pinterest (interfaz + lógica) en la raíz de este repositorio.
- **Estado**: `specs/001-clon-de-pinterest/spec.md` **Aprobada** (2026-09-30 por Noah) → **implementada**. Verificada contra la spec por peticiones HTTP y acciones de servidor (login/registro/subida/guardado/comentarios/borrado/búsqueda/404/estados vacíos); quedan pendientes solo comprobaciones visuales en navegador real (drag & drop, hover, responsive).
- **Entorno**: macOS, Node 24, pnpm 11.

## Decisiones acordadas (2026-09-30)

- **Stack**: Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4; pnpm.
- **Datos**: Prisma 6 + SQLite (`prisma/dev.db` via `DATABASE_URL`); imágenes subidas en `./uploads/` servidas por route handler `app/uploads/[...path]/route.ts` (nunca escribir en `public/` en runtime).
- **Auth**: Auth.js v5 (`next-auth@beta`) con Credentials + `bcryptjs`; sesión JWT en cookies; `proxy.ts` (Next 16 renombra middleware→proxy) protege `/create`; toda action verifica sesión con `await auth()`.
- **Alcance**: núcleo completo. **Sin likes**. **Con comentarios** (hilos de máximo 2 niveles: raíz + respuestas).
- **Subida de imágenes**: JPEG/PNG/WebP/GIF, máximo 10 MB, dimensiones con `image-size`. `next.config.ts` fija `experimental.serverActions.bodySizeLimit: "16mb"` y `proxyClientMaxBodySize: "20mb"` (por defecto 1 MB y 10 MB: truncarían o rechazarían antes de llegar al validador en español).
- **Feed**: masonry con CSS columns, scroll infinito vía `GET /api/pins?cursor=`, lotes de 20.
- **Idioma**: español en interfaz, mensajes de error, estados vacíos y specs.

## Reglas de Next.js 16 aplicadas aquí

- `proxy.ts` (no `middleware.ts`), función `proxy`, runtime Node.
- APIs de request asíncronas: `await cookies()`, `await headers()`, `await params`, `await searchParams`. Tipos con `PageProps<'/ruta'>` y `RouteContext<'/ruta'>`.
- Server Actions para mutaciones + `refresh()`/`revalidatePath()` de `next/cache`; verificar auth dentro de CADA action.
- `next build` no ejecuta lint; lint con `pnpm lint` (eslint CLI).

## Fuera de alcance (NO implementar en v1)

Likes · seguir usuarios · notificaciones · OAuth social · edición de perfil (avatar con iniciales) · edición de pines publicados (solo borrar) · roles admin / moderación / denuncias · recomendaciones o filtros · multiidioma · app móvil · estadísticas.

## Convenciones

- Specs en `specs/NNN-<nombre-en-kebab-case>/spec.md`; estados: Borrador → Por validar → Aprobada → Implementada. Solo una aprobación humana explícita permite marcar `Aprobada`.
- Requisitos numerados `RF-n` con notación EARS, un solo comportamiento observable por RF.
- **Si un comportamiento no está en la spec, no asumirlo**: preguntar al usuario o registrarlo como duda abierta.
- UI estilo Pinterest: navbar fija con buscador central, feed masonry con hover (título + «Guardar»), página de pin a 2 columnas sobre fondo gris claro.
- Rutas: `/` feed, `/login`, `/register`, `/create`, `/pin/[id]`, `/user/[id]`, `/board/[id]`, `/search?q=`.

## Comandos

- `pnpm dev` · `pnpm build` · `pnpm lint`
- `pnpm prisma migrate dev` (migraciones) · `pnpm prisma generate`
- `pnpm prisma db seed` (siembra: usuarios demo + pines de ejemplo)

## Datos de prueba (seed)

- Usuarios demo: `demo@pint.app` / `password123` (y otro usuario `ana@pint.app` / `password123`).
- ~40 pines con imágenes SVG generadas localmente en `./uploads/` (proporciones variadas), sin dependencia de internet.
