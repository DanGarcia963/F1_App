import { Router } from 'express'
import { TeamSeasonController } from '../controllers/teamSeason.js'
import { cacheControl } from '../middlewares/cache.js'

export const TeamSeasonRouter = (Modelos) => {
  const TeamSeasonRouter = Router()
  const teamSeasonController = new TeamSeasonController(Modelos)

  TeamSeasonRouter.get('/',cacheControl(120), teamSeasonController.obtenerTodosLosEquiposPorTemporadas)
  TeamSeasonRouter.get('/obtenerEquiposPorTemporada/:id',cacheControl(120), teamSeasonController.obtenerEquiposPorTemporadaPorId)
    TeamSeasonRouter.get('/obtenerEquiposPorIDYPorTemporada', cacheControl(120),teamSeasonController.obtenerEquiposPorIDYPorTemporadaPorId)
  TeamSeasonRouter.post('/crearEquipoTemporada', teamSeasonController.crearEquipoTemporada)
  TeamSeasonRouter.post('/editarTemporada', teamSeasonController.editarTemporada)
  TeamSeasonRouter.post('/editarEquipo', teamSeasonController.editarEquipo)
  
  return TeamSeasonRouter
}