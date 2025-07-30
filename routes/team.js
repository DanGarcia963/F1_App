import { Router } from 'express'
import { TeamController } from '../controllers/team.js'

export const TeamRouter = (Modelos) => {
  const TeamRouter = Router()
  const teamController = new TeamController(Modelos)

  TeamRouter.get('/', teamController.obtenerTodosLosEquipos)
  TeamRouter.post('/obtenerEquipo', teamController.obtenerEquipoPorId)
  TeamRouter.post('/crearEquipo', teamController.registrarEquipo)
  TeamRouter.post('/cambiarNombre', teamController.cambiarNombre)
  TeamRouter.post('/cambiarMotor', teamController.cambiarMotor)
  
  return TeamRouter
}