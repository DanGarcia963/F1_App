import { Router } from 'express'
import { SeasonController } from '../controllers/season.js'

export const SeasonRouter = (Modelos) => {
  const SeasonRouter = Router()
  const seasonController = new SeasonController(Modelos)

  SeasonRouter.get('/', seasonController.obtenerTodasLasTemporadas)
  SeasonRouter.post('/obtenerTemporada', seasonController.obtenerTemporadaPorId)
  SeasonRouter.post('/crearTemporada', seasonController.registrarTemporada)
  SeasonRouter.post('/cambiarAnio', seasonController.cambiarAnio)
  
  return SeasonRouter
}