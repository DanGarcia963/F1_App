# F1_App - frontend Netlify

Rama de despliegue: **frontend-deploy**. Contiene solamente las paginas HTML, estilos y fotografias.

## Configuracion de Netlify

- Repositorio: DanGarcia963/F1_App
- Branch to deploy: frontend-deploy
- Base directory: raiz del repositorio (vacio)
- Build command: npm run build
- Publish directory: dist
- Variable obligatoria: BACKEND_URL=https://TU_SERVICIO.up.railway.app (sin /api ni / final)

El build copia los HTML de pages/, CSS de public/styles y fotografias de Driver_photos, Team_photos y Logos al directorio dist/. La pagina inicial es pages/categories.html, publicada como index.html.

El build genera dist/_redirects, con rutas limpias como /pilotos y un proxy Netlify de /api/* hacia BACKEND_URL/api/*. **No es necesario cambiar los fetch('/api/...') actuales.** No guardar contrasenas o claves de BD en Netlify.

## Escrituras / administracion

Para crear o modificar pilotos, temporadas, etc. la pagina pedira la clave ADMIN_API_KEY del backend al hacer una solicitud POST. Se guarda en sessionStorage del navegador durante la sesion. No se incluye en el bundle ni en Git. Configura ADMIN_API_KEY en Railway antes de utilizar las funciones administrativas.

## Prueba local

1. Inicia la API en http://localhost:1234 con MySQL disponible.
2. Configura BACKEND_URL=http://localhost:1234 y ejecuta npm run build.
3. Para probar **rutas limpias y proxy** usa Netlify Dev o un deploy de prueba, no un simple servidor estatico de dist/.

## Nota

La base MySQL original no esta en el repositorio. La API requiere importar el esquema y los datos. El uso del CDN de Tailwind se ha conservado para evitar redisenar paginas en esta separacion; conviene compilarlo en un trabajo posterior.
