import { Router } from 'express'
import { GPController } from '../controllers/grandPrix.js'

export const GPRouter = (Modelos) => {
  const GPRouter = Router()
  const gpController = new GPController(Modelos)

  GPRouter.get('/', gpController.obtenerTodosLosGP)
  GPRouter.get('/obtenerGP/:id', gpController.obtenerGPPorId)
  GPRouter.get('/obtenerGPTemporada/:Anio', gpController.obtenerGPTemporadaPorId)
  GPRouter.get('/obtenerWDCPorAnio/:Anio', gpController.obtenerCampeonatoPilotosPorAnio)
  GPRouter.get('/obtenerWCCPorAnio/:Anio', gpController.obtenerCampeonatoConstructoresPorAnio)
  GPRouter.post('/registrarGP', gpController.registrarGP)
  /*GPRouter.post('/cambiarNombre', gpController.cambiarNombre)
  GPRouter.post('/cambiarFecha', gpController.cambiarFecha)
  GPRouter.post('/cambiarVueltas', gpController.cambiarVueltas)
  GPRouter.post('/cambiarCircuito', gpController.cambiarCircuito)
  GPRouter.post('/cambiarTemporada', gpController.cambiarTemporada)
  GPRouter.post('/registroVueltaRapida', gpController.registroVueltaRapida)
  GPRouter.post('/registroPolePosition', gpController.registroPolePosition)
  */
  return GPRouter
}