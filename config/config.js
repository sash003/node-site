// config.js
require('dotenv').config(); // подключаем .env

module.exports = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONN_LIMIT || 10,
    queueLimit: 0
  }
};
