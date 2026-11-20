# Frontend independiente y editor con API JSON

El catálogo público usa `client/src/data/projects.json`: 13 proyectos publicados,
con sus categorías, destacados, créditos y textos ES/EN. Las fichas conservan su
diseño, galerías, visor de PDF y enlaces de descarga. No se consulta `/api` para leer proyectos.

Los 59 archivos referenciados están copiados en `client/public/uploads/` (440,1 MiB).
Vite los sirve directamente en desarrollo y los incluye en `client/dist/` al compilar.
Esta carpeta generada está excluida de Git para no incorporar cientos de megabytes
al historial. **Un clon del repositorio necesita restaurar esos archivos antes de compilar.**
Los originales siguen en `server/uploads/` y en el respaldo local.

## Ejecutar y compilar

```powershell
npm --prefix client run dev
npm --prefix client run build
npm --prefix client run preview
```

Ninguno de estos comandos necesita iniciar la API ni un proveedor de traducción.
La comprobación previa a la compilación revisa el formato del catálogo y
que existan todos los archivos referenciados. La carpeta `client/dist/` es la salida
para un alojamiento estático; este cambio no publica la web en internet.
El alojamiento debe redirigir las rutas de la aplicación a `index.html`.

## Contenido y actualizaciones

El catálogo público contiene únicamente proyectos publicados. Los borradores y mensajes permanecen en los archivos privados del backend.

El panel actual guarda las fichas en `server/data/projects.json`.
Para editar, inicia el backend y el frontend y entra en `/admin`. Al publicar,
modificar, despublicar o borrar un proyecto, la API actualiza automáticamente
el catálogo público y copia los archivos publicados nuevos. Los borradores
quedan fuera del catálogo. Las imágenes recién subidas se previsualizan mediante
la API local; las publicadas siguen disponibles con el backend apagado.

La actualización de un alojamiento en internet requiere compilar y volver a
desplegar. No es necesario editar JSON a mano en el uso normal.
`npm run export:static` permite regenerar el catálogo y copiar sus archivos desde
`server/data/projects.json`, sin necesidad de iniciar la API.

## Contacto

El formulario prepara un enlace `mailto:` con nombre, correo y mensaje. El visitante
debe enviarlo desde su aplicación de correo; la web no muestra un envío confirmado
ni guarda el mensaje en la antigua bandeja. También se conserva el enlace al correo
directo y las redes sociales. Las traducciones existentes están incluidas en el catálogo;
para mostrarlas no se necesita el traductor.

## Verificaciones

```powershell
node --test scripts/export-static.test.mjs
node scripts/check-static.mjs
```

Verificado el 13 de noviembre de 2026: compilación correcta, dos pruebas de exportación,
13 fichas comprobadas en el navegador, filtros y cambio ES/EN funcionales. Los 59
archivos coinciden por SHA-256 con los originales y la compilación. Los ocho PDF
responden a solicitudes parciales, necesarias para el visor. La API y el proveedor de traducción permanecieron apagados durante esa comprobación.
