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
            gp.fecha,
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
        WHERE t.anio = ? AND cat.id_Categoria = ?
        ORDER BY gp.fecha ASC;`, [Anio, Categoria])
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

    static async obtenerCampeonatoPilotosPorAnio (Categoria, Anio){
        const [WDC] = await connectionPostgres.query(`select 
                t.anio AS "temporada",
                p.id_Piloto,
                concat(p.codigo_fia,' ',p.numero) AS "Piloto",
                concat(p.Nombre, ' ', p.Apellido) AS "nombre_completo",
                e.nombre AS "Equipo",
                SUM(rgp.puntos_obtenidos) AS "puntos_totales"
                from resultados rgp
                join grandes_premios gp
                on gp.id_GP = rgp.grand_prix_id
                JOIN temporada t
                on t.id_Temporada = gp.temporada_id
                join piloto p 
                on p.id_Piloto = rgp.piloto_id
                join pilotos_temporada pt
                on pt.temporada_id = t.id_Temporada
                and pt.piloto_id = p.id_Piloto
                join equipo e
                on e.id_Equipo = pt.equipo_id
                JOIN categoria cat
                ON cat.id_Categoria = gp.id_Categoria
                where t.anio = ? AND cat.id_Categoria = ?
                group by  p.id_Piloto, e.nombre, t.anio  
                ORDER BY puntos_totales desc
            `,[Anio,Categoria]);
        if(WDC === 0) return false
        return WDC
    }
        static async obtenerCampeonatoConstructoresPorAnio (Categoria,Anio){
        const [WCC] = await connectionPostgres.query(`SELECT 
            e.id_Equipo,
            e.nombre AS "equipo",
            et.register_name AS "register",
            t.anio AS "temporada",
            SUM(rgp.puntos_obtenidos) AS "puntos_totales"
            FROM resultados rgp
            JOIN grandes_premios gp ON gp.id_GP = rgp.grand_prix_id
            JOIN temporada t ON t.id_Temporada = gp.temporada_id
            JOIN piloto p ON p.id_Piloto = rgp.piloto_id
            JOIN pilotos_temporada pt ON pt.piloto_id = p.id_Piloto 
            AND pt.temporada_id = t.id_Temporada
            JOIN equipo e ON e.id_Equipo = pt.equipo_id
            JOIN equipos_temporada et ON et.equipo_id = e.id_Equipo
            AND et.temporada_id = t.id_Temporada
                 JOIN categoria cat
                ON cat.id_Categoria = gp.id_Categoria
                where t.anio = ? AND cat.id_Categoria = ?
            GROUP BY e.id_Equipo, et.register_name, t.anio
            ORDER BY puntos_totales DESC;
            `,[Anio,Categoria]);
        if(WCC === 0) return false
        return WCC
    }

      static async obtenerLastWinnerGP (nombreOficial){
      const [LastWinners] = await connectionPostgres.query(`SELECT 
      gp.id_GP,
      t.anio,
      concat(p.Nombre, ' ',p.Apellido) Winners,
      gp.nombre_oficial,
      c.nombre
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
        if(LastWinners === 0) return false
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