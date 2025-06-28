
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// A correção chave está aqui: exportamos a pool inteira
module.exports = {
  pool: pool,
  query: (text, params) => pool.query(text, params),
};