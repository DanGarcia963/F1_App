import { Router } from 'express'
import { GPController } from '../controllers/grandPrix.js'
import { cacheControl } from '../middlewares/cache.js'

export const GPRouter = (Modelos) => {
  const GPRouter = Router()
  const gpController = new GPController(Modelos)

  GPRouter.get('/', cacheControl(120), gpController.obtenerTodosLosGP)
  GPRouter.get('/obtenerGP/:id', cacheControl(120), gpController.obtenerGPPorId)
  GPRouter.get('/obtenerGPTemporada/:Anio',cacheControl(120), gpController.obtenerGPTemporadaPorId)
  GPRouter.get('/obtenerWDCPorAnio/:Anio', cacheControl(120),gpController.obtenerCampeonatoPilotosPorAnio)
  GPRouter.get('/obtenerWCCPorAnio/:Anio', cacheControl(120), gpController.obtenerCampeonatoConstructoresPorAnio)
  GPRouter.get('/obtenerLastWinners/:nombreOficial', cacheControl(120), gpController.obtenerLastWinnerGP)
  GPRouter.post('/registrarGP', gpController.registrarGP)
  GPRouter.post('/editarGP', gpController.editarGP)
  /*GPRouter.post('/cambiarFecha', gpController.cambiarFecha)
  GPRouter.post('/cambiarVueltas', gpController.cambiarVueltas)
  GPRouter.post('/cambiarCircuito', gpController.cambiarCircuito)
  GPRouter.post('/cambiarTemporada', gpController.cambiarTemporada)
  GPRouter.post('/registroVueltaRapida', gpController.registroVueltaRapida)
  GPRouter.post('/registroPolePosition', gpController.registroPolePosition)
  */
  return GPRouter
}