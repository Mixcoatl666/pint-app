<div align="center">

# 📌 pint-app

**Clon funcional de Pinterest: descubre, sube, guarda y comenta imágenes.**

![Next.js](https://img.shields.io/badge/Next.js-16.3.7-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-v5%20beta-1C1C1C)
![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)
![Node](https://img.shields.io/badge/Node-24-339933?logo=nodedotjs&logoColor=white)
![Estado](https://img.shields.io/badge/estado-implementada-brightgreen)
![Spec](https://img.shields.io/badge/spec-SPEC--001%20%C2%B7%2041%20RF-0066CC)

_Interfaz en español · Feed masonry con scroll infinito · Registro y sesión · Subida con drag & drop · Tableros · Comentarios en hilos_

[Características](#-características) · [Puesta en marcha](#-puesta-en-marcha) · [Cómo funciona](#-cómo-funciona) · [Metodología](#-metodología) · [Equipo](#-equipo)

</div>

---

## 📖 Descripción

**pint-app** reproduce la experiencia central de Pinterest: un feed de imágenes en formato masonry con scroll infinito, una página dedicada por cada imagen, guardado en tableros propios, buscador de texto y comentarios con respuestas.

El proyecto se construyó siguiendo una especificación funcional aprobada antes de escribir código ([`specs/001-clon-de-pinterest/spec.md`](specs/001-clon-de-pinterest/spec.md)): **41 requisitos funcionales** en notación EARS y 12 criterios de finalización. Todo lo que hace la app está definido ahí; lo que no está en la spec, no se implementa por cuenta propia.

## ✨ Características

- 🖼 **Feed masonry** con CSS columns y **scroll infinito** (lotes de 20 vía `GET /api/pins?cursor=`)
- 🔐 **Registro e inicio de sesión** con contraseña cifrada (`bcrypt`) y sesión JWT en cookies
- ⬆️ **Subida de imágenes** con arrastrar y soltar, vista previa y validación en servidor (JPEG/PNG/WebP/GIF, máx. 10 MB)
- 📄 **Página propia por pin** (`/pin/[id]`) con imagen, autor, título, descripción y comentarios
- 💬 **Comentarios con respuestas** en hilos de máximo 2 niveles (raíz + respuesta), con permisos de borrado
- 📌 **Guardar en tableros**, incluida la creación de un tablero desde el propio diálogo
- 🔍 **Buscador** por subcadena sobre título y descripción, sin distinguir mayúsculas/minúsculas
- 👤 **Perfiles** (`/user/[id]`) y **tableros** (`/board/[id]`) con sus pines
- 🧭 **Estados vacíos y 404** personalizados, en toda la interfaz en español
- 🛡 **Rutas protegidas**: `/create` y toda mutación verifican la sesión en el servidor

> v1 sin likes, sin seguir usuarios y sin OAuth social (ver [Fuera de alcance](#-fuera-de-alcance-v1)).

## 🛠 Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 · Tailwind CSS v4 · lucide-react (iconos) |
| Lenguaje | TypeScript 5 |
| Datos | Prisma 6 + SQLite (`prisma/dev.db`) |
| Autenticación | Auth.js v5 (`next-auth` beta) · Credentials · bcryptjs |
| Validación | Zod · `image-size` (dimensiones de la imagen) |
| Gestor de paquetes | pnpm 11 |

## 🚀 Puesta en marcha

### Requisitos

- **Node.js 24+** y **pnpm 11** (`corepack enable` para activarlo)
- No hace falta base de datos externa: SQLite viene con el proyecto

### Instalación

```bash
# 1. Clonar e instalar dependencias
git clone <url-del-repo>
cd pint-app
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
#   AUTH_SECRET: genera uno con →  openssl rand -base64 32

# 3. Crear la base de datos (prisma/dev.db) y aplicar migraciones
pnpm prisma migrate dev

# 4. Cargar datos de prueba (usuarios demo + 40 pines)
pnpm prisma db seed

# 5. Arrancar el servidor de desarrollo
pnpm dev
```

Abre **[http://localhost:3000](http://localhost:3000)** y ya puedes usar la app.

### Variables de entorno (`.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Ruta a la base SQLite | `file:./dev.db` |
| `AUTH_SECRET` | Secreto para firmar los JWT de sesión | `openssl rand -base64 32` |
| `AUTH_URL` | URL pública de la app | `http://localhost:3000` |

### Cuentas de prueba

| Email | Contraseña |
|---|---|
| `demo@pint.app` | `password123` |
| `ana@pint.app` | `password123` |
| `luis@pint.app` | `password123` |

### Comandos útiles

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Build de producción |
| `pnpm lint` | ESLint |
| `pnpm prisma migrate dev` | Aplica/crea migraciones |
| `pnpm prisma generate` | Regenera el cliente de Prisma |
| `pnpm prisma db seed` | Siembra usuarios, pines, tableros y comentarios demo |
| `pnpm prisma migrate reset` | Reinicia la BD (migraciones + seed) |

## 📁 Estructura del proyecto

```
pint-app/
├── app/                      # App Router (rutas y páginas)
│   ├── page.tsx              #   Feed principal (/)
│   ├── login/ register/      #   Sesión
│   ├── create/               #   Subida de pines (protegida por proxy.ts)
│   ├── pin/[id]/             #   Página dedicada de cada imagen
│   ├── user/[id]/            #   Perfil de usuario
│   ├── board/[id]/           #   Tablero
│   ├── search/               #   Resultados de búsqueda (?q=)
│   ├── api/pins/             #   JSON paginado del feed (cursor)
│   ├── api/auth/[...nextauth]#   Endpoints de Auth.js
│   └── uploads/[...path]/    #   Sirve ./uploads/ (nunca se escribe en public/)
├── components/               # Componentes de cliente (feed, subida, guardado, comentarios…)
├── lib/
│   ├── actions/              # Server Actions: auth, pins, boards, comments
│   ├── queries.ts            # Consultas compartidas y mapeo a DTOs
│   ├── auth.ts / dal.ts      # Sesión actual y guardias (requireUser)
│   └── validation.ts         # Esquemas Zod en español
├── prisma/
│   ├── schema.prisma         # Modelos: User, Pin, Board, Save, Comment
│   ├── migrations/           # Migraciones aplicadas
│   └── seed.mjs              # Datos de prueba (SVG generados localmente)
├── specs/                    # Especificaciones funcionales (fuente de verdad)
├── uploads/                  # Imágenes subidas (en tiempo de ejecución)
├── proxy.ts                  # Guardia de rutas (Next 16: middleware → proxy)
├── AGENTS.md                 # Memoria del proyecto para agentes de IA
└── next.config.ts            # Límites de subida y configuración experimental
```

## 🧠 Cómo funciona

**Renderizado.** Páginas en Server Components por defecto (feed, pin, perfil, tablero, búsqueda); solo lo interactivo es Client Component (`save-button`, `comment-section`, `pin-upload-form`, `infinite-feed`).

**Mutaciones con Server Actions.** No hay API propia para escribir: los formularios llaman a acciones de servidor (`lib/actions/`). **Cada acción verifica la sesión** con `requireUser()` antes de tocar la base de datos, y refresca la vista con `refresh()` de `next/cache`.

**Autenticación.** Auth.js v5 con Credentials: hash con `bcrypt`, sesión como JWT en cookie httpOnly. `proxy.ts` redirige a `/login` las rutas protegidas, y el servidor vuelve a comprobarlo en cada acción (doble barrera).

**Subida de imágenes.** El archivo se valida en el servidor (formato, 10 MB, dimensiones con `image-size`), se guarda con nombre UUID en `./uploads/` y se sirve desde la route handler `app/uploads/[...path]/route.ts` con un patrón de nombre estricto. Nunca se escribe en `public/` en tiempo de ejecución. `next.config.ts` amplía `serverActions.bodySizeLimit` a 16 MB y `proxyClientMaxBodySize` a 20 MB para que un archivo de ~10 MB llegue completo a nuestro validador (los límites por defecto, 1 MB y 10 MB, lo truncarían o rechazarían antes).

**Feed y paginación.** Cursor compuesto `[{createdAt desc}, {id desc}]` para un orden estable; se piden 21 y se devuelven 20; el cliente para cuando `nextCursor` es `null`.

**Comentarios.** Árbol de máximo 2 niveles: si se responde a una respuesta, el servidor la ancla a la raíz. Pueden borrar el autor del comentario y el dueño del pin; el borrado de una raíz elimina sus respuestas en cascada.

## 📐 Metodología

El proyecto siguió un flujo **spec-driven** (guiado por especificación), con separación clara entre decidir *qué* y construir *cómo*:

1. **📐 Especificación primero** — Se redactó `specs/001-clon-de-pinterest/spec.md` con 41 requisitos funcionales numerados (`RF-1`…`RF-41`) en notación **EARS** (*Easy Approach to Requirements Syntax*), cada uno con un único comportamiento observable, más historias de usuario y 12 criterios de finalización.
2. **✅ Aprobación humana** — Solo el propietario puede pasar la spec de `Borrador` a `Aprobada`. Aprobada el 2026-09-30 por Noah. **La spec es el contrato**: si un comportamiento no aparece en ella, no se asume: se pregunta o se registra como duda abierta.
3. **🧭 Decisiones registradas** — Los acuerdos técnicos (stack, límites, alcance, convenciones) se documentaron en [`AGENTS.md`](AGENTS.md), la memoria del proyecto que consulta cualquier agente antes de tocar código.
4. **🧪 Implementación incremental** — En orden de dependencias: esquema de datos y migraciones → seed de prueba → autenticación → server actions (con validación Zod en español) → consultas y DTOs → UI componente a componente → rutas y protección con `proxy.ts`.
5. **🔍 Verificación contra la spec** — Cada `RF` se comprobó de forma observable: peticiones HTTP, invocación real de las Server Actions (incluidos casos de rechazo: contraseña corta, email duplicado, archivo de 11 MB, borrado por un tercero…), comprobación de cascadas en la BD y estados vacíos. Además `pnpm build`, `pnpm lint` y `tsc --noEmit` en verde.
6. **♻️ Cierre** — Spec marcada como `Implementada` y `AGENTS.md` actualizado con el estado y las decisiones nuevas.

## 🤖 Equipo

Este proyecto se construyó en **colaboración directa entre una persona y un agente de IA**, con roles explícitos:

| Rol | Quién | Responsabilidades |
|---|---|---|
| 👤 **Producto y decisión** | **Noah** (propietario) | Define el alcance, resuelve dudas, **aprueba la spec** y valida el resultado final |
| 🤖 **Desarrollo** | **MiMo** (agente de IA en OpenCode) | Configura el stack, escribe el código, redacta specs y documentación, ejecuta las verificaciones y mantiene `AGENTS.md` |

**Cómo colaboramos:** Noah dirige y aprueba; MiMo ejecuta y verifica. El agente trabaja siempre contra la spec aprobada y `AGENTS.md` como memoria compartida, y no incorpora funcionalidades que no estén acordadas. Prácticamente todo el código fuente de este repositorio —incluidas estas documentaciones— fue escrito por el agente bajo supervisión de Noah.

## ✅ Estado

| Verificación | Estado |
|---|---|
| Spec `SPEC-001` (41 RF + 12 criterios) | 🟢 Implementada y verificada |
| `pnpm build` · `pnpm lint` · `tsc --noEmit` | 🟢 Sin errores |
| Flujo completo por HTTP/acciones (auth, subida, guardado, comentarios, borrados, búsqueda, 404, estados vacíos) | 🟢 Verificado |
| Comprobaciones visuales (drag & drop, hover del masonry, responsive 320–1440) | 🟡 Pendiente manual |

## 🗺 Fuera de alcance (v1)

Likes · seguir usuarios · notificaciones · OAuth social · edición de perfil y de pines publicados · roles de moderación · recomendaciones y filtros · multiidioma · app móvil · estadísticas.

## 📚 Documentación

- [`specs/001-clon-de-pinterest/spec.md`](specs/001-clon-de-pinterest/spec.md) — especificación funcional completa (fuente de verdad)
- [`AGENTS.md`](AGENTS.md) — memoria del proyecto, decisiones y convenciones
- [Next.js Docs](https://nextjs.org/docs) · [Prisma](https://www.prisma.io/docs) · [Auth.js](https://authjs.dev)
