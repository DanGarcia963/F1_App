import { connectionPostgres } from '../../helpers/connectionPostgres.js'

export class PilotModel {
    static async obtenerTodosLosPilotos (idCategoria) {
      const [pilotos] = await connectionPostgres.query(`SELECT p.id_piloto AS "id_Piloto", CONCAT(p.nombre,' ',p.apellido) AS nombre_completo,
 CONCAT('#',p.numero,' - ',p.codigo_fia) AS identificador,p.nacionalidad,p.fecha_nacimiento,p.fecha_debut, ?::integer AS "id_Categoria"
 FROM piloto p WHERE p.id_categoria=? OR EXISTS(SELECT 1 FROM pilotos_categorias pc WHERE pc.piloto_id=p.id_piloto AND pc.id_categoria=?)
 OR EXISTS(SELECT 1 FROM v_pilotos_temporada_categoria pt WHERE pt.piloto_id=p.id_piloto AND pt.id_categoria=?)
 ORDER BY nombre_completo;`,[idCategoria,idCategoria,idCategoria,idCategoria])
  
      return pilotos
    }

    static async obtenerPilotoPorId (idPiloto, categoria=1) {
        const [piloto] = await connectionPostgres.query(`
          SELECT p.id_piloto AS "id_Piloto",
            CONCAT(p.nombre,' ',p.apellido) AS nombre_completo,
            CONCAT('#',COALESCE(p.numero::text,'—'),' - ',COALESCE(p.codigo_fia,'')) AS identificador,
            p.nacionalidad,p.fecha_nacimiento,p.fecha_debut,
            ?::integer AS "id_Categoria",e.nombre AS equipo
          FROM piloto p
          LEFT JOIN LATERAL (
             SELECT pt.equipo_id
             FROM v_pilotos_temporada_categoria pt
             JOIN temporada t ON t.id_temporada=pt.temporada_id
             WHERE pt.piloto_id=p.id_piloto AND pt.id_categoria=?
             ORDER BY t.anio DESC LIMIT 1
          ) ultimo ON TRUE
          LEFT JOIN equipo e ON e.id_equipo=ultimo.equipo_id
          WHERE p.id_piloto = ? AND (p.id_categoria=? OR EXISTS (SELECT 1 FROM pilotos_categorias pc WHERE pc.piloto_id=p.id_piloto AND pc.id_categoria=?) OR ultimo.equipo_id IS NOT NULL)`, [categoria,categoria,idPiloto,categoria,categoria]);
        return piloto[0] || false;
    }

    static async obtenerInfoPilotoPorId(idPiloto,categoria=1) {
        const [piloto] = await connectionPostgres.query(`SELECT 
      STRING_AGG(DISTINCT t.anio::text, ', ') AS "temporadas",
      e.nombre AS "Equipo",
      SUM(rgp.puntos_obtenidos) AS "puntos_totales",
      SUM(CASE WHEN gp.pole_position_piloto_id = rgp.piloto_id AND gp.tipo_carrera = 'GP' THEN 1 ELSE 0 END) AS "poles",
      SUM(CASE WHEN rgp.posicion_final = 1 AND (gp.tipo_carrera = 'GP' OR gp.id_categoria=2) THEN 1 ELSE 0 END) AS "victorias",
      SUM(CASE WHEN (rgp.posicion_final = 1 OR rgp.posicion_final = 2 OR rgp.posicion_final = 3) AND (gp.tipo_carrera = 'GP' OR gp.id_categoria=2) THEN 1 ELSE 0 END) AS "Podios",
      SUM(CASE WHEN gp.vuelta_rapida_piloto_id = ? AND (gp.tipo_carrera = 'GP' OR gp.id_categoria=2) THEN 1 ELSE 0 END) AS "FastestLaps",
      SUM(CASE WHEN rgp.piloto_id = ? AND (gp.tipo_carrera = 'GP' OR gp.id_categoria=2) AND COALESCE(rgp.estado_resultado,'FIN') NOT IN ('DNS','DNQ','DNP','WD') THEN 1 ELSE 0 END) AS "Starts"
      FROM resultados rgp
      JOIN grandes_premios gp
          ON gp.id_GP = rgp.grand_prix_id
      JOIN temporada t
          ON t.id_Temporada = gp.temporada_id
      JOIN piloto p 
          ON p.id_Piloto = rgp.piloto_id
      LEFT JOIN v_pilotos_temporada_categoria pt
          ON pt.temporada_id = t.id_Temporada
          AND pt.piloto_id = p.id_Piloto AND pt.id_categoria=gp.id_categoria
      JOIN equipo e
          ON e.id_Equipo = COALESCE(rgp.equipo_id,pt.equipo_id)
      WHERE p.id_Piloto = ? AND gp.id_categoria = ? 
      GROUP BY p.id_Piloto, e.nombre
      ORDER BY puntos_totales DESC;`, [idPiloto,idPiloto,idPiloto,categoria])
        if (piloto.length === 0) return false
    
        return piloto
    }

