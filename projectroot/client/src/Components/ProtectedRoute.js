// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token } = useAuth();

    // Verificação 1: O utilizador está logado?
    // Se não houver token ou dados do utilizador, redireciona para a página inicial (login).
    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    // Verificação 2: O utilizador tem a permissão (role) correta?
    // 'allowedRoles' é um array de perfis permitidos (ex: ['admin', 'manager'])
    // Se a rota exige um perfil específico e o utilizador não o tem, redireciona.
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redireciona para um local seguro, como a sua própria página de perfil.
        // Isto evita que um estudante veja um erro ou uma página em branco ao tentar aceder ao dashboard de admin.
        alert('Acesso negado. Você não tem permissão para ver esta página.');
        return <Navigate to="/perfil" replace />;
    }

    // Se passou em todas as verificações, mostra a página que está a ser protegida.
    return children;
};

export default ProtectedRoute;