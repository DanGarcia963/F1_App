
import { Router } from 'express'
import { CircuitController } from '../controllers/circuit.js'
import { cacheControl } from '../middlewares/cache.js'

export const CircuitRouter = (Modelos) => {
  const CircuitRouter = Router()
  const circuitController = new CircuitController(Modelos)

  CircuitRouter.get('/', cacheControl(120), circuitController.obtenerTodosLosCircuitos)
  CircuitRouter.get('/obtenerCircuito/:id', cacheControl(120), circuitController.obtenerCircuitoPorId)
  CircuitRouter.get('/obtenerCircuitoNombre/:id', cacheControl(120), circuitController.obtenerCircuitoPorNombre)
  CircuitRouter.post('/crearCircuito', circuitController.registrarCircuito)
  CircuitRouter.post('/cambiarNombre', circuitController.cambiarNombre)
  CircuitRouter.post('/cambiarCiudad', circuitController.cambiarCiudad)
  CircuitRouter.post('/cambiarCurvas', circuitController.cambiarCurvas)
  CircuitRouter.post('/cambiarLongitud', circuitController.cambiarLongitud)
  
  return CircuitRouter
}