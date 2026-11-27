import { connectionPostgres } from '../../helpers/connectionPostgres.js'

export class PilotSeasonModel {
    static async obtenerTodosLosPilotosPorTemporadas () {
      const [pilotosTemporadas] = await connectionPostgres.query(`SELECT
        p.id_Piloto,
        CONCAT(p.nombre, ' ', p.apellido) AS "nombre_completo",
        e.id_Equipo,
        e.nombre AS "equipo",
        STRING_AGG(t.anio::text, ', ' ORDER BY t.anio) AS "temporadas"
        FROM v_pilotos_temporada_categoria pt
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

    static async obtenerPilotosPorTemporadaPorId (idCategoria, idTemporada) {
        const [pilotosTemporada] = await connectionPostgres.query(`SELECT 
            p.id_Piloto,
            CONCAT(p.nombre, ' ', p.apellido) AS "nombre_completo"
            FROM v_pilotos_temporada_categoria pt
            JOIN equipo e
            ON e.id_Equipo = pt.equipo_id
            JOIN piloto p
            ON p.id_Piloto = pt.piloto_id
            JOIN temporada t
            ON t.id_Temporada = pt.temporada_id
            WHERE pt.temporada_id = ? AND pt.id_categoria = ?
            ORDER BY e.nombre;`, [idTemporada, idCategoria])
        if (pilotosTemporada.length === 0) return false 
        return pilotosTemporada
    }

        static async obtenerPilotosPorTemporadaYEquipoPorId (idTemporada, idPiloto, categoria=1) {
        const [pilotosTemporadaEquipo] = await connectionPostgres.query(`SELECT 
            e.nombre, 
            CONCAT(p.nombre, ' ', p.apellido) AS "nombre_completo", 
            t.anio 
            FROM v_pilotos_temporada_categoria pt
            JOIN equipo e
            ON e.id_Equipo = pt.equipo_id
            JOIN piloto p
            ON p.id_Piloto = pt.piloto_id
            JOIN temporada t
            ON t.id_Temporada = pt.temporada_id
            WHERE pt.temporada_id = ? AND pt.piloto_id = ? AND pt.id_categoria = ?;`, [idTemporada, idPiloto,categoria])
        if (pilotosTemporadaEquipo.length === 0) return false 
        return pilotosTemporadaEquipo
    }
    
        static async obtenerDuplaPilotos (idTemporada, idEquipo) {
        const [pilotosTemporadaEquipo] = await connectionPostgres.query(`SELECT 
            e.nombre, 
            CONCAT(p.nombre, ' ', p.apellido) AS "nombre_completo", 
            t.anio 
            FROM v_pilotos_temporada_categoria pt
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
        const { piloto_id, equipo_id, temporada_id, numero } = entrada;
        const [rows] = await connectionPostgres.query(
          'SELECT id_categoria FROM equipo WHERE id_equipo = ?', [equipo_id]);
        if (!rows.length) throw new Error('Equipo no encontrado');
        const categoria = Number(rows[0].id_categoria);
        if (categoria === 1) return this.crearPilotoTemporadaLegado({ entrada });
        // One membership per driver/category; one enrollment per category-season.
        // Both changes are atomic within this PostgreSQL statement.
        const [created] = await connectionPostgres.query(`
          WITH afiliacion AS (
            INSERT INTO pilotos_categorias(piloto_id,id_categoria)
            VALUES (?,?) ON CONFLICT DO NOTHING
          )
          INSERT INTO pilotos_temporada_categoria(piloto_id,id_categoria,temporada_id,equipo_id,numero)
          VALUES (?,?,?,?,?)
          ON CONFLICT (piloto_id,id_categoria,temporada_id) DO NOTHING
          RETURNING *`, [piloto_id,categoria,piloto_id,categoria,temporada_id,equipo_id,numero]);
        if (!created.length) return 'Ya existe una inscripción en esta categoría y temporada';
        return created;
    }

    static async crearPilotoTemporadaLegado ({ entrada }) {
        const {
            piloto_id:idPiloto, equipo_id:idEquipo, temporada_id:idTemporada, numero
        } = entrada

        const pilotoTemporadaExiste = await this.obtenerPilotosPorTemporadaYEquipoPorId(idTemporada, idPiloto, 1)
        if (pilotoTemporadaExiste !== false) {
            return 'Ya existe un piloto esta temporada en ese equipo'
        }

    
        try {
            await connectionPostgres.query('insert into pilotos_temporada (piloto_id, equipo_id, temporada_id, numero) values(?, ?, ?, ?);', [idPiloto, idEquipo, idTemporada, numero])
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
        const [teams] = await connectionPostgres.query('SELECT id_categoria FROM equipo WHERE id_equipo = ?', [idEquipo]);
        if (!teams.length) throw new Error('Equipo no encontrado');
        if (Number(teams[0].id_categoria) !== 1) {
          // F2 uses a composite key. Never interpret a legacy F1 row ID as F2.
          return 'La edición histórica F2 requiere identificar categoría, piloto y temporada; usar el importador verificado';
        }
        const [legacy] = await connectionPostgres.query(`
          SELECT pt.piloto_id FROM pilotos_temporada pt JOIN equipo e ON e.id_equipo=pt.equipo_id
          WHERE pt.id_piloto_temporada=? AND e.id_categoria=1 AND pt.temporada_id=?`,
          [idPilotoTemporada,idTemporada]);
        if (!legacy.length) return 'Inscripción F1 no encontrada';
        const existeDuplaPilotos = await this.obtenerDuplaPilotos(idTemporada, idEquipo)
        console.log(idTemporada, idEquipo, idPiloto, idPilotoTemporada)
        if (Array.isArray(existeDuplaPilotos) && existeDuplaPilotos.length > 2) {return 'Esta temporada la escuderia ya tiene su dupla de pilotos'}
        
        const existePilotoTemporada = await this.obtenerPilotosPorTemporadaYEquipoPorId(idTemporada, idPiloto, 1)
        
        if (existePilotoTemporada === false) {return 'Ya existe este piloto en esta temporada'}

        try {
            await connectionPostgres.query(
                'UPDATE pilotos_temporada SET piloto_id = ?, equipo_id = ?, numero =? WHERE id_Piloto_Temporada = ?',
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

