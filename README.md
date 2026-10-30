# Lestar — Portafolio

Portafolio web de **Let (Lestar)**: diseño gráfico (branding, editorial, ilustración) con sección de desarrollo. Sitio bilingüe ES/EN, tema oscuro, dirección visual "editorial cinética".

## Stack

| Pieza | Tecnología | Carpeta |
|---|---|---|
| Frontend + panel admin | React 19 + TypeScript + Vite + CSS propio (tokens) | `client/` |
| API | NestJS 12 + TypeORM | `server/` |
| Base de datos | MySQL 8.4 (Docker en dev) | `docker-compose.yml` |

```
lestar-portfolio/
├── client/      ← el sitio público Y el panel /admin
├── server/      ← API REST + auth JWT + subida de imágenes
├── docker-compose.yml
└── proposal/    ← mockups y monograma de la propuesta inicial
```

## Requisitos (Windows 11)

1. **Node.js 20 LTS** — https://nodejs.org (instala el LTS; verifica con `node -v` → debe empezar en `v20`).
2. **Docker Desktop** — para la base de datos (https://docs.docker.com/desktop/setup/install/windows-install/).
   - Alternativa sin Docker: instala MySQL 8 manualmente y crea la base `portfolio` con usuario `lestar` / clave `lestar_dev`, o ajusta `server/.env` a tu instalación.
3. **Git** — https://git-scm.com.

## Instalación (una vez)

```powershell
cd lestar-portfolio

# 1) Dependencias
npm --prefix client install
npm --prefix server install

# 2) Base de datos
docker compose up -d

# 3) Config del servidor
cd server
copy .env.example .env     # edita ADMIN_USER / ADMIN_PASSWORD / JWT_SECRET
npm run seed               # carga proyectos de ejemplo (opcional)
cd ..
```

## Ejecutar (cada sesión de trabajo)

Necesitas **3 terminales** (o pestañas):

```powershell
# Terminal 1 — base de datos (si no quedó corriendo)
docker compose up -d

# Terminal 2 — API en http://localhost:3000/api
npm --prefix server run start:dev

# Terminal 3 — sitio en http://localhost:5173
npm --prefix client run dev
```

Abre http://localhost:5173 — el panel está en http://localhost:5173/admin

## Panel de administración

- Login: usuario/clave de `server/.env` (`ADMIN_USER` / `ADMIN_PASSWORD`).
- Desde el panel: **crear, editar, publicar/despublicar, destacar y borrar** proyectos, subir portada e imágenes de proceso, y leer los mensajes del formulario de contacto.
- Los cambios aparecen en el sitio público de inmediato (si el servidor está apagado, el sitio muestra los datos de `client/src/data/projects.ts` como respaldo).

## Agregar un proyecto nuevo

1. Entra a `/admin` → **+ Nuevo proyecto**.
2. Escribe el título (el slug/URL se genera solo).
3. Elige **tipo de ficha**:
   - *Resultado final* → solo resumen + texto + portada.
   - *Proceso completo* → además habilita las secciones Briefing → Bocetos → Decisiones → Resultado, cada una con imagen y texto ES/EN.
4. Sube la portada (JPG/PNG/WebP/AVIF) y, si quieres, **archivos adjuntos** (PDF, INDD, IDML, AI, PSD, ZIP — máx. 100 MB c/u; se muestran como enlaces descargables en la ficha, el PDF se abre en el visor del navegador).
5. Marca *Destacado* para que salga en la home, *Publicado* para que sea visible.
6. Guardar. Listo — ya está en `/proyectos` y en su URL `/proyectos/<slug>`.

## Estructura del código (dónde tocar qué)

| Quieres cambiar… | Archivo |
|---|---|
| Colores, fuentes, espaciado | `client/src/styles/tokens.css` |
| Estilos del sitio | `client/src/styles/site.css` (por secciones) |
| Textos de la interfaz ES/EN | `client/src/i18n/es.ts` · `en.ts` |
| Contenido de respaldo | `client/src/data/projects.ts` |
| Esquema de la base | `server/src/projects/project.entity.ts` |
| Credenciales/puertos | `server/.env` |

## Despliegue (cuando toque)

- **Frontend:** `npm --prefix client run build` → `client/dist/` estático (Vercel, Netlify, Cloudflare Pages gratis).
- **Backend:** `npm --prefix server run build && npm --prefix server run start:prod` + MySQL gestionada (Railway, Render, un VPS…).
- En producción: `synchronize: false` en `server/src/app.module.ts` y credenciales reales por variables de entorno.

## Pendientes conocidos

- Los textos marcados `[PENDIENTE]` son placeholders a reemplazar desde el panel.
- El formulario de contacto guarda mensajes en la base (se leen en el panel); envío por email es una mejora futura.
- Imágenes: se sirven de `server/uploads/` en dev; en producción conviene un almacenamiento externo.
