# Publicar desde el panel local

## Uso normal

1. Inicia el backend y el frontend con `npm run dev:server` y `npm run dev:client`.
2. Entra en `/admin` y crea o edita las fichas. Guarda como borrador lo que no quieras mostrar.
3. En el panel, usa **1. Preparar vista previa**. La preparación compila una copia pública independiente.
4. Abre **Revisar vista previa**. Puedes comprobar fichas, galerías y descargas sin enviar nada a internet.
5. Cuando esté bien, usa **2. Publicar en internet**. El panel muestra si sigue enviando, si los archivos ya llegaron o si la versión se verificó en la dirección pública.

La versión en internet sigue funcionando cuando el computador está apagado. El panel
de edición funciona en el computador. Guardar una ficha y publicarla en internet son
dos pasos distintos, para poder revisar antes de compartir.

## Primera activación de GitHub Pages

El repositorio configurado es `iLestar/Portfolio`, que es público. El envío utiliza
Git y la autenticación habitual del computador mediante Git Credential Manager.
Si Git no tiene acceso a tu cuenta, hay que iniciar sesión una vez; no se pide ni
guarda una contraseña o token de GitHub en el panel.

Después del primer envío:

1. Abre el enlace **Activar GitHub Pages la primera vez** del panel.
2. En **Build and deployment**, selecciona **Deploy from a branch**.
3. Selecciona la rama **gh-pages** y la carpeta **/(root)**, y guarda.
4. Espera a que GitHub termine el despliegue. El panel puede comprobarlo con
   **Comprobar publicación**. «Archivos enviados» no significa todavía «sitio publicado».

La dirección prevista es `https://ilestar.github.io/Portfolio/`.
La activación es un paso único de la cuenta; los siguientes cambios se envían desde el panel.
Este cambio de código no ha realizado un envío a GitHub ni ha activado el alojamiento.

## Qué se comparte

- Solo la compilación pública, con las fichas publicadas y sus archivos referenciados.
- Los borradores, mensajes, archivos originales no seleccionados y credenciales quedan en el computador.
- Las rutas del panel no se incluyen en la versión pública.
- La publicación se envía a **gh-pages** desde un checkout temporal independiente;
  no cambia `main`, la rama de trabajo ni los archivos que estás editando.
- No utiliza `push --force`. Si la rama de publicación contiene una web ajena al
  publicador, el envío se detiene en vez de reemplazarla.

La carpeta `tmp/` contiene las vistas previas y copias temporales; está fuera de Git.
Las portadas de las tarjetas y las miniaturas de la galería se generan automáticamente
en WebP al guardar o preparar una publicación. Se conserva la proporción, sin ampliar
imágenes pequeñas. La portada dentro de la ficha y los enlaces para ampliar conservan
el archivo original. No necesitas subir dos versiones de cada imagen.
Los datos privados continúan en `server/data/` y los originales en `server/uploads/`.
`PAGES_REPOSITORY` permite configurar el repositorio de destino en `server/.env`.

## Límites y archivos grandes

Se comprueban los límites de 100 MiB por archivo y un tamaño total conservador
inferior a 1 GB. La versión actual tiene aproximadamente 441 MiB y conserva sus PDF
y editables. Por ahora no necesita un servicio adicional para esos archivos.
Si el portafolio crece, habrá que optimizar los documentos o separar las descargas grandes.

Las rutas se preparan para `/Portfolio/`, incluidos recursos y enlaces directos a
las fichas. Se generan páginas de entrada para cada proyecto y las páginas principales,
de modo que puedan abrirse directamente sin un backend en internet.

## Comprobaciones de desarrollo

```powershell
npm run test:pages
npm --prefix server test
npm --prefix server run build
npm run check:api
npm run pages:prepare
```

`pages:prepare` solo genera una copia revisable dentro de `tmp/`: no publica nada.
Las pruebas de envío usan un repositorio Git local temporal y verifican que `main`
se conserve y que los archivos privados no se envíen.