    static async obtenerVictoriasPilotoPorID(idPiloto,categoria=1){
        const[victorias]= await connectionPostgres.query(`SELECT 
            gp.nombre_oficial,
            t.anio,
            c.nombre AS "nombre_Circuito",
            gp.fecha
            FROM resultados rgp
            JOIN grandes_premios gp
                ON gp.id_GP = rgp.grand_prix_id
            JOIN temporada t
                ON t.id_Temporada = gp.temporada_id
            JOIN piloto p 
                ON p.id_Piloto = rgp.piloto_id
            LEFT JOIN v_pilotos_temporada_categoria pt
                ON pt.temporada_id = t.id_Temporada
                AND pt.piloto_id = p.id_Piloto AND pt.id_categoria=gp.id_categoria
            JOIN equipo e
                ON e.id_Equipo = COALESCE(rgp.equipo_id,pt.equipo_id)
            JOIN circuito c
                ON c.id_Circuito = gp.circuito_id
            WHERE p.id_Piloto = ? AND gp.id_categoria = ? AND rgp.posicion_final = 1 AND (gp.tipo_carrera = 'GP' OR gp.id_categoria=2)
            ORDER BY gp.fecha DESC;
            `, [idPiloto,categoria])
            if(victorias.length === 0) return false 
            
            return victorias
    }

        static async obtenerPodiosPilotoPorID(idPiloto,categoria=1){
        const[podios]= await connectionPostgres.query(`SELECT 
            gp.nombre_oficial AS "Nombre_GP",
            t.anio AS "Temporada",
            c.nombre AS "nombre_Circuito" ,
            gp.fecha AS "Fecha"
            FROM resultados rgp
            JOIN grandes_premios gp
                ON gp.id_GP = rgp.grand_prix_id
            JOIN temporada t
                ON t.id_Temporada = gp.temporada_id
            JOIN piloto p 
                ON p.id_Piloto = rgp.piloto_id
            LEFT JOIN v_pilotos_temporada_categoria pt
                ON pt.temporada_id = t.id_Temporada
                AND pt.piloto_id = p.id_Piloto AND pt.id_categoria=gp.id_categoria
            JOIN equipo e
                ON e.id_Equipo = COALESCE(rgp.equipo_id,pt.equipo_id)
            JOIN circuito c
                ON c.id_Circuito = gp.circuito_id
            WHERE p.id_Piloto = ? AND gp.id_categoria = ? AND (rgp.posicion_final = 1 OR rgp.posicion_final=2 OR rgp.posicion_final=3) AND (gp.tipo_carrera = 'GP' OR gp.id_categoria=2)
            ORDER BY gp.fecha DESC;
            `, [idPiloto,categoria])
            if(podios.length === 0) return false 
            
            return podios
    }

