/*import mysql from 'mysql2/promise'
import 'dotenv/config'

const connection = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}

export const connectionMySQL = await mysql.createConnection(connection)
*/
import mysql from 'mysql2/promise'

const DEFAULT_CONFIG = { host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'f1'
}
const connection = process.env.DATABASE_URL ?? DEFAULT_CONFIG

export const connectionMySQL = await mysql.createConnection(connection)