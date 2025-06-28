// src/components/MainNavbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css'; // Vamos criar este ficheiro a seguir

const MainNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Se, por algum motivo, o utilizador não estiver logado nesta página, não mostre a navbar
    if (!user) {
        return null;
    }

    // Função para determinar o link do dashboard com base no perfil do utilizador
    const getDashboardPath = () => {
        switch (user.role) {
            case 'admin': return '/dashboard/admin';
            case 'student': return '/dashboard/student';
            case 'company': return '/dashboard/company';
            case 'manager': return '/dashboard/manager';
            default: return '/'; // Fallback para a home
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/'); // Garante o redirecionamento para a home após o logout
    };

    return (
        <header className="main-navbar-wrapper">
            <div className="navbar-section navbar-left">
                <Link to="/" className="navbar-logo">
                    LOGO
                </Link>
            </div>
            <div className="navbar-section navbar-center">
                <Link to={getDashboardPath()} className="navbar-link">
                    Dashboard
                </Link>
                {/* Poderia adicionar mais links aqui no futuro */}
            </div>
            <div className="navbar-section navbar-right">
                <Link to="/perfil" className="navbar-link">
                    O Meu Perfil
                </Link>
                <button className="navbar-logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default MainNavbar;