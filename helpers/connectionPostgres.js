import pg from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('Falta DATABASE_URL (PostgreSQL de Supabase) en Railway.');
}

const url = new URL(connectionString);
if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
  throw new Error('DATABASE_URL debe iniciar con postgresql:// (no mysql://).');
}

const pool = new pg.Pool({
  connectionString,
  max: Number(process.env.PG_POOL_SIZE || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: true }
});

pool.on('error', error => {
  console.error('[F1_App] Pool PostgreSQL:', error.message);
});

// Compatibilidad de los resultados SELECT * con los nombres originalmente
// devueltos por mysql2, que pueden incluir mayusculas y minusculas.
const legacyAliases = {
  id_categoria: 'id_Categoria',
  id_circuito: 'id_Circuito',
  id_temporada: 'id_Temporada',
  id_piloto: 'id_Piloto',
  id_equipo: 'id_Equipo',
  id_equipo_temporada: 'id_Equipo_Temporada',
  id_piloto_temporada: 'id_Piloto_Temporada',
  id_gp: 'id_GP',
  id_resultado: 'id_Resultado',
  nombre: 'Nombre',
  apellido: 'Apellido',
  nacionalidad: 'Nacionalidad',
  fecha_nacimiento: 'fecha_nacimiento',
  fecha_debut: 'fecha_debut',
  motor: 'Motor',
  estado_gp: 'Estado_GP'
};

const normalizeRow = raw => {
  const row = { ...raw };
  for (const [column, alias] of Object.entries(legacyAliases)) {
    if (Object.hasOwn(row, column) && !Object.hasOwn(row, alias)) {
      row[alias] = row[column];
    }
  }
  return row;
};

// El codigo heredado utiliza [rows] = await connection.query(...).
// Este adaptador conserva esa forma de respuesta para evitar cambios
// innecesarios en los controladores o la interfaz.
export const connectionPostgres = {
  async query(statement, params = []) {
    let index = 0;
    const sql = statement.replace(/\?/g, () => '$' + (++index));
    const result = await pool.query(sql, params);

    if (/^\s*(SELECT|WITH)\b/i.test(sql)) {
      return [result.rows.map(normalizeRow)];
    }

    return [result];
  }
};
