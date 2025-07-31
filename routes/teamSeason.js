import { Router } from 'express'
import { TeamSeasonController } from '../controllers/teamSeason.js'

export const TeamSeasonRouter = (Modelos) => {
  const TeamSeasonRouter = Router()
  const teamSeasonController = new TeamSeasonController(Modelos)

  TeamSeasonRouter.get('/', teamSeasonController.obtenerTodosLosEquiposPorTemporadas)
  TeamSeasonRouter.get('/obtenerEquiposPorTemporada/:id', teamSeasonController.obtenerEquiposPorTemporadaPorId)
    TeamSeasonRouter.get('/obtenerEquiposPorIDYPorTemporada', teamSeasonController.obtenerEquiposPorIDYPorTemporadaPorId)
  TeamSeasonRouter.post('/crearEquipoTemporada', teamSeasonController.crearEquipoTemporada)
  TeamSeasonRouter.post('/editarTemporada', teamSeasonController.editarTemporada)
  TeamSeasonRouter.post('/editarEquipo', teamSeasonController.editarEquipo)
  
  return TeamSeasonRouter
}