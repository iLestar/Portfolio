# Lestar — Portafolio

Portafolio de **Juan Guillermo Gómez**, diseñador gráfico conocido como **Lestar**.
Reúne trabajos de ilustración vectorial, diseño editorial, identidad de marca y
edición de imágenes, con información sobre cada proyecto y los aportes en equipo.

**[Ver el portafolio →](https://ilestar.github.io/Portfolio/)**

El sitio está disponible en español e inglés. Incluye galerías, publicaciones PDF
y archivos descargables. Las tarjetas y miniaturas utilizan WebP; los originales
se conservan para ver los trabajos en detalle.

## Cómo se administra

La web pública funciona en GitHub Pages. Para crear o editar proyectos se utiliza
un panel privado en el computador, con inicio de sesión y almacenamiento en JSON.
El panel no está disponible en la web publicada.

### Iniciar el editor

Desde la carpeta del proyecto, abre dos terminales:

**Backend**

```powershell
npm run dev:server
```

**Frontend**

```powershell
npm run dev:client
```

Abre el [panel local](http://localhost:5173/admin) e inicia sesión con las
credenciales configuradas en `server/.env`.

### Actualizar el portafolio

1. Crea o edita una ficha y guarda los cambios. Los borradores quedan fuera de la web pública.
2. En el panel, pulsa **Preparar vista previa**.
3. Abre la vista previa y revisa el resultado.
4. Pulsa **Publicar en internet** y espera a que el panel confirme la publicación.

Guardar una ficha actualiza la copia local; publicar envía la versión revisada a
GitHub Pages. Después, la web sigue funcionando con el computador apagado.

**Publicar la web no respalda los cambios del código fuente.** Estos se guardan
por separado mediante commits y se integran en `main` mediante un PR. El sitio
compilado se envía a la rama `gh-pages`.

## Respaldo y cambio de equipo

```powershell
npm run backup
```

Genera un respaldo fechado en `D:\Descargas\Documents\RespaldosPortfolio`.
Los proyectos privados y borradores están en `server/data/`, y los archivos
originales en `server/uploads/`. Estas carpetas están excluidas de Git: clonar el
repositorio no recupera por sí solo todo el contenido del editor. Conserva también
una copia privada de `server/.env`.

Para instalar en otro equipo, utiliza Node.js 24 o posterior:

```powershell
npm --prefix client ci
npm --prefix server ci
```

Restaura los datos y archivos desde el respaldo y configura `server/.env` a partir
de `server/.env.example`. `npm run init:data` permite iniciar los JSON desde el
catálogo público si no hay un respaldo; no recupera los borradores ni los archivos
originales ausentes.

## Sobre el código

- **Frontend:** React, TypeScript y Vite, con un catálogo público que funciona sin la API.
- **Editor local:** NestJS, autenticación y archivos JSON; no requiere MySQL ni Docker.
- **Publicación:** GitHub Pages, con una vista previa antes de enviar los cambios.

Más detalles: [publicación desde el panel](docs/publicar-en-internet.md) y
[funcionamiento del frontend estático](docs/frontend-estatico.md).
