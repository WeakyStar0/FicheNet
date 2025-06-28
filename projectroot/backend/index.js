// backend/index.js

const express = require('express');
const db = require('./db'); // Importa o nosso módulo de conexão
const cors = require('cors'); // Biblioteca para permitir pedidos de diferentes origens (CORS)
const bcrypt = require('bcrypt'); // Biblioteca para encriptação de passwords
const jwt = require('jsonwebtoken'); // Biblioteca para criar e verificar tokens JWT
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
const port = 5000; // Define a porta para o backend

app.use(cors());
app.use(express.json());




//                   LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password e tipo de perfil são obrigatórios.' });
  }

  try {
    // 1. Encontrar o utilizador pelo email na tabela 'users'
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await db.pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      // Usamos uma mensagem genérica por segurança (não revela se o email existe)
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const user = userResult.rows[0];

    // 2. VERIFICAÇÃO DE SEGURANÇA CRUCIAL: O tipo de perfil selecionado no frontend
    // corresponde ao perfil guardado na base de dados?
    if (user.role !== role) {
      return res.status(401).json({ error: 'Credenciais inválidas para este tipo de perfil.' });
    }

    // 3. Comparar a password fornecida com a password encriptada na BD
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 4. Se tudo estiver correto, gerar um Token JWT
    const tokenPayload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token válido por 1 dia

    // 5. Enviar o token e os dados do utilizador de volta para o frontend
    res.json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});






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




app.post('/api/admins', async (req, res) => {
  // Apenas precisamos do email e da password para um admin
  const { email, password } = req.body;

  // Validação
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password são obrigatórios.' });
  }

  try {
    // Encriptar a password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Inserir diretamente na tabela 'users' com o role 'admin'
    const queryText = 'INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING id, email, role';
    const values = [email, passwordHash, 'admin'];

    const result = await db.pool.query(queryText, values);

    res.status(201).json({ message: 'Administrador criado com sucesso!', user: result.rows[0] });

  } catch (err) {
    console.error('Erro ao criar admin:', err.stack);
    // Verifica se o erro é de violação de chave única (email duplicado)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'O email fornecido já está registado.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor ao criar administrador.' });
  }
});




app.post('/api/companies', async (req, res) => {
  // 1. Extrair os dados do corpo do pedido
  const { email, password, companyName, description, websiteUrl } = req.body;

  // Validação
  if (!email || !password || !companyName) {
    return res.status(400).json({ error: 'Email, password e nome da empresa são obrigatórios.' });
  }

  const client = await db.pool.connect();

  try {
    // Iniciar a transação
    await client.query('BEGIN');

    // 2. Encriptar a password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Inserir na tabela 'users' com o role 'company'
    const userQueryText = 'INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING id';
    const userValues = [email, passwordHash, 'company'];
    const userResult = await client.query(userQueryText, userValues);
    const newUserId = userResult.rows[0].id;

    // 4. Inserir na tabela 'company_profiles' usando o ID do novo user
    const profileQueryText = 'INSERT INTO company_profiles(user_id, company_name, description, website_url) VALUES ($1, $2, $3, $4)';
    // O websiteUrl pode ser nulo, não há problema
    const profileValues = [newUserId, companyName, description, websiteUrl];
    await client.query(profileQueryText, profileValues);

    // Confirmar a transação
    await client.query('COMMIT');

    res.status(201).json({ message: 'Empresa criada com sucesso!', userId: newUserId });

  } catch (err) {
    // Reverter a transação em caso de erro
    await client.query('ROLLBACK');

    console.error('Erro na transação ao criar empresa:', err.stack);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'O email fornecido já está registado.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor ao criar empresa.' });

  } finally {
    // Libertar o client
    client.release();
  }
});



app.post('/api/managers', async (req, res) => {
  // 1. Extrair os dados, incluindo o departmentId
  const { email, password, fullName, departmentId } = req.body;

  // Validação
  if (!email || !password || !fullName || !departmentId) {
    return res.status(400).json({ error: 'Email, password, nome completo e departamento são obrigatórios.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 2. Encriptar a password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Inserir na tabela 'users' com o role 'manager'
    const userQueryText = 'INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING id';
    const userValues = [email, passwordHash, 'manager'];
    const userResult = await client.query(userQueryText, userValues);
    const newUserId = userResult.rows[0].id;

    // 4. Inserir na tabela 'manager_profiles'
    const profileQueryText = 'INSERT INTO manager_profiles(user_id, full_name, department_id) VALUES ($1, $2, $3)';
    const profileValues = [newUserId, fullName, departmentId];
    await client.query(profileQueryText, profileValues);

    await client.query('COMMIT');

    res.status(201).json({ message: 'Gestor criado com sucesso!', userId: newUserId });

  } catch (err) {
    await client.query('ROLLBACK');

    console.error('Erro na transação ao criar gestor:', err.stack);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'O email fornecido já está registado.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor ao criar gestor.' });

  } finally {
    client.release();
  }
});











