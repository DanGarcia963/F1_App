import { Router } from 'express'
import { CircuitController } from '../controllers/circuit.js'

export const CircuitRouter = (Modelos) => {
  const CircuitRouter = Router()
  const circuitController = new CircuitController(Modelos)

  CircuitRouter.get('/', circuitController.obtenerTodosLosCircuitos)
  CircuitRouter.get('/obtenerCircuito/:id', circuitController.obtenerCircuitoPorId)
    CircuitRouter.get('/obtenerCircuitoNombre/:id', circuitController.obtenerCircuitoPorNombre)
  CircuitRouter.post('/crearCircuito', circuitController.registrarCircuito)
  CircuitRouter.post('/cambiarNombre', circuitController.cambiarNombre)
  CircuitRouter.post('/cambiarCiudad', circuitController.cambiarCiudad)
  CircuitRouter.post('/cambiarCurvas', circuitController.cambiarCurvas)
  CircuitRouter.post('/cambiarLongitud', circuitController.cambiarLongitud)
  
  return CircuitRouter
}