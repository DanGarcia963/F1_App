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