// backend/middleware/authenticateToken.js

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (token == null) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden (token inválido ou expirado)
        }
        req.user = user; // Adiciona os dados do token (userId, role) ao objeto do pedido
        next(); // Passa para a próxima função (a rota em si)
    });
}

module.exports = authenticateToken;