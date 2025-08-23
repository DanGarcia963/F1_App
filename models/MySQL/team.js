import { connectionMySQL } from '../../helpers/connectionMySQL.js'

export class TeamModel {
    static async obtenerTodosLosEquipos () {
      const [equipos] = await connectionMySQL.query('SELECT * FROM equipo;')
  
      return equipos
    }

    static async obtenerEquipoPorNombre (Nombre_Equipo) {
        const [equipo] = await connectionMySQL.query('SELECT * FROM equipo where nombre = ?;', [Nombre_Equipo])
        if (equipo.length === 0) return false
    
        return equipo[0]
    }

    static async obtenerEquipoPorId (id_Equipo) {
        const [equipo] = await connectionMySQL.query('SELECT * FROM equipo where id_Equipo = ?;', [id_Equipo])
        if (equipo.length === 0) return false
    
        return equipo[0]
    }

        static async obtenerDuplasPilotos (idEquipo) {
        const [pilotosTemporadaEquipo] = await connectionMySQL.query(`SELECT 
            GROUP_CONCAT(CONCAT(p.nombre, " ", p.apellido)SEPARATOR ', ')as Dupla, 
            t.anio 
            FROM pilotos_temporada pt
            JOIN equipo e
            ON e.id_Equipo = pt.equipo_id
            JOIN piloto p
            ON p.id_Piloto = pt.piloto_id
            JOIN temporada t
            ON t.id_Temporada = pt.temporada_id
            WHERE pt.equipo_id = ?
            group by e.nombre, t.anio
            order by t.anio DESC;`, [idEquipo])
        if (pilotosTemporadaEquipo.length === 0) return false 
        return pilotosTemporadaEquipo
    }

        static async obtenerVictoriasEquipoPorID(idEquipo){
        const[victorias]= await connectionMySQL.query(`SELECT 
            gp.nombre_oficial,
            t.anio,
            c.nombre as nombre_Circuito,
            concat(p.codigo_fia, ' ',pt.numero) as Winner,
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
            WHERE e.id_Equipo = ? AND rgp.posicion_final = 1 AND gp.tipo_carrera = 'GP'
            ORDER BY gp.fecha DESC;
            `, [idEquipo])
            if(victorias.length === 0) return false 
            
            return victorias
    }

    static async obtenerPilotoseEquipoTemporada ({ entrada }) {
        const {
            idEquipo, anio
        }=entrada
        const [pilotos] = await connectionMySQL.query(`SELECT
            pt.piloto_id,
            CONCAT(p.Nombre, ' ', p.Apellido) AS nombre_completo,
            COALESCE(SUM(
                CASE 
                WHEN rgp.posicion_final = 1 AND gp.temporada_id = t.id_Temporada AND gp.tipo_carrera='GP' THEN 1 
                ELSE 0 
                END
            ),0) AS victorias,
            COALESCE(SUM(
                CASE 
                WHEN rgp.posicion_final BETWEEN 1 AND 3 AND gp.temporada_id = t.id_Temporada AND gp.tipo_carrera='GP' THEN 1 
                ELSE 0 
                END
            ),0) AS podios
            FROM pilotos_temporada pt
            JOIN piloto p ON p.id_Piloto = pt.piloto_id
            JOIN temporada t ON t.id_Temporada = pt.temporada_id
            LEFT JOIN resultados rgp ON rgp.piloto_id = pt.piloto_id
            LEFT JOIN grandes_premios gp ON gp.id_GP = rgp.grand_prix_id
            WHERE pt.equipo_id = ?
            AND t.anio = ?
            GROUP BY pt.piloto_id, nombre_completo, pt.numero
            ORDER BY (pt.numero IS NULL), pt.numero ASC, nombre_completo;
            `, [idEquipo, anio])
        if (pilotos.length === 0) return false 
        return pilotos
    }
    
        static async obtenerInfoEquipoPorId (idEquipo) {
        const [equipo] = await connectionMySQL.query(`SELECT 
      t.anio,
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
      WHERE e.id_Equipo = ? AND gp.tipo_carrera = 'GP'
      GROUP BY  e.nombre, t.anio
      ORDER BY puntos_totales DESC;`, [idEquipo])
        if (equipo.length === 0) return false
    
        return equipo
    }

    static async obtenerMonoplazaActualEquipo ({ entrada }) {
        const {
            idEquipo
        }=entrada
        const [monoplaza] = await connectionMySQL.query(`SELECT 
        e.nombre,
        et.monoplaza as F1_Car,
        et.register_name,
        t.anio
        from equipo e 
        join equipos_temporada et
        on et.equipo_id = e.id_Equipo
        join temporada t 
        on t.id_Temporada = et.temporada_id
        where e.id_Equipo = ?
        ORDER BY t.anio DESC`, [idEquipo])
        if (monoplaza.length === 0) return false 
        return monoplaza
    }

    static async registrarEquipo ({ entrada }) {
        const {
            nombre, Motor, pais
        } = entrada

        const equipoExiste= await this.obtenerEquipoPorNombre(nombre)
        if (equipoExiste !== false) return 'Ya existe un equipo con este nombre'
    
        try {
            await connectionMySQL.query('insert into equipo (nombre, Motor, pais) values(?, ?, ?);', [nombre, Motor, pais])
            const equipoCreado = await this.obtenerEquipoPorNombre(nombre)
            return equipoCreado
        } catch (error) {
          throw new Error(error)
        }
    }

    static async cambiarNombre({ entrada }) {
        const {
          id_Equipo: idEquipo, nombre
        } = entrada
        const existePiloto = await this.obtenerEquipoPorId(idEquipo)
    
        if (!existePiloto) return 'El equipo no existe'
    
        try {
            await connectionMySQL.query(
                'UPDATE equipo SET nombre = ? WHERE id_Equipo = ?',
                [nombre, idEquipo]
            );
            const equipoEditado = await this.obtenerEquipoPorId(idEquipo)
            console.log(equipoEditado)
            return equipoEditado
        } catch (error) {
          return error
        }
    }

    static async cambiarMotor({ entrada }) {
        const {
          id_Equipo: idEquipo, Motor
        } = entrada
        const existePiloto = await this.obtenerEquipoPorId(idEquipo)
    
        if (!existePiloto) return 'El equipo no existe'
    
        try {
            await connectionMySQL.query(
                'UPDATE equipo SET Motor = ? WHERE id_Equipo = ?',
                [Motor, idEquipo]
            );
            const equipoEditado = await this.obtenerEquipoPorId(idEquipo)
            console.log(equipoEditado)
            return equipoEditado
        } catch (error) {
          return error
        }
    }
}