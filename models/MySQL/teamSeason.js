import { connectionMySQL } from '../../helpers/connectionMySQL.js'

export class TeamSeasonModel {
    static async obtenerTodosLosEquiposPorTemporadas () {
        const [equipostemporadas] = await connectionMySQL.query(`SELECT equipo.nombre as "Nombres Equipos", temporada.anio as "Temporada anio"
            FROM equipos_temporada 
            JOIN equipo 
            ON equipo.id_Equipo = equipos_temporada.equipo_id 
            JOIN temporada 
            ON temporada.id_Temporada = equipos_temporada.temporada_id ORDER BY "Temporada anio" DESC;`)
  
      return equipostemporadas
    }

    static async obtenerEquiposPorTemporadaPorId (idTemporada) {
        const [equiposTemporada] = await connectionMySQL.query(`SELECT equipo.id_Equipo, equipo.nombre as "Nombre_Equipos", 
            temporada.id_Temporada, temporada.anio as "Temporada anio"
            FROM equipos_temporada 
            JOIN equipo 
            ON equipo.id_Equipo = equipos_temporada.equipo_id 
            JOIN temporada 
            ON temporada.id_Temporada = equipos_temporada.temporada_id 	
            WHERE equipos_temporada.temporada_id = ?`, [idTemporada])
        if (equiposTemporada.length === 0) return false
    
        return equiposTemporada
    }

    static async obtenerEquiposPorIDYPorTemporadaPorId ({entrada}) {
        const {
            temporada_id:idTemporada, equipo_id:idEquipo
        }=entrada
        const [equiposTemporada] = await connectionMySQL.query(`SELECT equipo.id_Equipo, equipo.nombre as "Nombres Equipos", 
            temporada.id_Temporada, temporada.anio as "Temporada anio"
            FROM equipos_temporada 
            JOIN equipo 
            ON equipo.id_Equipo = equipos_temporada.equipo_id 
            JOIN temporada 
            ON temporada.id_Temporada = equipos_temporada.temporada_id 	
            WHERE temporada.id_Temporada = ? AND equipo.id_Equipo = ?
            ORDER BY "Temporada anio" DESC`, [idTemporada, idEquipo])
        if (equiposTemporada.length === 0) return false
    
        return equiposTemporada[0]
    }

    static async crearEquipoTemporada ({ entrada }) {
        const {
           equipo_id:idEquipo, temporada_id:idTemporada 
        } = entrada

        const equipoTemporadaExiste = await this.obtenerEquiposPorIDYPorTemporadaPorId({entrada})
        if (equipoTemporadaExiste !== false) return 'Ya existe un piloto con ese codigo de la FIA'
    
        try {
            await connectionMySQL.query('insert into equipos_temporada (equipo_id, temporada_id) values(?, ?);', [idEquipo, idTemporada])
            const equipoTemporadaCreado = await this.obtenerEquiposPorIDYPorTemporadaPorId({entrada})
            return equipoTemporadaCreado
        } catch (error) {
          throw new Error(error)
        }
    }

    static async editarTemporada({ entrada }) {
        const {
            temporada_id:idTemporada, equipo_id:idEquipo, id_Equipo_Temporada: idEquipoTemporada
        } = entrada
        const existeequipoTemporada = await this.obtenerEquiposPorIDYPorTemporadaPorId({entrada})
    
        if (existeequipoTemporada) return 'En esta temporada ya existe este equipo y no puede haber repetidos'
    
        try {
            await connectionMySQL.query(
                'UPDATE equipos_temporada SET temporada_id = ? WHERE id_Equipo_Temporada = ?',
                [idTemporada, idEquipoTemporada]
            );
            const equipotemporadaEditado = await this.obtenerEquiposPorIDYPorTemporadaPorId({entrada})
            console.log(equipotemporadaEditado)
            return equipotemporadaEditado
        } catch (error) {
          return error
        }
    }

    static async editarEquipo({ entrada }) {
        const {
            temporada_id:idTemporada, equipo_id:idEquipo, id_Equipo_Temporada: idEquipoTemporada
        } = entrada
        const existeequipoTemporada = await this.obtenerEquiposPorIDYPorTemporadaPorId({entrada})
    
        if (existeequipoTemporada) return 'El equipo en esta temporada ya existe y no puede haber repetidos'
    
        try {
            await connectionMySQL.query(
                'UPDATE equipos_temporada SET equipo_id = ? WHERE id_Equipo_Temporada = ?',
                [idEquipo, idEquipoTemporada]
            );
            const equipotemporadaEditado = await this.obtenerEquiposPorIDYPorTemporadaPorId({entrada})
            console.log(equipotemporadaEditado)
            return equipotemporadaEditado
        } catch (error) {
          return error
        }
    }
 
}