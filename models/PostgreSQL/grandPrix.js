 import { connectionPostgres } from '../../helpers/connectionPostgres.js'
 
 export class GPModel {
    static async obtenerTodosLosGP () {
    const [GPs] = await connectionPostgres.query(`SELECT 
        nombre_oficial
        FROM grandes_premios t
        WHERE id_GP = (
            SELECT MIN(id_GP)
            FROM grandes_premios 
            WHERE nombre_oficial = t.nombre_oficial 
        )ORDER BY id_GP ASC;
        `)
        return GPs
     }
 
    static async obtenerGPTemporadaPorId (Categoria, Anio) {
        const [GPsTemporada] = await connectionPostgres.query(`
        SELECT 
            gp.id_GP,
            gp.nombre_oficial AS "Nombre_GP",
            c.nombre AS "Nombre_Circuito",
            c.pais AS "Pais",
            gp.fecha,gp.tipo_carrera,
            COALESCE(g.codigo_fia, 'Aún no se disputa') AS "Ganador",
            COALESCE(pp.codigo_fia, 'NO TIME') AS "Pole_Position",
            COALESCE(vr.codigo_fia, 'NO TIME') AS "Vuelta_Rapida"
        FROM grandes_premios gp
        LEFT JOIN piloto pp
            ON pp.id_Piloto = gp.pole_position_piloto_id
        LEFT JOIN piloto vr
            ON vr.id_Piloto = gp.vuelta_rapida_piloto_id
        LEFT JOIN resultados r
            ON r.grand_prix_id = gp.id_GP AND r.posicion_final = 1
        LEFT JOIN piloto g
            ON g.id_Piloto = r.piloto_id
        JOIN temporada t
            ON t.id_Temporada = gp.temporada_id
        JOIN categoria cat
            ON cat.id_Categoria = gp.id_Categoria
        JOIN circuito c
            ON c.id_Circuito = gp.circuito_id
        WHERE t.anio = ? AND cat.id_Categoria = ? AND (gp.tipo_carrera = 'GP' OR cat.id_categoria=2)
        ORDER BY gp.fecha ASC, gp.id_gp ASC;`, [Anio, Categoria])
        if (GPsTemporada.length === 0) return false 
        return GPsTemporada
    }

    static async obtenerGPPorId (idGP) {
        const [GP] = await connectionPostgres.query(`SELECT 
            gp.nombre_oficial as "Nombre_GP",
            c.nombre as "Nombre_Circuito",
            t.id_Temporada,
            t.anio,
            gp.fecha,
            gp.tiempo_pole,
            gp.pole_position_piloto_id,
            pp.codigo_fia AS "Pole_Position",
            gp.tiempo_vuelta_rapida,
            gp.vuelta_rapida_piloto_id,
            vr.codigo_fia AS "Vuelta_Rapida",
            gp.tipo_carrera,
            gp.id_Categoria
            FROM
            grandes_premios gp
            LEFT JOIN piloto pp
            ON pp.id_Piloto = gp.pole_position_piloto_id
            LEFT JOIN piloto vr
            ON vr.id_Piloto = gp.vuelta_rapida_piloto_id
            JOIN temporada t
            ON t.id_Temporada = gp.temporada_id
            JOIN circuito c
            ON c.id_Circuito = gp.circuito_id
            WHERE gp.id_GP = ?`, [idGP])
        if (GP.length === 0) return false 
        return GP
     }

    static async obtenerCampeonatoPilotosPorAnio (categoria, anio) {
      if(Number(categoria)===2){
        const [official]=await connectionPostgres.query(`
          SELECT t.anio AS temporada,p.id_piloto AS "id_Piloto",
            CONCAT(p.codigo_fia,' ',COALESCE(pt.numero,p.numero)) AS "Piloto",
            CONCAT(p.nombre,' ',p.apellido) AS nombre_completo,e.nombre AS "Equipo",c.puntos AS puntos_totales,c.posicion
          FROM clasificacion_pilotos_oficial c
          JOIN temporadas_categoria tc USING(id_categoria,temporada_id)
          JOIN temporada t ON t.id_temporada=c.temporada_id
          JOIN piloto p ON p.id_piloto=c.piloto_id
          LEFT JOIN v_pilotos_temporada_categoria pt ON pt.piloto_id=c.piloto_id AND pt.temporada_id=c.temporada_id AND pt.id_categoria=c.id_categoria
          LEFT JOIN equipo e ON e.id_equipo=pt.equipo_id
          WHERE c.id_categoria=? AND t.anio=? AND tc.clasificacion_verificada
          ORDER BY c.posicion`,[categoria,anio]);
        return official;
      }
      const [rows] = await connectionPostgres.query(`
        SELECT t.anio AS "temporada", p.id_piloto AS "id_Piloto",
          CONCAT(p.codigo_fia, ' ', COALESCE(pt.numero,p.numero)) AS "Piloto",
          CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
          e.nombre AS "Equipo", SUM(r.puntos_obtenidos) AS puntos_totales
        FROM resultados r
        JOIN grandes_premios gp ON gp.id_gp = r.grand_prix_id
        JOIN temporada t ON t.id_temporada = gp.temporada_id
        JOIN piloto p ON p.id_piloto = r.piloto_id
        LEFT JOIN v_pilotos_temporada_categoria pt ON pt.temporada_id = t.id_temporada AND pt.piloto_id = p.id_piloto AND pt.id_categoria=gp.id_categoria
        LEFT JOIN equipo e ON e.id_equipo = COALESCE(pt.equipo_id,r.equipo_id)
        WHERE t.anio = ? AND gp.id_categoria = ?
        GROUP BY t.anio,p.id_piloto,pt.numero,e.id_equipo
        ORDER BY puntos_totales DESC, nombre_completo ASC`, [anio, categoria]);
      return rows;
    }

    static async obtenerCampeonatoConstructoresPorAnio (categoria, anio) {
      if(Number(categoria)===2){
        const [official]=await connectionPostgres.query(`
          SELECT e.id_equipo AS "id_Equipo",e.nombre AS equipo,COALESCE(et.register_name,e.nombre) AS "register",
             t.anio AS temporada,c.puntos AS puntos_totales,c.posicion
          FROM clasificacion_equipos_oficial c JOIN temporadas_categoria tc USING(id_categoria,temporada_id)
          JOIN temporada t ON t.id_temporada=c.temporada_id JOIN equipo e ON e.id_equipo=c.equipo_id
          LEFT JOIN equipos_temporada et ON et.equipo_id=c.equipo_id AND et.temporada_id=c.temporada_id
          WHERE c.id_categoria=? AND t.anio=? AND tc.clasificacion_verificada
          ORDER BY c.posicion`,[categoria,anio]);
        return official;
      }
      // equipo_id por carrera evita contabilizar puntos en un equipo incorrecto tras un traspaso.
      const [rows] = await connectionPostgres.query(`
        SELECT e.id_equipo AS "id_Equipo", e.nombre AS equipo,
          COALESCE(et.register_name,e.nombre) AS "register",
          t.anio AS temporada, SUM(r.puntos_obtenidos) AS puntos_totales
        FROM resultados r
        JOIN grandes_premios gp ON gp.id_gp = r.grand_prix_id
        JOIN temporada t ON t.id_temporada = gp.temporada_id
        LEFT JOIN v_pilotos_temporada_categoria pt ON pt.piloto_id = r.piloto_id AND pt.temporada_id = t.id_temporada AND pt.id_categoria=gp.id_categoria
        JOIN equipo e ON e.id_equipo = COALESCE(r.equipo_id,pt.equipo_id)
        LEFT JOIN equipos_temporada et ON et.equipo_id = e.id_equipo AND et.temporada_id = t.id_temporada
        WHERE t.anio = ? AND gp.id_categoria = ?
        GROUP BY e.id_equipo,et.register_name,t.anio
        ORDER BY puntos_totales DESC,e.nombre ASC`, [anio, categoria]);
      return rows;
    }
    // Historial por circuito, categoría y formato; nunca por patrocinador.
    static async obtenerLastWinnerGPPorId(idGP) {
      const [rows] = await connectionPostgres.query(`
        SELECT hist.id_gp AS "id_GP", hist.nombre_oficial, t.anio,
               p.id_piloto AS "id_Piloto",
               CONCAT(p.nombre, ' ', p.apellido) AS "Winners",
               c.nombre AS "Circuito"
        FROM grandes_premios actual
        JOIN grandes_premios hist
          ON hist.circuito_id = actual.circuito_id
         AND hist.id_categoria = actual.id_categoria
         AND hist.tipo_carrera IS NOT DISTINCT FROM actual.tipo_carrera
         AND hist.id_gp <> actual.id_gp
         AND hist.fecha < actual.fecha
        JOIN resultados r ON r.grand_prix_id = hist.id_gp AND r.posicion_final = 1
        JOIN piloto p ON p.id_piloto = r.piloto_id
        JOIN temporada t ON t.id_temporada = hist.temporada_id
        JOIN circuito c ON c.id_circuito = hist.circuito_id
        WHERE actual.id_gp = ?
        ORDER BY hist.fecha DESC, hist.id_gp DESC
        LIMIT 30`, [idGP]);
      return rows;
    }

      static async obtenerLastWinnerGP (nombreOficial){
      const [LastWinners] = await connectionPostgres.query(`SELECT 
      gp.id_gp AS "id_GP",
      t.anio,
      concat(p.nombre, ' ',p.apellido) AS "Winners",
      gp.nombre_oficial,
      c.nombre AS "Circuito"
      FROM resultados rgp
      JOIN piloto p
      on p.id_Piloto = rgp.piloto_id
      join grandes_premios gp 
      on gp.id_GP = rgp.grand_prix_id
      join circuito c 
      on c.id_Circuito = gp.circuito_id
      join temporada t 
      on t.id_Temporada = gp.temporada_id
      where rgp.posicion_final = 1 AND gp.nombre_oficial = ?
      ORDER BY t.anio DESC `,[nombreOficial]);
        return LastWinners
    }

static async registrarGP({ entrada }) {
  const {
    nombre_oficial:nombreGP, fecha, circuito_id:circuito,temporada_id:temporada, vueltas_totales:vueltas, pole_position_piloto_id:polePosition, tiempo_pole:tiempoPole, vuelta_rapida_piloto_id:vueltaRapida, tiempo_vuelta_rapida:tiempoVR, tipo_carrera: formatoCarrera, id_Categoria: idCategoria
  } = entrada;

  try {
    await connectionPostgres.query(
      `INSERT INTO grandes_premios
      (nombre_oficial, fecha, circuito_id, temporada_id, vueltas_totales, pole_position_piloto_id, tiempo_pole,vuelta_rapida_piloto_id, tiempo_vuelta_rapida,tipo_carrera, id_Categoria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [nombreGP, fecha, circuito, temporada, vueltas, polePosition, tiempoPole, vueltaRapida, tiempoVR, formatoCarrera,idCategoria]
    );

    // Si quieres devolver el GP recién insertado
    const [nuevoGP] = await connectionPostgres.query(
      'SELECT * FROM grandes_premios WHERE nombre_oficial = ? AND fecha = ?',
      [nombreGP, fecha]
    );

    return nuevoGP[0];
    
  } catch (error) {
    throw new Error(error);
  }
}

static async editarGP({ entrada }) {
  // Limpia los valores: si son '' o undefined, pon null
  function limpiar(valor) {
    return (valor === '' || valor === undefined) ? null : valor;
  }

  const fecha = limpiar(entrada.fecha);
  const pilotoPP = limpiar(entrada.pole_position_piloto_id);
  const PolePosition = limpiar(entrada.tiempo_pole);
  const pilotoVR = limpiar(entrada.vuelta_rapida_piloto_id);
  const vueltaRapida = limpiar(entrada.tiempo_vuelta_rapida);
  const idGP = limpiar(entrada.id_GP);
  try {
    await connectionPostgres.query(
      `UPDATE grandes_premios
        SET 
        fecha = ?, 
        pole_position_piloto_id = ?,
        tiempo_pole = ?,
        vuelta_rapida_piloto_id = ?,
        tiempo_vuelta_rapida = ?
        WHERE id_GP = ?`,
      [fecha, pilotoPP, PolePosition, pilotoVR, vueltaRapida, idGP]
    );

    // Si quieres devolver el GP recién insertado
    const [nuevoGP] = await connectionPostgres.query(
      'SELECT * FROM grandes_premios WHERE id_GP = ? AND fecha = ?',
      [idGP, fecha]
    );

    return nuevoGP[0];
    
  } catch (error) {
    throw new Error(error);
  }
}

 }