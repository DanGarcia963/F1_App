import { Router } from 'express'
import { cacheControl } from '../middlewares/cache.js'
import { PilotoController } from '../controllers/pilot.js'

export const PilotoRouter = (Modelos) => {
  const PilotoRouter = Router()
  const pilotoController = new PilotoController(Modelos)

  PilotoRouter.get('/', cacheControl(120), pilotoController.obtenerTodosLosPilotos)
  PilotoRouter.get('/obtenerPiloto/:id', cacheControl(120),cacheControl(120), pilotoController.obtenerPilotoPorId)
  PilotoRouter.get('/obtenerInfoPiloto/:id', cacheControl(120),pilotoController.obtenerInfoPilotoPorId)
  PilotoRouter.get('/obtenerVictoriasPiloto/:id', cacheControl(120),pilotoController.obtenerVictoriasPilotoPorID)
  PilotoRouter.get('/obtenerPodiosPiloto/:id',cacheControl(120), pilotoController.obtenerPodiosPilotoPorID)
  PilotoRouter.get('/obtenerTrayectoriaPiloto/:id', cacheControl(120),pilotoController.obtenerTrayectoriaPilotoPorID)
  PilotoRouter.post('/cambiarNumero', pilotoController.cambiarNumero)
  PilotoRouter.post('/crearPiloto', pilotoController.registrarPiloto)
  
  return PilotoRouter
}