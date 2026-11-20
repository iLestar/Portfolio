# Frontend del portafolio

React, TypeScript y Vite. Las fichas públicas leen `src/data/projects.json` y sus
archivos se sirven desde `public/uploads/`. Para navegar no hace falta la API.

```powershell
npm ci
npm run dev
npm run build
```

El panel `/admin` sí necesita la API local. Conserva su inicio de sesión, la edición,
los borradores y las subidas. Vite redirige `/api` a `http://localhost:3000` y utiliza
los archivos estáticos publicados antes de consultar subidas nuevas en la API.

`dist/` contiene la salida estática para publicar. El alojamiento debe resolver las
rutas de la aplicación mediante `index.html`. Los archivos generados de `public/uploads/`
no están en Git; deben restaurarse desde los originales o un respaldo.

Consulta el README de la raíz para arrancar ambos procesos y gestionar los proyectos.
