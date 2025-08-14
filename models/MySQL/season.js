import { connectionMySQL } from '../../helpers/connectionMySQL.js'

export class SeasonModel {
    static async obtenerTodasLasTemporadas () {
      const [temporadas] = await connectionMySQL.query('SELECT * FROM temporada ORDER BY anio DESC;')
  
      return temporadas
    }

    static async obtenerTemporadaPorId (idTemporada) {
        const [temporada] = await connectionMySQL.query('SELECT * from temporada where id_Temporada = ?;', [idTemporada])
        if (temporada.length === 0) return false
    
        return temporada[0]
    }

    static async obtenerTemporadaPorAnio (Anio) {
        const [temporada] = await connectionMySQL.query('SELECT * from temporada where anio = ?;', [Anio])
        if (temporada.length === 0) return false
    
        return temporada[0]
    }

    static async registrarTemporada ({ entrada }) {
        const {
            anio
        } = entrada

        const temporadaPorID = await this.obtenerTemporadaPorAnio(anio)
        if (temporadaPorID !== false) return 'Ya existe una temporada con ese anio registrada'
    
        try {
            await connectionMySQL.query('insert into temporada (anio) values(?);', [anio])
            const temporadaCreado = await this.obtenerTemporadaPorAnio(anio)
            return temporadaCreado
        } catch (error) {
          throw new Error(error)
        }
    }

     static async cambiarAnio({ entrada }) {
        const {
          id_Temporada: idTemporada, anio
        } = entrada
        const existeTemporada = await this.obtenerTemporadaPorId(idTemporada)
    
        if (!existeTemporada) return 'La temporada no existe'
    
        try {
            await connectionMySQL.query(
                'UPDATE temporada SET anio = ? WHERE id_Temporada = ?',
                [anio, idTemporada]
            );
            const temporadaEditado = await this.obtenerTemporadaPorId(idTemporada)
            console.log(temporadaEditado)
            return temporadaEditado
        } catch (error) {
          return error
        }
    }
}