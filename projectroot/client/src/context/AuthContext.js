// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';

// O AuthContext armazena o estado de autenticação.
const AuthContext = createContext(null);

// O AuthProvider é o componente que disponibiliza o contexto para a aplicação.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // Este useEffect corre sempre que o token muda.
    // É útil para decodificar o token e verificar a sua validade, se necessário.
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('user');
            }
        }
    }, [token]);

    // Função que será chamada no componente de login.
    // Recebe os dados da API, guarda no localStorage e atualiza o estado.
    const loginAction = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
    };

    // Função que será chamada pelos botões de logout.
    // Limpa o localStorage e o estado.
    const logoutAction = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    // O valor que será partilhado com todos os componentes da aplicação.
    const value = {
        token,
        user,
        login: loginAction,
        logout: logoutAction
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para consumir facilmente o contexto.
export const useAuth = () => {
    return useContext(AuthContext);
};