import { Router } from 'express'
import { PilotSeasonController } from '../controllers/pilotSeason.js'
import { cacheControl } from '../middlewares/cache.js'

export const PilotSeasonRouter = (Modelos) => {
  const PilotSeasonRouter = Router()
  const pilotSeasonController = new PilotSeasonController(Modelos)

  PilotSeasonRouter.get('/',cacheControl(120), pilotSeasonController.obtenerTodosLosPilotosPorTemporadas)
  PilotSeasonRouter.get('/obtenerPilotosPorTemporada/:categoria/:id',cacheControl(120), pilotSeasonController.obtenerPilotosPorTemporadaPorId)
  PilotSeasonRouter.get('/obtenerPilotosPorTemporadaYEquipo', cacheControl(120),pilotSeasonController.obtenerPilotosPorTemporadaYEquipoPorId)
  PilotSeasonRouter.get('/duplaPilotos/:idTemporada/:idEquipo', cacheControl(120), pilotSeasonController.obtenerDuplaPilotos)
  PilotSeasonRouter.post('/duplaPilotos',cacheControl(120), pilotSeasonController.obtenerDuplaPilotos)
  PilotSeasonRouter.post('/crearPilotoTemporada', pilotSeasonController.crearPilotoTemporada)
  PilotSeasonRouter.post('/editarPiloto', pilotSeasonController.editarPiloto)

  return PilotSeasonRouter
}