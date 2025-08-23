import { connectionMySQL } from '../../helpers/connectionMySQL.js'

export class PilotModel {
    static async obtenerTodosLosPilotos () {
      const [pilotos] = await connectionMySQL.query('SELECT id_Piloto, CONCAT(nombre, " ", apellido) AS "nombre_completo", CONCAT("#", numero, " - ", codigo_fia) AS "identificador", nacionalidad, fecha_nacimiento, fecha_debut FROM piloto ORDER BY nombre_completo;')
  
      return pilotos
    }

    static async obtenerPilotoPorId (idPiloto) {
        const [piloto] = await connectionMySQL.query('SELECT CONCAT(nombre, " ", apellido) AS "nombre_completo", CONCAT("#", numero, " - ", codigo_fia) AS "identificador", nacionalidad, fecha_nacimiento, fecha_debut FROM piloto where id_Piloto = ?;', [idPiloto])
        if (piloto.length === 0) return false
    
        return piloto[0]
    }

    static async obtenerInfoPilotoPorId (idPiloto) {
        const [piloto] = await connectionMySQL.query(`SELECT 
      GROUP_CONCAT(DISTINCT t.anio) AS temporadas,
      e.nombre AS Equipo,
      SUM(rgp.puntos_obtenidos) AS puntos_totales,
      SUM(CASE WHEN rgp.posicion_inicio = 1 THEN 1 ELSE 0 END) AS poles,
      SUM(CASE WHEN rgp.posicion_final = 1 THEN 1 ELSE 0 END) AS victorias,
      SUM(CASE WHEN rgp.posicion_final = 1 || rgp.posicion_final = 2 || rgp.posicion_final = 3 THEN 1 ELSE 0 END) AS Podios
      FROM resultados rgp
      JOIN grandes_premios gp
          ON gp.id_GP = rgp.grand_prix_id
      JOIN temporada t
          ON t.id_Temporada = gp.temporada_id
      JOIN piloto p 
          ON p.id_Piloto = rgp.piloto_id
      JOIN pilotos_temporada pt
          ON pt.temporada_id = t.id_Temporada
          AND pt.piloto_id = p.id_Piloto
      JOIN equipo e
          ON e.id_Equipo = pt.equipo_id
      WHERE p.id_Piloto = ? AND gp.tipo_carrera = 'GP'
      GROUP BY p.id_Piloto, e.nombre
      ORDER BY puntos_totales DESC;`, [idPiloto])
        if (piloto.length === 0) return false
    
        return piloto
    }

    static async obtenerVictoriasPilotoPorID(idPiloto){
        const[victorias]= await connectionMySQL.query(`SELECT 
            gp.nombre_oficial,
            t.anio,
            c.nombre as nombre_Circuito,
            gp.fecha
            FROM resultados rgp
            JOIN grandes_premios gp
                ON gp.id_GP = rgp.grand_prix_id
            JOIN temporada t
                ON t.id_Temporada = gp.temporada_id
            JOIN piloto p 
                ON p.id_Piloto = rgp.piloto_id
            JOIN pilotos_temporada pt
                ON pt.temporada_id = t.id_Temporada
                AND pt.piloto_id = p.id_Piloto
            JOIN equipo e
                ON e.id_Equipo = pt.equipo_id
            JOIN circuito c
                ON c.id_Circuito = gp.circuito_id
            WHERE p.id_Piloto = ? AND rgp.posicion_final = 1 AND gp.tipo_carrera = 'GP'
            ORDER BY gp.fecha DESC;
            `, [idPiloto])
            if(victorias.length === 0) return false 
            
            return victorias
    }

        static async obtenerPodiosPilotoPorID(idPiloto){
        const[podios]= await connectionMySQL.query(`SELECT 
            gp.nombre_oficial AS Nombre_GP,
            t.anio AS Temporada,
            c.nombre AS nombre_Circuito ,
            gp.fecha AS Fecha
            FROM resultados rgp
            JOIN grandes_premios gp
                ON gp.id_GP = rgp.grand_prix_id
            JOIN temporada t
                ON t.id_Temporada = gp.temporada_id
            JOIN piloto p 
                ON p.id_Piloto = rgp.piloto_id
            JOIN pilotos_temporada pt
                ON pt.temporada_id = t.id_Temporada
                AND pt.piloto_id = p.id_Piloto
            JOIN equipo e
                ON e.id_Equipo = pt.equipo_id
            JOIN circuito c
                ON c.id_Circuito = gp.circuito_id
            WHERE p.id_Piloto = ? AND (rgp.posicion_final = 1 OR rgp.posicion_final=2 OR rgp.posicion_final=3) AND gp.tipo_carrera = 'GP'
            ORDER BY gp.fecha DESC;
            `, [idPiloto])
            if(podios.length === 0) return false 
            
            return podios
    }

    static async obtenerTrayectoriaPilotoPorID(idPiloto){
        const[trayectoria]= await connectionMySQL.query(`SELECT 
                GROUP_CONCAT(DISTINCT t.anio SEPARATOR ', ') AS temporadas,
                concat(p.codigo_fia,' ',pt.numero) AS codigo_FIA,
                e.nombre AS Equipo,
                SUM(rgp.puntos_obtenidos) AS puntos_totales,
                SUM(CASE WHEN rgp.posicion_inicio = 1 THEN 1 ELSE 0 END) AS poles,
                SUM(CASE WHEN rgp.posicion_final = 1 THEN 1 ELSE 0 END) AS victorias,
                SUM(CASE WHEN rgp.posicion_final = 1 || rgp.posicion_final = 2 || rgp.posicion_final = 3 THEN 1 ELSE 0 END) AS Podios
                FROM resultados rgp
                JOIN grandes_premios gp
                    ON gp.id_GP = rgp.grand_prix_id
                JOIN temporada t
                    ON t.id_Temporada = gp.temporada_id
                JOIN piloto p 
                    ON p.id_Piloto = rgp.piloto_id
                JOIN pilotos_temporada pt
                    ON pt.temporada_id = t.id_Temporada
                    AND pt.piloto_id = p.id_Piloto
                JOIN equipo e
                    ON e.id_Equipo = pt.equipo_id
                WHERE p.id_Piloto = ? AND gp.tipo_carrera = 'GP'
                GROUP BY p.id_Piloto, e.nombre, pt.numero
                ORDER BY puntos_totales DESC;
            `, [idPiloto])
            if(trayectoria.length === 0) return false 
            
            return trayectoria
    }

    static async registrarPiloto ({ entrada }) {
        const {
            Nombre, Apellido, Nacionalidad, Fecha_Nacimiento:FechaNacimiento, Fecha_Debut: FechaDebut, numero, codigo_fia: codigoFIA
        } = entrada

        const PilotoPorCodigoFIA = await PilotModel.obtenerPilotoPorId(codigoFIA)
        if (PilotoPorCodigoFIA !== false) return 'Ya existe un piloto con ese codigo de la FIA'
    
        const fechaNacimientoConFormato = new Date(FechaNacimiento)
        try {
            await connectionMySQL.query('insert into piloto (Nombre, Apellido, Nacionalidad, Fecha_Nacimiento, Fecha_Debut, numero, codigo_fia) values(?, ?, ?, ?, ?, ?, ?);', [Nombre, Apellido, Nacionalidad, fechaNacimientoConFormato, FechaDebut, numero, codigoFIA])
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
            await connectionMySQL.query(
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