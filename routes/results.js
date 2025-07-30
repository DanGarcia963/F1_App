import { Router } from 'express'
import { ResultsController } from '../controllers/results.js'

export const ResultsRouter = (Modelos) => {
  const ResultsRouter = Router()
  const resultsController = new ResultsController(Modelos)

  ResultsRouter.get('/', resultsController.obtenerTodosLosResultadosOrdenadosPorGP)
  ResultsRouter.get('/obtenerResultadoGP/:id', resultsController.obtenerResultadoPorGPPorId)
  ResultsRouter.post('/crearResultado', resultsController.registrarResultado)
  ResultsRouter.post('/cambiarPiloto', resultsController.cambiarPiloto)
  ResultsRouter.post('/cambiarPosicionInicial', resultsController.cambiarPosicionInicial)
  ResultsRouter.post('/cambiarPosicionFinal', resultsController.cambiarPosicionFinal)
  ResultsRouter.post('/cambiarVueltasCompletadas', resultsController.cambiarVueltasCompletadas)
  ResultsRouter.post('/cambiarParadasPits', resultsController.cambiarParadasPits)
  ResultsRouter.post('/cambiarPuntosObtenidos', resultsController.cambiarPuntosObtenidos)
  
  return ResultsRouter
}