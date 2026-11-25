import { Router } from 'express'
import { CategoriesController } from '../controllers/categories.js'
import { cacheControl } from '../middlewares/cache.js'

export const CategoriesRouter = (Modelos) => {
  const CategoriesRouter = Router()
  const categoriesController = new CategoriesController(Modelos)

  CategoriesRouter.get('/', cacheControl(120), categoriesController.obtenerTodosLasCategorias)
//  CategoriesRouter.get('/obtenerCircuito/:id', cacheControl(120), categoriesController.obtenerCircuitoPorId)
  CategoriesRouter.get('/:id/temporada-actual', cacheControl(30), categoriesController.obtenerTemporadaActual)
  CategoriesRouter.post('/cambiarNombre', categoriesController.cambiarNombre)
  return CategoriesRouter
}