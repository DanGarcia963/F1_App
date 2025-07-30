import { Router } from 'express'
import { PilotSeasonController } from '../controllers/pilotSeason.js'

export const PilotSeasonRouter = (Modelos) => {
  const PilotSeasonRouter = Router()
  const pilotSeasonController = new PilotSeasonController(Modelos)

  PilotSeasonRouter.get('/', pilotSeasonController.obtenerTodosLosPilotosPorTemporadas)
  PilotSeasonRouter.get('/obtenerPilotosPorTemporada/:id', pilotSeasonController.obtenerPilotosPorTemporadaPorId)
  PilotSeasonRouter.post('/crearPilotoTemporada', pilotSeasonController.crearPilotoTemporada)
  PilotSeasonRouter.post('/editarTemporada', pilotSeasonController.editarTemporada)
  PilotSeasonRouter.post('/editarPiloto', pilotSeasonController.editarPiloto)
  PilotSeasonRouter.post('/editarEquipo', pilotSeasonController.editarEquipo)
  PilotSeasonRouter.post('/cambiarNumero', pilotSeasonController.cambiarNumero)

  return PilotSeasonRouter
}