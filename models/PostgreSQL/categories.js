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

    static async obtenerTemporadaActual(idCategoria) {
      const [rows] = await connectionPostgres.query(`
        SELECT t.id_temporada AS "id_Temporada", t.anio, t.finalizada,
               COUNT(DISTINCT gp.id_gp)::integer AS grandes_premios
        FROM temporada t
        JOIN grandes_premios gp ON gp.temporada_id = t.id_temporada
        WHERE gp.id_categoria = ?
          AND t.anio <= EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY t.id_temporada, t.anio, t.finalizada
        ORDER BY t.anio DESC
        LIMIT 1`, [idCategoria]);
      return rows[0] || null;
    }

}