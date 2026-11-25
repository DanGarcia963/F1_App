import { connectionPostgres } from '../../helpers/connectionPostgres.js';

export class ResultsModel {
  static async obtenerTodosLosResultadosOrdenadosPorGP() {
    const [rows] = await connectionPostgres.query(`
      SELECT r.*, gp.nombre_oficial, gp.fecha, p.nombre, p.apellido
      FROM resultados r
      JOIN grandes_premios gp ON gp.id_gp = r.grand_prix_id
      JOIN piloto p ON p.id_piloto = r.piloto_id
      ORDER BY gp.fecha DESC,r.posicion_final ASC NULLS LAST
      LIMIT 2000`);
    return rows;
  }

  static async obtenerResultadoPorGPPorId(idGP) {
    const [rows] = await connectionPostgres.query(`
      SELECT p.id_piloto AS "id_Piloto", CONCAT(p.nombre, ' ',p.apellido) AS "nombre_piloto",
         p.codigo_fia, e.nombre AS equipo, r.posicion_final,r.posicion_inicio,
         r.puntos_obtenidos,r.vueltas_completadas,gp.tipo_carrera,
         gp.fecha, EXTRACT(YEAR FROM gp.fecha)::integer AS anio, r.estado_resultado
      FROM resultados r
      JOIN piloto p ON p.id_piloto = r.piloto_id
      JOIN grandes_premios gp ON gp.id_gp = r.grand_prix_id
      LEFT JOIN pilotos_temporada pt ON pt.piloto_id = r.piloto_id
         AND pt.temporada_id = gp.temporada_id
      LEFT JOIN equipo e ON e.id_equipo = COALESCE(r.equipo_id, pt.equipo_id)
      WHERE gp.id_gp = ? AND gp.estado_gp = 'V'
      ORDER BY r.posicion_final ASC NULLS LAST, r.id_resultado ASC`, [idGP]);
    return rows.length ? rows : false;
  }

  static async registrarResultado({entrada}) {
    const {piloto_id,grand_prix_id,posicion_final,posicion_inicio,
           vueltas_completadas,puntos_obtenidos}=entrada;
    const [gp] = await connectionPostgres.query(
       'SELECT temporada_id FROM grandes_premios WHERE id_gp = ?', [grand_prix_id]);
    if (!gp.length) throw new Error('Gran Premio no encontrado');
    const [pt] = await connectionPostgres.query(
       'SELECT equipo_id FROM pilotos_temporada WHERE piloto_id = ? AND temporada_id = ?',
       [piloto_id,gp[0].temporada_id]);
    const [r] = await connectionPostgres.query(`
      INSERT INTO resultados
       (piloto_id,grand_prix_id,equipo_id,posicion_final,posicion_inicio,vueltas_completadas,puntos_obtenidos)
      VALUES (?,?,?,?,?,?,?)
      ON CONFLICT (grand_prix_id,piloto_id) DO UPDATE SET
        equipo_id=EXCLUDED.equipo_id,posicion_final=EXCLUDED.posicion_final,
        posicion_inicio=EXCLUDED.posicion_inicio,
        vueltas_completadas=EXCLUDED.vueltas_completadas,puntos_obtenidos=EXCLUDED.puntos_obtenidos
      RETURNING *`, [piloto_id,grand_prix_id,pt[0]?.equipo_id||null,
        posicion_final,posicion_inicio,vueltas_completadas,puntos_obtenidos]);
    await connectionPostgres.query("UPDATE grandes_premios SET estado_gp = 'V' WHERE id_gp = ?",[grand_prix_id]);
    return r.rows?.[0] || r;
  }
}