import { createHash, timingSafeEqual } from 'node:crypto';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

// El token solo se configura en Railway, nunca en el frontend.
export const requireAdminForWrites = (req, res, next) => {
  if (safeMethods.has(req.method)) return next();

  const configuredKey = process.env.ADMIN_API_KEY || '';
  if (!configuredKey) {
    // Evita que nuevas instalaciones publicas expongan modificaciones sin autenticar.
    return res.status(503).json({ message: 'Administracion deshabilitada: falta ADMIN_API_KEY en el servidor' });
  }

  const providedKey = req.get('X-Admin-Key') || '';
  const expected = createHash('sha256').update(configuredKey).digest();
  const received = createHash('sha256').update(providedKey).digest();

  if (!providedKey || !timingSafeEqual(expected, received)) {
    return res.status(401).json({ message: 'Clave administrativa incorrecta' });
  }

  return next();
};
