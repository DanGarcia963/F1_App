import { Router } from 'express'
import { PilotoController } from '../controllers/pilot.js'

export const PilotoRouter = (Modelos) => {
  const PilotoRouter = Router()
  const pilotoController = new PilotoController(Modelos)

  PilotoRouter.get('/', pilotoController.obtenerTodosLosPilotos)
  PilotoRouter.get('/obtenerPiloto/:id', pilotoController.obtenerPilotoPorId)
  PilotoRouter.post('/cambiarNumero', pilotoController.cambiarNumero)
  PilotoRouter.post('/crearPiloto', pilotoController.registrarPiloto)
  
  return PilotoRouter
}