    static async obtenerTrayectoriaPilotoPorID(idPiloto,categoria=1){
        const[trayectoria]= await connectionPostgres.query(`SELECT 
                t.anio AS "temporadas",
                concat(p.codigo_fia,' ',COALESCE(rgp.numero_carrera,pt.numero)) AS "codigo_FIA",
                e.nombre AS "Equipo",
                et.register_name AS "register",
                SUM(rgp.puntos_obtenidos) AS "puntos_totales",
                SUM(CASE WHEN gp.pole_position_piloto_id = rgp.piloto_id AND gp.tipo_carrera = 'GP' THEN 1 ELSE 0 END) AS "poles",
                SUM(CASE WHEN rgp.posicion_final = 1 AND (gp.tipo_carrera = 'GP' OR gp.id_categoria=2) THEN 1 ELSE 0 END) AS "victorias",
                SUM(CASE WHEN (rgp.posicion_final = 1 OR rgp.posicion_final = 2 OR rgp.posicion_final = 3)AND (gp.tipo_carrera = 'GP' OR gp.id_categoria=2) THEN 1 ELSE 0 END) AS "Podios"
                FROM resultados rgp
                JOIN grandes_premios gp
                    ON gp.id_GP = rgp.grand_prix_id
                JOIN temporada t
                    ON t.id_Temporada = gp.temporada_id
                JOIN piloto p 
                    ON p.id_Piloto = rgp.piloto_id
                LEFT JOIN v_pilotos_temporada_categoria pt
                    ON pt.temporada_id = t.id_Temporada
                    AND pt.piloto_id = p.id_Piloto AND pt.id_categoria=gp.id_categoria
                JOIN equipo e
                    ON e.id_Equipo = COALESCE(rgp.equipo_id,pt.equipo_id)
                JOIN equipos_temporada et
                    ON et.equipo_id = e.id_Equipo
                    AND et.temporada_id = t.id_Temporada
                WHERE p.id_Piloto = ? AND gp.id_categoria = ?
                GROUP BY p.id_Piloto, e.nombre, et.register_name, COALESCE(rgp.numero_carrera,pt.numero), t.anio
                ORDER BY t.anio DESC;
            `, [idPiloto,categoria])
            if(trayectoria.length === 0) return false 
            
            return trayectoria
    }

    static async registrarPiloto ({ entrada }) {
        const {
            Nombre, Apellido, Nacionalidad, Fecha_Nacimiento:FechaNacimiento, Fecha_Debut: FechaDebut, numero, codigo_fia: codigoFIA, id_Categoria:idCategoria
        } = entrada

        const PilotoPorCodigoFIA = await PilotModel.obtenerPilotoPorId(codigoFIA)
        if (PilotoPorCodigoFIA !== false) return 'Ya existe un piloto con ese codigo de la FIA'
    
        const fechaNacimientoConFormato = new Date(FechaNacimiento)
        try {
            await connectionPostgres.query('insert into piloto (Nombre, Apellido, Nacionalidad, Fecha_Nacimiento, Fecha_Debut, numero, codigo_fia, id_Categoria) values(?, ?, ?, ?, ?, ?, ?, ?);', [Nombre, Apellido, Nacionalidad, fechaNacimientoConFormato, FechaDebut, numero, codigoFIA, idCategoria])
            const pilotoCreado = await PilotModel.obtenerPilotoPorId(codigoFIA)
            return pilotoCreado
        } catch (error) {
          throw new Error(error)
        }
    }

     static async cambiarNumero({ entrada }) {
        const {
          codigo_fia: codigoFIA, numero
        } = entrada
        const existePiloto = await this.obtenerPilotoPorId(codigoFIA)
    
        if (!existePiloto) return 'El usuario no existe'
    
        try {
            await connectionPostgres.query(
                'UPDATE piloto SET numero = ? WHERE codigo_fia = ?',
                [numero, codigoFIA]
            );
            const pilotoEditado = await this.obtenerPilotoPorId(codigoFIA)
            console.log(pilotoEditado)
            return pilotoEditado
        } catch (error) {
          return error
        }
    }
}