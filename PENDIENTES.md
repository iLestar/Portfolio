# Lo que falta preparar — checklist para Let

## Orden de trabajo acordado

1. **Cargar los trabajos reales.** Localizar los archivos, seleccionar las piezas y preparar cada ficha con portada, resultado o proceso, textos ES/EN y adjuntos. Revisar que cada proyecto guardado se vea correctamente en el sitio.
2. **Rediseñar la identidad visual.** Con los proyectos cargados, trabajar monograma, tipografía, color, composición y presentación de las piezas, incluyendo móvil.
3. **Desplegar.** Cuando la presentación visual esté lista, cerrar dominio, configuración de producción y publicación.

### Primera etapa: trabajos
- [ ] Localizar la carpeta con los trabajos y elegir el primero.
- [ ] Comprobar el acceso al panel y la conexión con MySQL.
- [ ] Preparar portada y piezas visibles en formatos de imagen; conservar PDF y archivos editables como adjuntos cuando corresponda.
- [ ] Cargar cada ficha y verificar que sus imágenes, textos y descargas se hayan guardado.
- [ ] Elegir los proyectos destacados para la home.

## Contenido
- [ ] **Carpeta de proyectos organizada.** Una carpeta por proyecto con: `final/` (la pieza terminada en JPG/PNG/WebP) y `proceso/` (brief, bocetos, iteraciones, descartes). Si un proyecto es solo resultado, basta `final/`.
- [ ] **Bio definitiva ES** (la EN la adapto yo de la tuya). 3–6 líneas, tu voz.
- [ ] **Servicios reales:** qué ofreces y qué NO ofreces (ej. ¿haces ilustración por encargo? ¿solo branding?).
- [ ] **Foto tuya** para Sobre mí — 1200px+ de alto, fondo sobrio.
- [ ] **Email de contacto** público + **URLs de redes** (Instagram, Behance, LinkedIn, GitHub).
- [ ] **CV en PDF** (opcional) si quieres enlazarlo.

## Decisiones pendientes
- [ ] **Monograma:** refinar en Illustrator el concepto "L + chispa" (`proposal/monograma-a-lspark.svg`) o el de estrella en negativo. Exportar SVG limpio + PNG 512px para favicon.
- [ ] **Textos del claim de home** — el actual es borrador: "Diseñador gráfico en formación con criterio de sobra…".
- [ ] **Dominio** — ¿lestar.co / lestar.design / letdiseno…? Decide antes del deploy.
- [ ] **Clave del panel** — cambiar `ADMIN_PASSWORD` y `JWT_SECRET` en `server/.env`.

## Lo que ya está hecho
- Home cinética (LESTAR degradado, marquee, pósters inclinados)
- Índice de proyectos con filtros por categoría
- Ficha dual: resultado final / proceso completo
- Sobre mí, Servicios, Dev, Contacto + redes
- ES/EN con selector persistente
- Panel admin: login, CRUD completo, subida de imágenes, bandeja de mensajes
- API NestJS + MySQL + seed con tus 4 proyectos nombrados + 1 placeholder
- Respaldo local si la API está apagada
