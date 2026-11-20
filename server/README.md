# API del portafolio

NestJS con inicio de sesión JWT y archivos JSON. La configuración está en `.env`.

```powershell
npm ci
npm run start:dev
```

`DATA_DIR` contiene `projects.json` y `messages.json`; `UPLOADS_DIR` contiene las
imágenes y documentos originales. Ambas carpetas deben conservarse y respaldarse.
El proceso debe ejecutarse desde `server/` (los comandos de la raíz ya lo hacen).

Las rutas están bajo `/api`: login en `/auth/login`, lectura pública de proyectos
en `/projects` y edición autenticada en `/projects/admin`. Las subidas autenticadas
usan `/upload` y se sirven desde `/uploads/`.

Los guardados reemplazan atómicamente el JSON y conservan el archivo anterior en
`.bak`. Se utiliza un único proceso de API para serializar las escrituras.
El JSON inválido no se sustituye por un archivo vacío.

```powershell
npm test
npm run build
npm run start:prod
```

La comprobación integrada desde la raíz es `npm run check:api` y requiere compilar
antes el backend. Usa credenciales y archivos temporales, sin modificar datos reales.

Consulta el README de la raíz para configurar el panel y restaurar los respaldos.
