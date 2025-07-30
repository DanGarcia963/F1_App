import { Router } from 'express'
import { TeamSeasonController } from '../controllers/teamSeason.js'

export const TeamSeasonRouter = (Modelos) => {
  const TeamSeasonRouter = Router()
  const teamSeasonController = new TeamSeasonController(Modelos)

  TeamSeasonRouter.get('/', teamSeasonController.obtenerTodosLosEquiposPorTemporadas)
  TeamSeasonRouter.get('/obtenerEquiposPorTemporada', teamSeasonController.obtenerEquiposPorTemporadaPorId)
  TeamSeasonRouter.post('/crearEquipoTemporada', teamSeasonController.crearEquipoTemporada)
  TeamSeasonRouter.post('/editarTemporada', teamSeasonController.editarTemporada)
  TeamSeasonRouter.post('/editarEquipo', teamSeasonController.editarEquipo)
  
  return TeamSeasonRouter
}