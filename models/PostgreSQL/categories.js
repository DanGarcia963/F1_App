import { connectionPostgres } from '../../helpers/connectionPostgres.js'

export class CategoriesModel {
    static async obtenerTodosLasCategorias () {
      const [categorias] = await connectionPostgres.query('SELECT * FROM categoria;')
  
      return categorias
    }

    static async cambiarNombre({ entrada }) {
        const {
          id_Categoria: idCategoria, nombre
        } = entrada
    
        try {
            await connectionPostgres.query(
                'UPDATE categoria SET nombre = ? WHERE id_Categoria = ?',
                [nombre, idCategoria]
            );
        } catch (error) {
          return error
        }
    }

}