// backend/index.js

const express = require('express');
const db = require('./db'); // Importa o nosso módulo de conexão
const cors = require('cors'); // Biblioteca para permitir pedidos de diferentes origens (CORS)
const bcrypt = require('bcrypt'); // Biblioteca para encriptação de passwords

const app = express();
const port = 5000; // Define a porta para o backend

app.use(cors());
app.use(express.json());

// Uma rota GET que vai buscar todos os departamentos à base de dados
app.get('/api/departments', async (req, res) => {
  try {
    // CORRIGIDO: Usar db.pool.query em vez de db.query
    const result = await db.pool.query('SELECT * FROM departments');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});


// Rota GET para buscar todos os perfis de estudantes
app.get('/api/students', async (req, res) => {
  try {
    // CORRIGIDO: Usar db.pool.query em vez de db.query
    const result = await db.pool.query('SELECT * FROM student_profiles');
    res.json(result.rows);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Database query failed' });
  }
});



app.post('/api/students', async (req, res) => {
  // 1. Extrair os dados do corpo do pedido (enviados pelo frontend)
  const { fullName, email, password, course, graduationYear } = req.body;

  // Validação básica dos dados recebidos
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e password são obrigatórios.' });
  }

  // A pool de conexões do 'pg' permite-nos usar um 'client' para transações
  const client = await db.pool.connect(); // Usamos db.pool em vez de db.query diretamente
  // Nota: Terá que exportar a pool em db.js

  try {
    // --- INÍCIO DA TRANSAÇÃO ---
    await client.query('BEGIN');

    // 2. Encriptar a password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Inserir na tabela 'users' e obter o ID do novo user
    // Usamos 'RETURNING id' para que o SQL nos devolva o ID que acabou de ser gerado.
    const userQueryText = 'INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING id';
    const userValues = [email, passwordHash, 'student'];
    const userResult = await client.query(userQueryText, userValues);
    const newUserId = userResult.rows[0].id;

    // 4. Inserir na tabela 'student_profiles' usando o ID do novo user
    const profileQueryText = 'INSERT INTO student_profiles(user_id, full_name, institutional_email, course, graduation_year) VALUES ($1, $2, $3, $4, $5)';
    const profileValues = [newUserId, fullName, email, course, graduationYear];
    await client.query(profileQueryText, profileValues);

    // --- FIM DA TRANSAÇÃO (CONFIRMAR) ---
    // Se tudo correu bem até aqui, confirmamos as alterações na base de dados.
    await client.query('COMMIT');

    res.status(201).json({ message: 'Aluno criado com sucesso!', userId: newUserId });

  } catch (err) {
    // --- REVERTER A TRANSAÇÃO ---
    // Se ocorreu algum erro, desfazemos TODAS as alterações feitas dentro desta transação.
    await client.query('ROLLBACK');

    console.error('Erro na transação:', err.stack);
    // Verifica se o erro é de violação de chave única (email duplicado)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'O email fornecido já está registado.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor ao criar aluno.' });

  } finally {
    // Independentemente do resultado (sucesso ou erro), libertamos o client de volta para a pool.
    client.release();
  }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor backend a correr em http://localhost:${port}`);
});