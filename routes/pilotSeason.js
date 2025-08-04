import { Router } from 'express'
import { PilotSeasonController } from '../controllers/pilotSeason.js'

export const PilotSeasonRouter = (Modelos) => {
  const PilotSeasonRouter = Router()
  const pilotSeasonController = new PilotSeasonController(Modelos)

  PilotSeasonRouter.get('/', pilotSeasonController.obtenerTodosLosPilotosPorTemporadas)
  PilotSeasonRouter.get('/obtenerPilotosPorTemporada/:id', pilotSeasonController.obtenerPilotosPorTemporadaPorId)
  PilotSeasonRouter.get('/obtenerPilotosPorTemporadaYEquipo', pilotSeasonController.obtenerPilotosPorTemporadaYEquipoPorId)
  PilotSeasonRouter.get('/duplaPilotos', pilotSeasonController.obtenerDuplaPilotos)
  PilotSeasonRouter.post('/crearPilotoTemporada', pilotSeasonController.crearPilotoTemporada)
  PilotSeasonRouter.post('/editarPiloto', pilotSeasonController.editarPiloto)

  return PilotSeasonRouter
}