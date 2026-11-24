import mysql from 'mysql2/promise';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
let settings;

if (databaseUrl) {
  const url = new URL(databaseUrl);
  if (!['mysql:', 'mariadb:'].includes(url.protocol)) {
    throw new Error('La conexion requiere una URL mysql:// o mariadb://');
  }
  settings = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\/+/, ''))
  };
} else {
  settings = {
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'f1'
  };
}

export const connectionMySQL = mysql.createPool({
  ...settings,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
