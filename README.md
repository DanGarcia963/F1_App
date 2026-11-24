# F1_App - backend Railway

Rama de despliegue: **backend-deploy**. Contiene Express, API REST, rutas, controladores y modelos MySQL. No incluye paginas HTML ni archivos de imagen.

## Desplegar en Railway

1. Crea un proyecto Railway desde el repositorio DanGarcia963/F1_App, con rama **backend-deploy**.
2. Define Root Directory como raiz (sin subdirectorio), Build Command como npm ci y Start Command como npm start.
3. Crea un servicio MySQL en ese mismo proyecto (o usa otra instancia MySQL remota).
4. En las variables del servicio Express, crea DATABASE_URL con una referencia Railway al MYSQL_URL de MySQL (por ejemplo: ${{MySQL.MYSQL_URL}}).
5. Configura ADMIN_API_KEY como secreto largo y aleatorio; sin esa variable todas las escrituras POST/PUT/PATCH/DELETE quedan deshabilitadas.
6. Genera el dominio HTTPS publico en Networking. Utiliza ese origen, sin /api, como BACKEND_URL en Netlify.

El backend utiliza el puerto PORT provisto por Railway.

## Health checks

- GET /api/health/live: indica que Express responde, aunque MySQL este desconectado. Railway usa este endpoint para el health check.
- GET /api/health: consulta realmente la base de datos, devuelve 503 si no puede conectar.
- GET /api/categoria/: datos de categorias; una base vacia devolvera [].

## Base de datos

La base MySQL historica NO estaba en GitHub. Debes importar el esquema reconstruido y la informacion real/semillas en el servicio MySQL. No usar PostgreSQL sin adaptar los modelos.

## Seguridad de escritura

Las paginas de Netlify envian X-Admin-Key para solicitudes que modifican informacion. Esta clave no se publica en el frontend: el navegador se la pide al administrador y la mantiene temporalmente en sessionStorage. Es un control administrativo sencillo, no reemplaza un login multiusuario con roles.

CORS_ORIGIN admite uno o varios origenes separados por comas, por ejemplo: https://tu-app.netlify.app,http://localhost:8888. Para navegar usando el proxy /api/* de Netlify no es necesario CORS.

## Notas heredadas

- Las pantallas y SQL actuales pueden necesitar datos iniciales para no mostrar vistas vacias.
- Algunas rutas antiguas de resultados invocan metodos no implementados en los modelos originales. Se mantienen por compatibilidad y requieren una correccion funcional separada.
- El package.json y el lockfile mantienen las dependencias originales para que npm ci siga siendo reproducible; los metadatos heredados pueden limpiarse en una actualizacion posterior.
