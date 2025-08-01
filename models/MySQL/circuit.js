import { connectionMySQL } from '../../helpers/connectionMySQL.js'

export class CircuitModel {
    static async obtenerTodosLosCircuitos () {
      const [pilotos] = await connectionMySQL.query('SELECT * FROM circuito;')
  
      return pilotos
    }

    static async obtenerCircuitoPorId (idCircuito) {
        const [circuito] = await connectionMySQL.query('SELECT * FROM circuito where id_Circuito = ?;', [idCircuito])
        if (circuito.length === 0) return false
    
        return circuito[0]
    }

    static async obtenerCircuitoPorNombre (nombre) {
        const [circuito] = await connectionMySQL.query('SELECT * FROM circuito where nombre = ?;', [nombre])
        if (circuito.length === 0) return false
    
        return circuito
    }

    static async registrarCircuito ({ entrada }) {
        const {
            nombre, ciudad, pais, longitud_km:kmLongitud, curvas
        } = entrada

        const circuitoExiste = await this.obtenerCircuitoPorNombre(nombre)
        if (circuitoExiste !== false) return 'Ya existe un circuito con ese nombre'
    
        try {
            await connectionMySQL.query('insert into circuito (nombre, ciudad, pais, longitud_km, curvas) values(?, ?, ?, ?, ?);', [nombre, ciudad, pais, kmLongitud, curvas])
            const circuitoCreado = await this.obtenerCircuitoPorNombre(nombre)
            return circuitoCreado
        } catch (error) {
          throw new Error(error)
        }
    }

    static async cambiarNombre({ entrada }) {
        const {
          id_Circuito: idCircuito, nombre
        } = entrada
        const existeCircuito = await this.obtenerCircuitoPorId(idCircuito)
    
        if (!existeCircuito) return 'El circuito no existe'
    
        try {
            await connectionMySQL.query(
                'UPDATE circuito SET nombre = ? WHERE id_Circuito = ?',
                [nombre, idCircuito]
            );
            const circuitoEditado = await this.obtenerCircuitoPorId(idCircuito)
            console.log(circuitoEditado)
            return circuitoEditado
        } catch (error) {
          return error
        }
    }

    static async cambiarCiudad({ entrada }) {
        const {
          id_Circuito: idCircuito, ciudad
        } = entrada
        const existeCircuito = await this.obtenerCircuitoPorId(idCircuito)
    
        if (!existeCircuito) return 'El circuito no existe'
    
        try {
            await connectionMySQL.query(
                'UPDATE circuito SET ciudad = ? WHERE id_Circuito = ?',
                [ciudad, idCircuito]
            );
            const circuitoEditado = await this.obtenerCircuitoPorId(idCircuito)
            console.log(circuitoEditado)
            return circuitoEditado
        } catch (error) {
          return error
        }
    }

    static async cambiarCurvas({ entrada }) {
        const {
          id_Circuito: idCircuito, curvas
        } = entrada
        const existeCircuito = await this.obtenerCircuitoPorId(idCircuito)
    
        if (!existeCircuito) return 'El circuito no existe'
    
        try {
            await connectionMySQL.query(
                'UPDATE circuito SET curvas = ? WHERE id_Circuito = ?',
                [curvas, idCircuito]
            );
            const circuitoEditado = await this.obtenerCircuitoPorId(idCircuito)
            console.log(circuitoEditado)
            return circuitoEditado
        } catch (error) {
          return error
        }
    }
    
    static async cambiarLongitud({ entrada }) {
        const {
          id_Circuito: idCircuito, longitud_km:kmLongitud
        } = entrada
        const existeCircuito = await this.obtenerCircuitoPorId(idCircuito)
    
        if (!existeCircuito) return 'El circuito no existe'
    
        try {
            await connectionMySQL.query(
                'UPDATE circuito SET longitud_km = ? WHERE id_Circuito = ?',
                [kmLongitud, idCircuito]
            );
            const circuitoEditado = await this.obtenerCircuitoPorId(idCircuito)
            console.log(circuitoEditado)
            return circuitoEditado
        } catch (error) {
          return error
        }
    }
}