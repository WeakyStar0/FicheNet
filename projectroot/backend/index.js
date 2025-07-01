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

// --- ROTA DE ADMIN PARA LISTAR TODOS OS ESTUDANTES ---
app.get('/api/admin/students', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  try {
    const query = `
            SELECT 
                u.id, 
                u.email,
                sp.full_name,
                sp.course,
                sp.graduation_year,
                sp.wants_to_be_removed
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.role = 'student'
            ORDER BY sp.full_name ASC
        `;

    const { rows } = await db.pool.query(query);
    res.json(rows);

  } catch (err) {
    console.error('Erro ao buscar lista de estudantes para admin:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- ROTA DE ADMIN PARA OBTER DETALHES DE UM ESTUDANTE ESPECÍFICO ---
app.get('/api/admin/students/:studentId', authenticateToken, async (req, res) => {
  const { role } = req.user; // Quem está a pedir
  const { studentId } = req.params; // ID do estudante a ser visto

  // Verificação de permissão
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  try {
    // Query complexa que junta tudo: perfil, sobre, competências.
    const query = `
            SELECT 
                u.id, u.email, u.aboutme,
                sp.full_name, sp.course, sp.graduation_year,
                sp.institutional_email, sp.personal_email, sp.wants_to_be_removed,
                COALESCE(
                    (SELECT json_agg(s.*) FROM skills s JOIN student_skills ss ON s.id = ss.skill_id WHERE ss.student_profile_id = sp.id),
                    '[]'::json
                ) as skills
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.id = $1 AND u.role = 'student'
        `;
    const { rows } = await db.pool.query(query, [studentId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Estudante não encontrado.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(`Erro ao buscar detalhes do estudante (ID: ${studentId}):`, err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});


// --- ROTA SIMPLES PARA OBTER LISTA DE EMPRESAS (ID E NOME) ---
app.get('/api/companies/list', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.pool.query('SELECT id, company_name FROM company_profiles ORDER BY company_name');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar lista de empresas:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- ROTA PARA UM GESTOR OU EMPRESA CRIAR UMA PROPOSTA ---
app.post('/api/proposals', authenticateToken, async (req, res) => {
  // Obter dados do utilizador autenticado a partir do token
  const { userId, role } = req.user;

  // 1. Verificação de permissão: apenas gestores e empresas podem criar propostas.
  if (!['manager', 'company'].includes(role)) {
    return res.status(403).json({ error: 'Acesso negado. Apenas gestores e empresas podem criar propostas.' });
  }

  // 2. Extrair todos os dados do corpo do pedido
  const {
    title,
    description,
    proposalType,
    workLocation,
    applicationDeadline,
    contractType,
    interviewContactName,
    interviewContactEmail,
    skillIds,
    targetDepartmentIds // Campo que a empresa envia
  } = req.body;

  // 3. Validação dos campos obrigatórios
  if (!title || !description || !proposalType) {
    return res.status(400).json({ error: 'Título, descrição e tipo são obrigatórios.' });
  }

  // Validar o companyId APENAS se for um gestor a criar a proposta
  if (role === 'manager' && !req.body.companyId) {
    return res.status(400).json({ error: 'A empresa é obrigatória ao criar uma proposta.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 4. Lógica para determinar o ID do perfil da empresa (company_profiles.id)
    let companyProfileId;
    if (role === 'company') {
      // Se for uma empresa a criar, obtemos o seu próprio ID de perfil a partir do seu userId.
      const companyProfileResult = await client.query('SELECT id FROM company_profiles WHERE user_id = $1', [userId]);
      if (companyProfileResult.rows.length === 0) {
        // Esta verificação de segurança é importante caso haja uma inconsistência na BD
        throw new Error('Perfil de empresa não encontrado para o utilizador logado.');
      }
      companyProfileId = companyProfileResult.rows[0].id;
    } else { // se for role === 'manager'
      // Se for um gestor, ele precisa de ter selecionado a empresa no formulário.
      const { companyId } = req.body;
      if (!companyId) {
        return res.status(400).json({ error: 'É obrigatório selecionar uma empresa ao criar a proposta.' });
      }
      companyProfileId = companyId;
    }

    // 5. Determinar o estado inicial da proposta com base no perfil
    const status = role === 'manager' ? 'active' : 'pending_validation';

    // 6. Tratar a data para evitar erros com strings vazias
    const deadlineForDb = applicationDeadline ? applicationDeadline : null;

    // 7. Inserir a proposta na tabela principal 'proposals'
    const proposalQuery = `
            INSERT INTO proposals(
                company_id, title, description, proposal_type, work_location, application_deadline, 
                contract_type, interview_contact_name, interview_contact_email, status, created_by_user_id
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
        `;
    const proposalValues = [
      companyProfileId, title, description, proposalType, workLocation, deadlineForDb,
      contractType, interviewContactName, interviewContactEmail, status, userId
    ];

    const proposalResult = await client.query(proposalQuery, proposalValues);
    const newProposalId = proposalResult.rows[0].id;

    // 8. Associar as competências (skills) na tabela de junção
    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      const skillQuery = 'INSERT INTO proposal_skills (proposal_id, skill_id) VALUES ' + skillIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(skillQuery, [newProposalId, ...skillIds]);
    }

    // 9. Associar os departamentos alvo na tabela de junção
    if (role === 'company' && targetDepartmentIds && Array.isArray(targetDepartmentIds) && targetDepartmentIds.length > 0) {
      // A empresa seleciona os departamentos no formulário
      const deptQuery = 'INSERT INTO proposal_target_departments (proposal_id, department_id) VALUES ' + targetDepartmentIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(deptQuery, [newProposalId, ...targetDepartmentIds]);
    }
    else if (role === 'manager') {
      // O gestor associa automaticamente ao seu próprio departamento
      const managerProfileResult = await client.query('SELECT department_id FROM manager_profiles WHERE user_id = $1', [userId]);
      const departmentId = managerProfileResult.rows[0]?.department_id;
      if (departmentId) {
        await client.query('INSERT INTO proposal_target_departments (proposal_id, department_id) VALUES ($1, $2)', [newProposalId, departmentId]);
      }
    }

    // 10. Se tudo correu bem, confirmar a transação
    await client.query('COMMIT');
    res.status(201).json({ message: 'Proposta criada com sucesso!', proposalId: newProposalId });

  } catch (err) {
    // 11. Se algo falhou, reverter todas as alterações
    await client.query('ROLLBACK');
    console.error('ERRO DETALHADO AO CRIAR PROPOSTA:', err.stack);
    res.status(500).json({ error: `Erro interno do servidor: ${err.message}` });
  } finally {
    // 12. Libertar a conexão de volta para a pool
    client.release();
  }
});

// --- ROTA PARA UMA EMPRESA OBTER OS ESTUDANTES INTERESSADOS NUMA PROPOSTA ---
app.get('/api/proposals/:proposalId/matches', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  const { proposalId } = req.params;

  if (role !== 'company') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  try {
    // Verificar se a empresa é dona da proposta
    const ownerCheck = await db.pool.query('SELECT created_by_user_id FROM proposals WHERE id = $1', [proposalId]);
    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].created_by_user_id !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para ver os interessados nesta proposta.' });
    }

    // Buscar todos os estudantes que deram match (têm interesse)
    const query = `
            SELECT 
                sp.id, sp.full_name, sp.course, sp.graduation_year,
                COALESCE(
                    (SELECT json_agg(s.name) FROM skills s JOIN student_skills ss ON s.id = ss.skill_id WHERE ss.student_profile_id = sp.id),
                    '[]'::json
                ) as skills,
                m.is_notified
            FROM student_profiles sp
            JOIN matches m ON sp.id = m.student_profile_id
            WHERE m.proposal_id = $1
            ORDER BY sp.full_name
        `;
    const { rows } = await db.pool.query(query, [proposalId]);
    res.json(rows);

  } catch (err) {
    console.error('Erro ao buscar interessados na proposta:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- ROTA PARA UMA EMPRESA ACEITAR UM ESTUDANTE PARA UMA PROPOSTA ---
app.put('/api/proposals/:proposalId/matches/:studentProfileId/accept', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  const { proposalId, studentProfileId } = req.params;

  if (role !== 'company') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  try {
    // Dupla verificação de segurança: a empresa é dona da proposta?
    const ownerCheck = await db.pool.query('SELECT created_by_user_id FROM proposals WHERE id = $1', [proposalId]);
    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].created_by_user_id !== userId) {
      return res.status(403).json({ error: 'Não pode aceitar candidatos para uma proposta que não é sua.' });
    }

    // Atualizar o match para is_notified = true
    const updateQuery = 'UPDATE matches SET is_notified = TRUE WHERE proposal_id = $1 AND student_profile_id = $2';
    const result = await db.pool.query(updateQuery, [proposalId, studentProfileId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Match não encontrado.' });
    }

    // Aqui, no futuro, poderia ser disparado um email de notificação para o estudante.
    res.status(200).json({ message: 'Estudante aceite! Ele será notificado.' });

  } catch (err) {
    console.error('Erro ao aceitar estudante:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- ROTA PARA UM GESTOR/EMPRESA VER AS SUAS PRÓPRIAS PROPOSTAS ---
app.get('/api/proposals/my', authenticateToken, async (req, res) => {
  const { userId } = req.user;
  try {
    const query = `
            SELECT p.*, cp.company_name 
            FROM proposals p
            JOIN company_profiles cp ON p.company_id = cp.id
            WHERE p.created_by_user_id = $1
            ORDER BY p.created_at DESC
        `;
    const { rows } = await db.pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar as minhas propostas:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
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

// --- ROTA DE ADMIN PARA APAGAR UM ESTUDANTE ---
app.delete('/api/admin/students/:userIdToDelete', authenticateToken, async (req, res) => {
  const { role } = req.user; // Obtém o perfil de quem está a fazer o pedido
  const { userIdToDelete } = req.params; // Obtém o ID do utilizador a ser apagado

  // 1. Verificação de segurança: apenas administradores podem apagar contas.
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem executar esta ação.' });
  }

  if (!userIdToDelete) {
    return res.status(400).json({ error: 'ID do utilizador a apagar é obrigatório.' });
  }

  try {
    // Graças ao ON DELETE CASCADE na base de dados, apagar o 'user' irá apagar
    // automaticamente o 'student_profile' e todas as associações.
    const deleteQuery = 'DELETE FROM users WHERE id = $1';
    const result = await db.pool.query(deleteQuery, [userIdToDelete]);

    // Verificar se alguma linha foi de facto apagada
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado ou já foi apagado.' });
    }

    res.status(200).json({ message: 'Conta de estudante apagada com sucesso.' });

  } catch (err) {
    console.error(`Erro ao apagar utilizador (ID: ${userIdToDelete}):`, err);
    res.status(500).json({ error: 'Erro interno do servidor ao apagar a conta.' });
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

// --- ROTA PARA UM GESTOR OBTER TODAS AS PROPOSTAS DO SEU DEPARTAMENTO ---
app.get('/api/proposals/management/all', authenticateToken, async (req, res) => {
  const { role } = req.user;

  if (!['manager', 'admin'].includes(role)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  try {
    // Query agora agrega tanto os departamentos quanto as competências
    const query = `
            SELECT 
                p.*, 
                cp.company_name,
                COALESCE(
                    (SELECT json_agg(d.name) FROM departments d JOIN proposal_target_departments ptd ON d.id = ptd.department_id WHERE ptd.proposal_id = p.id), 
                    '[]'::json
                ) as target_departments,
                COALESCE(
                    (SELECT json_agg(s.*) FROM skills s JOIN proposal_skills ps ON s.id = ps.skill_id WHERE ps.proposal_id = p.id),
                    '[]'::json
                ) as skills
            FROM proposals p
            JOIN company_profiles cp ON p.company_id = cp.id
            GROUP BY p.id, cp.company_name
            ORDER BY 
                CASE p.status
                    WHEN 'pending_validation' THEN 1
                    WHEN 'active' THEN 2
                    ELSE 3
                END,
                p.created_at DESC
        `;
    const { rows } = await db.pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar todas as propostas para gestão:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- ROTA PARA UM GESTOR EDITAR UMA PROPOSTA ---
app.put('/api/proposals/:proposalId', authenticateToken, async (req, res) => {
  const { role } = req.user;
  const { proposalId } = req.params;

  // Apenas gestores podem editar propostas desta forma
  if (role !== 'manager') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  // Extrai todos os campos que podem ser editados
  const { title, description, workLocation, contractType, status } = req.body;

  // Aqui pode adicionar mais validações se necessário

  try {
    const query = `
            UPDATE proposals 
            SET 
                title = $1, 
                description = $2, 
                work_location = $3,
                contract_type = $4,
                status = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `;
    const { rows } = await db.pool.query(query, [title, description, workLocation, contractType, status, proposalId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proposta não encontrada.' });
    }

    res.status(200).json({ message: 'Proposta atualizada com sucesso!', proposal: rows[0] });

  } catch (err) {
    console.error('Erro ao editar proposta:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.put('/api/proposals/:proposalId/status', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  const { proposalId } = req.params;
  const { newStatus } = req.body;

  // Apenas gestores e admins podem alterar o status
  if (!['manager', 'admin'].includes(role)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  if (!['active', 'inactive', 'expired', 'pending_validation'].includes(newStatus)) {
    return res.status(400).json({ error: 'Estado inválido fornecido.' });
  }

  try {
    const query = `
            UPDATE proposals 
            SET status = $1, validated_by_user_id = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3
            RETURNING *
        `;
    const { rows } = await db.pool.query(query, [newStatus, userId, proposalId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proposta não encontrada.' });
    }

    res.status(200).json({ message: 'Estado da proposta atualizado com sucesso!', proposal: rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar estado da proposta:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
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



// ROTA GET /api/proposals
app.get('/api/proposals', authenticateToken, async (req, res) => {
  try {
    const query = `
            SELECT 
                p.id,
                p.company_id,
                p.title,
                p.description,
                p.proposal_type,
                p.work_location,
                p.application_deadline,
                p.contract_type,
                p.interview_contact_name,
                p.interview_contact_email,
                p.status,
                p.created_by_user_id,
                p.validated_by_user_id,
                p.created_at,
                p.updated_at,
                cp.company_name,
                COALESCE(
                    (SELECT json_agg(s.*) FROM skills s JOIN proposal_skills ps ON s.id = ps.skill_id WHERE ps.proposal_id = p.id),
                    '[]'::json
                ) as skills
            FROM proposals p
            JOIN company_profiles cp ON p.company_id = cp.id
            WHERE p.status = 'active'
            ORDER BY p.created_at DESC
        `;
    const { rows } = await db.pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar propostas ativas:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- ROTA PARA UM ESTUDANTE MOSTRAR INTERESSE (CRIAR UM MATCH) ---
app.post('/api/proposals/:proposalId/match', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  const { proposalId } = req.params;

  if (role !== 'student') {
    return res.status(403).json({ error: 'Apenas estudantes podem mostrar interesse.' });
  }

  const client = await db.pool.connect();
  try {
    // Obter o ID do perfil de estudante a partir do ID do utilizador
    const profileResult = await client.query('SELECT id FROM student_profiles WHERE user_id = $1', [userId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de estudante não encontrado.' });
    }
    const studentProfileId = profileResult.rows[0].id;

    // Inserir o match
    await client.query('INSERT INTO matches (student_profile_id, proposal_id) VALUES ($1, $2)', [studentProfileId, proposalId]);

    res.status(201).json({ message: 'Interesse registado com sucesso!' });

  } catch (err) {
    // Lidar com o caso de o match já existir (violação de chave única)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Você já demonstrou interesse nesta proposta.' });
    }
    console.error('Erro ao criar match:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
});

// --- ROTA PARA UM ESTUDANTE OBTER AS SUAS PROPOSTAS DE INTERESSE (MATCHES) ---
app.get('/api/students/me/matches', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;

  if (role !== 'student') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  try {
    const studentProfile = await db.pool.query('SELECT id FROM student_profiles WHERE user_id = $1', [userId]);
    if (studentProfile.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de estudante não encontrado.' });
    }
    const studentProfileId = studentProfile.rows[0].id;

    const query = `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.proposal_type,
                p.work_location,
                p.application_deadline,
                p.contract_type,
                p.interview_contact_name,
                p.interview_contact_email,
                cp.company_name,
                m.is_notified,
                COALESCE(
                    (SELECT json_agg(s.*) FROM skills s JOIN proposal_skills ps ON s.id = ps.skill_id WHERE ps.proposal_id = p.id),
                    '[]'::json
                ) as skills
            FROM proposals p
            JOIN company_profiles cp ON p.company_id = cp.id
            JOIN matches m ON p.id = m.proposal_id
            WHERE m.student_profile_id = $1
            ORDER BY m.created_at DESC
        `;
    const { rows } = await db.pool.query(query, [studentProfileId]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar matches do estudante:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.delete('/api/proposals/:proposalId/match', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;
  const { proposalId } = req.params;

  if (role !== 'student') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const client = await db.pool.connect();
  try {
    const studentProfile = await client.query('SELECT id FROM student_profiles WHERE user_id = $1', [userId]);
    if (studentProfile.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de estudante não encontrado.' });
    }
    const studentProfileId = studentProfile.rows[0].id;

    // Query de DELETE segura que só apaga o match do utilizador logado
    const result = await client.query(
      'DELETE FROM matches WHERE student_profile_id = $1 AND proposal_id = $2',
      [studentProfileId, proposalId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Interesse não encontrado ou já removido.' });
    }

    res.status(200).json({ message: 'Interesse removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover match:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
});




















// --- ROTA PARA OBTER RECOMENDAÇÕES DE PROPOSTAS ---
app.get('/api/proposals/recommended', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;

  if (role !== 'student') {
    return res.status(403).json({ error: 'Apenas estudantes podem receber recomendações.' });
  }

  const client = await db.pool.connect(); // Mova a conexão para o topo do try-catch principal
  try {
    // 1. Obter o perfil completo do estudante
    const studentProfileQuery = `
            SELECT sp.*, d.id as department_id,
                   COALESCE(
                       (SELECT json_agg(s.id) FROM skills s JOIN student_skills ss ON s.id = ss.skill_id WHERE ss.student_profile_id = sp.id),
                       '[]'::json
                   ) as skill_ids
            FROM student_profiles sp
            LEFT JOIN departments d ON sp.course = d.name
            WHERE sp.user_id = $1
        `;
    const studentResult = await client.query(studentProfileQuery, [userId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de estudante não encontrado.' });
    }
    const studentProfile = studentResult.rows[0];
    const studentSkillIds = new Set(studentProfile.skill_ids);
    const studentDepartmentId = studentProfile.department_id;

    // 2. Obter TODAS as propostas ativas com a informação COMPLETA
    const proposalsQuery = `
            SELECT 
                p.id, p.title, p.description, p.proposal_type, p.work_location,
                p.application_deadline, p.contract_type, p.interview_contact_name, p.interview_contact_email,
                cp.company_name,
                COALESCE((SELECT json_agg(s.*) FROM skills s JOIN proposal_skills ps ON s.id = ps.skill_id WHERE ps.proposal_id = p.id), '[]'::json) as skills,
                COALESCE((SELECT json_agg(ps.skill_id) FROM proposal_skills ps WHERE ps.proposal_id = p.id), '[]'::json) as required_skill_ids,
                COALESCE((SELECT json_agg(ptd.department_id) FROM proposal_target_departments ptd WHERE ptd.proposal_id = p.id), '[]'::json) as target_department_ids
            FROM proposals p
            JOIN company_profiles cp ON p.company_id = cp.id
            WHERE p.status = 'active'
        `;
    const proposalsResult = await client.query(proposalsQuery);
    const allProposals = proposalsResult.rows;

    const allSkillsResult = await client.query('SELECT id, type FROM skills');
    const skillTypeMap = new Map(allSkillsResult.rows.map(s => [s.id, s.type]));

    // 3. O ALGORITMO DE SCORING (inalterado)
    const scoredProposals = allProposals.map(proposal => {
      let score = 0;
      proposal.required_skill_ids.forEach(requiredSkillId => {
        if (studentSkillIds.has(requiredSkillId)) {
          const skillType = skillTypeMap.get(requiredSkillId);
          if (skillType === 'technical') score += 15;
          else if (skillType === 'softskill') score += 5;
        }
      });
      if (studentDepartmentId && proposal.target_department_ids.includes(studentDepartmentId)) {
        score += 5;
      }
      return { ...proposal, score };
    });

    // 4. Filtrar e ordenar (inalterado)
    const recommendations = scoredProposals
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(recommendations);

  } catch (err) {
    console.error('Erro ao gerar recomendações:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    if (client) client.release(); // Garante que o client é libertado
  }
});




// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor backend a correr em http://localhost:${port}`);
});