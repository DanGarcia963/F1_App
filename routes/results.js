import { Router } from 'express'
import { ResultsController } from '../controllers/results.js'
import { cacheControl } from '../middlewares/cache.js'

export const ResultsRouter = (Modelos) => {
  const ResultsRouter = Router()
  const resultsController = new ResultsController(Modelos)

  ResultsRouter.get('/', cacheControl(120),resultsController.obtenerTodosLosResultadosOrdenadosPorGP)
  ResultsRouter.get('/obtenerResultadoGP/:id',cacheControl(120), resultsController.obtenerResultadoPorGPPorId)
  ResultsRouter.post('/crearResultado', resultsController.registrarResultado)
  ResultsRouter.post('/cambiarPiloto', resultsController.cambiarPiloto)
  ResultsRouter.post('/cambiarPosicionInicial', resultsController.cambiarPosicionInicial)
  ResultsRouter.post('/cambiarPosicionFinal', resultsController.cambiarPosicionFinal)
  ResultsRouter.post('/cambiarVueltasCompletadas', resultsController.cambiarVueltasCompletadas)
  ResultsRouter.post('/cambiarParadasPits', resultsController.cambiarParadasPits)
  ResultsRouter.post('/cambiarPuntosObtenidos', resultsController.cambiarPuntosObtenidos)
  
  return ResultsRouter
}