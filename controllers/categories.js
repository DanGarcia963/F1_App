 export class CategoriesController {
    constructor (Modelos) {
        this.categoriesModel = Modelos.CategoriesModel
    }
 
    obtenerTodosLasCategorias = async (req, res) => {
        const circuitos = await this.categoriesModel.obtenerTodosLasCategorias()
        res.json(circuitos)
    }

    cambiarNombre = async (req, res) => {
        const resultado = await this.categoriesModel.cambiarNombre({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    obtenerTemporadaActual = async (req, res) => {
      const categoria = Number(req.params.id);
      if (!Number.isInteger(categoria) || categoria < 1) {
        return res.status(400).json({ message: 'Categoría inválida' });
      }
      const temporada = await this.categoriesModel.obtenerTemporadaActual(categoria);
      if (!temporada) return res.status(404).json({message:'No hay temporadas registradas para esta categoría'});
      res.json({ ...temporada, id_Categoria: categoria });
    }
}
