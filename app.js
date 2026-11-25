import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import { connectionPostgres } from './helpers/connectionPostgres.js';
import { requireAdminForWrites } from './middlewares/adminWrites.js';

import { PilotoRouter } from './routes/pilot.js';
import { SeasonRouter } from './routes/season.js';
import { TeamRouter } from './routes/team.js';
import { CircuitRouter } from './routes/circuit.js';
import { TeamSeasonRouter } from './routes/teamSeason.js';
import { GPRouter } from './routes/grandPrix.js';
import { PilotSeasonRouter } from './routes/pilotSeason.js';
import { ResultsRouter } from './routes/results.js';
import { CategoriesRouter } from './routes/categories.js';

export const crearApp = Modelos => {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',').map(value => value.trim()).filter(Boolean);

  // Metadatos publicos para confirmar que codigo esta atendiendo las peticiones.
  const apiRevision = 'f1-routes-2026-11-25-v3';
  const commit = (process.env.RAILWAY_GIT_COMMIT_SHA || '').slice(0,12) || 'desconocido';
  const branch = process.env.RAILWAY_GIT_BRANCH || 'desconocida';
  app.use('/api',(_req,res,next)=>{res.set('X-F1-App-Revision',apiRevision);next();});
  app.get('/api/meta',(_req,res)=>{
    res.set('Cache-Control','no-store');
    res.json({service:'f1-app-api',apiRevision,commit,branch,
      endpoints:{currentSeason:'/api/categoria/1/temporada-actual',
      categories:'/api/categoria/',seasons:'/api/temporada/',
      calendar:'/api/granPremio/obtenerGPTemporada/1/2026',
      drivers:'/api/granPremio/obtenerWDCPorAnio/1/2026',
      constructors:'/api/granPremio/obtenerWCCPorAnio/1/2026',
      winnerHistory:'/api/granPremio/obtenerLastWinnersPorGp/:id',
      raceResults:'/api/resultados/obtenerResultadoGP/:id'}});
  });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    }
  }));

  app.get('/api/health/live', (_req, res) => {
    res.json({ status: 'ok', service: 'f1-app-api' });
  });

  app.get('/api/health', async (_req, res) => {
    try {
      await connectionPostgres.query('SELECT 1 AS ok');
      res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      console.error('[F1_App] PostgreSQL health check:', error.message);
      res.status(503).json({ status: 'degraded', database: 'unavailable' });
    }
  });

  // Diagnostico seguro: no expone URLs, passwords, claves ni informacion personal.
  app.get('/api/health/data', async (_req, res) => {
    try {
      const [categories] = await connectionPostgres.query('SELECT COUNT(*)::integer AS total FROM categoria');
      const [pilots] = await connectionPostgres.query('SELECT COUNT(*)::integer AS total FROM piloto');
      const [teams] = await connectionPostgres.query('SELECT COUNT(*)::integer AS total FROM equipo');
      const [races] = await connectionPostgres.query('SELECT COUNT(*)::integer AS total FROM grandes_premios');
      const [results] = await connectionPostgres.query('SELECT COUNT(*)::integer AS total FROM resultados');
      const [seasons] = await connectionPostgres.query('SELECT MIN(anio) AS primera, MAX(anio) AS ultima FROM temporada');
      res.json({service:'f1-app-api',database:'connected',
        categorias:categories[0].total,pilotos:pilots[0].total,equipos:teams[0].total,
        grandes_premios:races[0].total,resultados:results[0].total,temporadas:seasons[0]});
    } catch (error) {
      console.error('[F1_App] Diagnostico de datos:', error.message);
      res.status(503).json({service:'f1-app-api',database:'unavailable',
        error:'No se pueden consultar las tablas de F1_App. Revisa los logs de Railway.'});
    }
  });

  // Express 4 no captura automaticamente promesas rechazadas por manejadores
  // async. Un fallo de PostgreSQL no debe terminar el proceso de Node.
  const handleAsyncErrors = router => {
    for (const layer of router.stack || []) {
      if (!layer.route) continue;
      for (const handler of layer.route.stack || []) {
        const original = handler.handle;
        handler.handle = (req, res, next) => {
          try {
            const result = original(req, res, next);
            if (result && typeof result.then === 'function') {
              result.catch(next);
            }
          } catch (error) {
            next(error);
          }
        };
      }
    }
    return router;
  };

  // Solo los metodos que modifican datos requieren la clave privada.
  app.use('/api', requireAdminForWrites);

  app.use('/api/piloto', handleAsyncErrors(PilotoRouter(Modelos)));
  app.use('/api/temporada', handleAsyncErrors(SeasonRouter(Modelos)));
  app.use('/api/equipo', handleAsyncErrors(TeamRouter(Modelos)));
  app.use('/api/circuito', handleAsyncErrors(CircuitRouter(Modelos)));
  app.use('/api/equipoTemporada', handleAsyncErrors(TeamSeasonRouter(Modelos)));
  app.use('/api/granPremio', handleAsyncErrors(GPRouter(Modelos)));
  app.use('/api/pilotoTemporada', handleAsyncErrors(PilotSeasonRouter(Modelos)));
  app.use('/api/resultados', handleAsyncErrors(ResultsRouter(Modelos)));
  app.use('/api/categoria', handleAsyncErrors(CategoriesRouter(Modelos)));

  app.use((req,res)=>{
    if(req.path.startsWith('/api/')) console.warn('[F1_App] 404',req.method,req.path,'branch',branch,'commit',commit);
    res.status(404).json({message:'Ruta no encontrada',
      method:req.method,path:req.path,apiRevision,
      suggestion:'Consulta /api/meta y comprueba que Railway usa el commit correcto.'});
  });
  app.use((error, _req, res, _next) => {
    console.error('[F1_App] Error en API:', error?.code || 'ERROR', error?.message || '');
    const isDatabaseError = new Set([
      'SELF_SIGNED_CERT_IN_CHAIN', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      'CERT_HAS_EXPIRED', 'ERR_TLS_CERT_ALTNAME_INVALID',
      'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND',
      '28P01', '3D000', '42P01'
    ]).has(error?.code);
    res.status(isDatabaseError ? 503 : 500).json({
      message: isDatabaseError ? 'No se pudo consultar PostgreSQL' : 'Error interno del servidor'
    });
  });

  const port = Number(process.env.PORT || 1234);
  app.listen(port, '0.0.0.0', () => {
    console.log('[F1_App] API escuchando en el puerto ' + port);
  });

  return app;
};
