import { connectionMySQL } from '../../helpers/connectionMySQL.js'

export class PilotSeasonModel {
    static async obtenerTodosLosPilotosPorTemporadas () {
      const [pilotosTemporadas] = await connectionMySQL.query(`SELECT
        p.id_Piloto,
        CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
        e.id_Equipo,
        e.nombre AS equipo,
        GROUP_CONCAT(t.anio ORDER BY t.anio SEPARATOR ', ') AS temporadas
        FROM pilotos_temporada pt
        JOIN equipo e
        ON e.id_Equipo = pt.equipo_id
        JOIN piloto p
        ON p.id_Piloto = pt.piloto_id
        JOIN temporada t
        ON t.id_Temporada = pt.temporada_id
        GROUP BY
        p.id_Piloto,
        e.id_Equipo
        ORDER BY
        p.id_Piloto,
        MIN(t.anio) DESC;
        `)
      return pilotosTemporadas
    }

    static async obtenerPilotosPorTemporadaPorId (idTemporada) {
        const [pilotosTemporada] = await connectionMySQL.query(`SELECT 
            p.id_Piloto,
            CONCAT(p.nombre, " ", p.apellido) AS "nombre_completo"
            FROM pilotos_temporada pt
            JOIN equipo e
            ON e.id_Equipo = pt.equipo_id
            JOIN piloto p
            ON p.id_Piloto = pt.piloto_id
            JOIN temporada t
            ON t.id_Temporada = pt.temporada_id
            WHERE pt.temporada_id = ?;`, [idTemporada])
        if (pilotosTemporada.length === 0) return false 
        return pilotosTemporada
    }

        static async obtenerPilotosPorTemporadaYEquipoPorId (idTemporada, idPiloto) {
        const [pilotosTemporadaEquipo] = await connectionMySQL.query(`SELECT 
            e.nombre, 
            CONCAT(p.nombre, " ", p.apellido) AS "nombre_completo", 
            t.anio 
            FROM pilotos_temporada pt
            JOIN equipo e
            ON e.id_Equipo = pt.equipo_id
            JOIN piloto p
            ON p.id_Piloto = pt.piloto_id
            JOIN temporada t
            ON t.id_Temporada = pt.temporada_id
            WHERE pt.temporada_id = ? AND pt.piloto_id = ?;`, [idTemporada, idPiloto])
        if (pilotosTemporadaEquipo.length === 0) return false 
        return pilotosTemporadaEquipo
    }
    
        static async obtenerDuplaPilotos (idTemporada, idEquipo) {
        const [pilotosTemporadaEquipo] = await connectionMySQL.query(`SELECT 
            e.nombre, 
            CONCAT(p.nombre, " ", p.apellido) AS "nombre_completo", 
            t.anio 
            FROM pilotos_temporada pt
            JOIN equipo e
            ON e.id_Equipo = pt.equipo_id
            JOIN piloto p
            ON p.id_Piloto = pt.piloto_id
            JOIN temporada t
            ON t.id_Temporada = pt.temporada_id
            WHERE pt.temporada_id = ? AND pt.equipo_id = ?;`, [idTemporada, idEquipo])
        if (pilotosTemporadaEquipo.length === 0) return false 
        return pilotosTemporadaEquipo
    }

    static async crearPilotoTemporada ({ entrada }) {
        const {
            piloto_id:idPiloto, equipo_id:idEquipo, temporada_id:idTemporada, numero
        } = entrada

        const pilotoTemporadaExiste = await this.obtenerPilotosPorTemporadaYEquipoPorId(idTemporada, idPiloto)
        if (pilotoTemporadaExiste !== false) {
            return 'Ya existe un piloto esta temporada en ese equipo'
        }

    
        try {
            await connectionMySQL.query('insert into pilotos_temporada (piloto_id, equipo_id, temporada_id, numero) values(?, ?, ?, ?);', [idPiloto, idEquipo, idTemporada, numero])
            const pilotoTemporadaCreado = await this.obtenerPilotosPorTemporadaYEquipoPorId(idTemporada, idPiloto)
            return pilotoTemporadaCreado
        } catch (error) {
          throw new Error(error)
        }
    }


    static async editarPiloto({ entrada }) {
        const {
          id_Piloto_Temporada:idPilotoTemporada, piloto_id: idPiloto, equipo_id: idEquipo, temporada_id: idTemporada, numero
        } = entrada
        const existeDuplaPilotos = await this.obtenerDuplaPilotos(idTemporada, idEquipo)
        console.log(idTemporada, idEquipo, idPiloto, idPilotoTemporada)
        if (existeDuplaPilotos.length > 2) {return 'Esta temporada la escuderia ya tiene su dupla de pilotos'}
        
        const existePilotoTemporada = await this.obtenerPilotosPorTemporadaPorId(idTemporada, idPiloto)
        
        if (existePilotoTemporada === false) {return 'Ya existe este piloto en esta temporada'}

        try {
            await connectionMySQL.query(
                'UPDATE pilotos_Temporada SET piloto_id = ?, equipo_id = ?, numero =? WHERE id_Piloto_Temporada = ?',
                [idPiloto, idEquipo, numero, idPilotoTemporada]
            );
            const PilotoTemporadaEditado = await this.obtenerPilotosPorTemporadaPorId(idTemporada, idPiloto)
            console.log(PilotoTemporadaEditado)
            return PilotoTemporadaEditado
        } catch (error) {
          return error
        }
    }

}

