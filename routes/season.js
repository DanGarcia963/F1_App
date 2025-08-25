import { Router } from 'express'
import { SeasonController } from '../controllers/season.js'
import { cacheControl } from '../middlewares/cache.js'

export const SeasonRouter = (Modelos) => {
  const SeasonRouter = Router()
  const seasonController = new SeasonController(Modelos)

  SeasonRouter.get('/',cacheControl(120), seasonController.obtenerTodasLasTemporadas)
  SeasonRouter.get('/obtenerTemporada/:id', cacheControl(120),seasonController.obtenerTemporadaPorId)
  SeasonRouter.get('/obtenerTemporadaAnio/:anio',cacheControl(120), seasonController.obtenerTemporadaPorAnio)
  SeasonRouter.post('/crearTemporada', seasonController.registrarTemporada)
  SeasonRouter.post('/cambiarAnio', seasonController.cambiarAnio)
  
  return SeasonRouter
}