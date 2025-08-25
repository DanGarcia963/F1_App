// middlewares/cache.js
// Middleware para agregar cabeceras de HTTP caching a las respuestas GET

export const cacheControl = (seconds = 60) => (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${seconds}`);
  }
  next();
};

// Ejemplo de uso en rutas:
// import { cacheControl } from './middlewares/cache.js';
// router.get('/ruta', cacheControl(120), controlador);
