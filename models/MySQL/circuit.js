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

    static async obtenerRecordPolePorId (idCircuito) {
        const [recordPole] = await connectionMySQL.query(
            `SELECT 
              CONCAT(pp.Nombre, ' ',pp.Apellido)AS nombre_completo,
              gp.tiempo_pole,
              gp.fecha,
              gp.nombre_oficial
              FROM grandes_premios gp 
              JOIN circuito c
              ON c.id_Circuito = gp.circuito_id
              JOIN piloto pp
              ON pp.id_Piloto = gp.pole_position_piloto_id
              WHERE c.id_Circuito = ?
              AND gp.tiempo_pole IS NOT NULL
              ORDER BY gp.tiempo_pole ASC;
              `, [idCircuito]
        )
        if (recordPole.length === 0) return false
        return recordPole[0]
    }

    static async obtenerRecordVueltaPorId (idCircuito) {
        const [recordVuelta] = await connectionMySQL.query(
            `SELECT 
              CONCAT(vr.Nombre, ' ',vr.Apellido)AS nombre_completo,
              gp.tiempo_vuelta_rapida,
              gp.fecha,
              gp.nombre_oficial
              FROM grandes_premios gp 
              JOIN circuito c
              ON c.id_Circuito = gp.circuito_id
              JOIN piloto vr
              ON vr.id_Piloto = gp.vuelta_rapida_piloto_id
              WHERE c.id_Circuito = ?
              AND gp.tiempo_vuelta_rapida IS NOT NULL
              ORDER BY gp.tiempo_vuelta_rapida ASC
              `, [idCircuito]
        )
        if (recordVuelta.length === 0) return false
        return recordVuelta[0]
    }

    static async obtenerMaxVencedorPorId (idCircuito) {
        const [maxVencedor] = await connectionMySQL.query(
            `SELECT 
              CONCAT(p.Nombre, ' ',p.Apellido)AS nombre_completo,
              COUNT(r.posicion_final) AS total_victorias
              FROM resultados r
              JOIN grandes_premios gp
              ON gp.id_GP = r.grand_prix_id
              JOIN circuito c
              ON c.id_Circuito = gp.circuito_id
              JOIN piloto p
              ON p.id_Piloto = r.piloto_id
              WHERE c.id_Circuito = ? AND r.posicion_final = 1 AND gp.tipo_carrera = 'GP'
              GROUP BY p.id_Piloto
              ORDER BY total_victorias DESC
              LIMIT 1`, [idCircuito]
        )
        if (maxVencedor.length === 0) return false
        return maxVencedor[0]
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