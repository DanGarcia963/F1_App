import { connectionMySQL } from '../../helpers/connectionMySQL.js'

export class PilotModel {
    static async obtenerTodosLosPilotos () {
      const [pilotos] = await connectionMySQL.query('SELECT CONCAT(nombre, " ", apellido) AS "nombre_completo", CONCAT("#", numero, " - ", codigo_fia) AS "identificador", nacionalidad, fecha_nacimiento, fecha_debut FROM piloto;')
  
      return pilotos
    }

    static async obtenerPilotoPorId (idPiloto) {
        const [piloto] = await connectionMySQL.query('SELECT CONCAT(nombre, " ", apellido) AS "nombre_completo", CONCAT("#", numero, " - ", codigo_fia) AS "identificador", nacionalidad, fecha_nacimiento, fecha_debut FROM piloto where codigo_fia = ?;', [idPiloto])
        if (piloto.length === 0) return false
    
        return piloto[0]
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