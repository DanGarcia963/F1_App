import { Router } from 'express'
import { cacheControl } from '../middlewares/cache.js'
import { TeamController } from '../controllers/team.js'

export const TeamRouter = (Modelos) => {
  const TeamRouter = Router()
  const teamController = new TeamController(Modelos)

  TeamRouter.get('/',cacheControl(120), teamController.obtenerTodosLosEquipos)
  TeamRouter.get('/obtenerEquipo/:id', cacheControl(120),teamController.obtenerEquipoPorId)
    TeamRouter.get('/obtenerEquipoNombre/:nombre',cacheControl(120), teamController.obtenerEquipoPorNombre)
    TeamRouter.get('/obtenerVictoriasEquipo/:id', cacheControl(120),teamController.obtenerVictoriasEquipoPorID)
    TeamRouter.get('/obtenerInfoEquipo/:id', cacheControl(120),teamController.obtenerInfoEquipoPorId)
    TeamRouter.get('/obtenerDuplasEquipo/:id', cacheControl(120),teamController.obtenerDuplasPilotos)
    TeamRouter.post('/obtenerMonoplazaActual', teamController.obtenerMonoplazaActualEquipo)
    TeamRouter.post('/obtenerStatsDuplaEquipoYear', teamController.obtenerPilotoseEquipoTemporada)
  TeamRouter.post('/crearEquipo', teamController.registrarEquipo)
  TeamRouter.post('/cambiarNombre', teamController.cambiarNombre)
  TeamRouter.post('/cambiarMotor', teamController.cambiarMotor)
  
  return TeamRouter
}