app.get('/api/users/me/profile', authenticateToken, async (req, res) => {
  const { userId, role } = req.user; // Obtido do token JWT pelo middleware
  let query;

  try {
    switch (role) {
      case 'student':
        // Query complexa que busca dados do user, perfil e agrega as suas skills numa lista JSON
        query = `
                    SELECT u.id, u.email, u.role, u.aboutme, sp.full_name, sp.course, sp.graduation_year,
                           COALESCE(
                               (SELECT json_agg(s.*) FROM skills s JOIN student_skills ss ON s.id = ss.skill_id WHERE ss.student_profile_id = sp.id),
                               '[]'::json
                           ) as skills
                    FROM users u
                    JOIN student_profiles sp ON u.id = sp.user_id
                    WHERE u.id = $1
                `;
        break;
      case 'company':
        query = `
                    SELECT u.id, u.email, u.role, u.aboutme, cp.company_name, cp.description, cp.website_url
                    FROM users u
                    JOIN company_profiles cp ON u.id = cp.user_id
                    WHERE u.id = $1
                `;
        break;
      case 'manager':
        query = `
                    SELECT u.id, u.email, u.role, u.aboutme, mp.full_name, d.name as department_name
                    FROM users u
                    JOIN manager_profiles mp ON u.id = mp.user_id
                    JOIN departments d ON mp.department_id = d.id
                    WHERE u.id = $1
                `;
        break;
      case 'admin':
        query = `SELECT id, email, role, aboutme FROM users WHERE id = $1`;
        break;
      default:
        return res.status(400).json({ error: 'Tipo de perfil inválido.' });
    }

    const result = await db.pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil não encontrado.' });
    }
    res.json(result.rows[0]);

  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Endpoint para obter a lista de TODAS as skills (para o dropdown de edição)
app.get('/api/skills', authenticateToken, async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM skills ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar skills:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Endpoint para ATUALIZAR as skills de um estudante
app.put('/api/students/me/skills', authenticateToken, async (req, res) => {
  // Garantir que só um estudante pode usar esta rota
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { userId } = req.user;
  const { skillIds } = req.body; // Espera um array de IDs [1, 5, 12]

  const client = await db.pool.connect();
  try {
    // Obter o ID do perfil do estudante
    const profileResult = await client.query('SELECT id FROM student_profiles WHERE user_id = $1', [userId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de estudante não encontrado.' });
    }
    const studentProfileId = profileResult.rows[0].id;

    await client.query('BEGIN');
    // 1. Apagar todas as skills antigas deste estudante
    await client.query('DELETE FROM student_skills WHERE student_profile_id = $1', [studentProfileId]);

    // 2. Inserir as novas skills
    if (skillIds && skillIds.length > 0) {
      const insertQuery = 'INSERT INTO student_skills (student_profile_id, skill_id) VALUES ' +
        skillIds.map((_, i) => `($1, $${i + 2})`).join(', ');

      await client.query(insertQuery, [studentProfileId, ...skillIds]);
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Competências atualizadas com sucesso!' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar skills:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
});

// Endpoint para ATUALIZAR o "Sobre Mim" do utilizador logado
app.put('/api/users/me/aboutme', authenticateToken, async (req, res) => {
    const { userId } = req.user;
    const { aboutme } = req.body;

    if (typeof aboutme !== 'string') {
        return res.status(400).json({ error: 'O campo "aboutme" é obrigatório.' });
    }

    try {
        const query = 'UPDATE users SET aboutme = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING aboutme';
        const result = await db.pool.query(query, [aboutme, userId]);
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar "Sobre Mim":', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Endpoint para um ESTUDANTE solicitar a remoção
app.post('/api/students/me/request-removal', authenticateToken, async (req, res) => {
    const { userId, role } = req.user;

    // Dupla verificação para garantir que apenas um estudante pode usar esta rota
    if (role !== 'student') {
        return res.status(403).json({ error: 'Acesso negado. Apenas estudantes podem solicitar remoção.' });
    }

    try {
        // Atualiza a flag na tabela de perfis de estudante, não na de users
        const query = 'UPDATE student_profiles SET wants_to_be_removed = TRUE WHERE user_id = $1';
        const result = await db.pool.query(query, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Perfil de estudante não encontrado.' });
        }
        
        res.status(200).json({ message: 'Pedido de remoção enviado com sucesso. A administração irá processar o seu pedido.' });
    } catch (err) {
        console.error('Erro ao solicitar remoção:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});












// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor backend a correr em http://localhost:${port}`);
});