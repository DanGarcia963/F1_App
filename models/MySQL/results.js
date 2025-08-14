 import { connectionMySQL } from '../../helpers/connectionMySQL.js'
 
 export class ResultsModel {
      static async obtenerResultadoPorGPPorId (idGP) {
        const [GPsTemporada] = await connectionMySQL.query(`
        SELECT 
        CONCAT(p.Nombre, ' ', p.Apellido) AS nombre_piloto,
        rgp.posicion_final,
        rgp.posicion_inicio AS posicion_clasificacion,
        rgp.puntos_obtenidos,
        rgp.vueltas_completadas
        FROM resultados rgp
        JOIN piloto p 
        ON p.id_Piloto = rgp.piloto_id
        JOIN grandes_premios gp
        ON gp.id_GP = rgp.grand_prix_id
        WHERE rgp.grand_prix_id = ?
        AND gp.Estado_GP = 'V'
        ORDER BY rgp.posicion_final ASC;`, [idGP])
        if (GPsTemporada.length === 0) return false 
        return GPsTemporada
    }

    static async registrarResultado({ entrada }) {
  const {
    piloto_id: idPiloto, grand_prix_id: idGP, posicion_final:finalPosicion, posicion_inicio:inicioPosicion, vueltas_completadas:vueltasCompletadas, puntos_obtenidos:puntosObtenidos
  } = entrada;

  try {
    await connectionMySQL.query(
      `INSERT INTO resultados
      (piloto_id, grand_prix_id, posicion_final, posicion_inicio, vueltas_completadas, puntos_obtenidos)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [idPiloto, idGP, finalPosicion, inicioPosicion, vueltasCompletadas, puntosObtenidos]
    );

    // Si quieres devolver el GP recién insertado
    const [nuevoRGP] = await connectionMySQL.query(
      'SELECT * FROM resultados WHERE piloto_id = ? AND grand_prix_id = ?',
      [idPiloto, idGP]
    );
    await connectionMySQL.query(`update grandes_premios set Estado_GP = 'V' WHERE id_GP = ?`,[idGP]);
    return nuevoRGP[0];

  } catch (error) {
    throw new Error(error);
  }
}
 }