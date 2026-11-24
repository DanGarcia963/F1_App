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

  // Solo los metodos que modifican datos requieren la clave privada.
  app.use('/api', requireAdminForWrites);

  app.use('/api/piloto', PilotoRouter(Modelos));
  app.use('/api/temporada', SeasonRouter(Modelos));
  app.use('/api/equipo', TeamRouter(Modelos));
  app.use('/api/circuito', CircuitRouter(Modelos));
  app.use('/api/equipoTemporada', TeamSeasonRouter(Modelos));
  app.use('/api/granPremio', GPRouter(Modelos));
  app.use('/api/pilotoTemporada', PilotSeasonRouter(Modelos));
  app.use('/api/resultados', ResultsRouter(Modelos));
  app.use('/api/categoria', CategoriesRouter(Modelos));

  app.use((_req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
  app.use((error, _req, res, _next) => {
    console.error('[F1_App] Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  });

  const port = Number(process.env.PORT || 1234);
  app.listen(port, '0.0.0.0', () => {
    console.log('[F1_App] API escuchando en el puerto ' + port);
  });

  return app;
};
