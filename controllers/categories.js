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

}