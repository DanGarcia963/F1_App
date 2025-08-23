import { Router } from 'express'
import { TeamController } from '../controllers/team.js'

export const TeamRouter = (Modelos) => {
  const TeamRouter = Router()
  const teamController = new TeamController(Modelos)

  TeamRouter.get('/', teamController.obtenerTodosLosEquipos)
  TeamRouter.get('/obtenerEquipo/:id', teamController.obtenerEquipoPorId)
    TeamRouter.get('/obtenerEquipoNombre/:nombre', teamController.obtenerEquipoPorNombre)
    TeamRouter.get('/obtenerVictoriasEquipo/:id', teamController.obtenerVictoriasEquipoPorID)
    TeamRouter.get('/obtenerInfoEquipo/:id', teamController.obtenerInfoEquipoPorId)
    TeamRouter.get('/obtenerDuplasEquipo/:id', teamController.obtenerDuplasPilotos)
    TeamRouter.post('/obtenerMonoplazaActual', teamController.obtenerMonoplazaActualEquipo)
    TeamRouter.post('/obtenerStatsDuplaEquipoYear', teamController.obtenerPilotoseEquipoTemporada)
  TeamRouter.post('/crearEquipo', teamController.registrarEquipo)
  TeamRouter.post('/cambiarNombre', teamController.cambiarNombre)
  TeamRouter.post('/cambiarMotor', teamController.cambiarMotor)
  
  return TeamRouter
}