// backend/db.js

require('dotenv').config();
const { Pool } = require('pg');

// A biblioteca 'pg' deteta e usa automaticamente a variável de ambiente DATABASE_URL.
// Se ela não existir, ela procura pelas variáveis individuais (DB_USER, etc.).
// Esta abordagem é flexível para desenvolvimento e produção.
const pool = new Pool({
  // Usamos a connectionString para garantir que ele lê a URL da Neon.
  connectionString: process.env.DATABASE_URL,
  
  // A maioria dos serviços de base de dados na nuvem, como a Neon,
  // exige uma conexão SSL. Isto é crucial para a segurança.
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  pool: pool,
  // Não precisamos mais do 'query' separado, podemos usar a pool diretamente.
  // pool.query(...)
};