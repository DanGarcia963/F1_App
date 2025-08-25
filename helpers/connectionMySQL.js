import mysql from 'mysql2/promise'
import 'dotenv/config'

const connection = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}

export const connectionMySQL = await mysql.createConnection(connection)