import mysql from 'mysql2/promise'

const DEFAULT_CONFIG = { host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'f1'
}
const connection = process.env.DATABASE_URL ?? DEFAULT_CONFIG

export const connectionMySQL = await mysql.createConnection(connection)