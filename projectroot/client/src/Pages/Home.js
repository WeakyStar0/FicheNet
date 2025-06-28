// src/Pages/Home.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importar o hook useAuth
import '../styles/home.css';
import '../styles/App.css';
import { Helmet } from 'react-helmet';

export const Home = () => {
    // Hooks e Estados
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const loginPanelRef = useRef(null);
    const navigate = useNavigate();

    // Usar o nosso contexto de autenticação
    const { user, login, logout } = useAuth();

    // Estados para os campos do formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginType, setLoginType] = useState('ex/aluno');
    const [error, setError] = useState('');

    // Slides
    const slides = [
        'https://dep.estgv.ipv.pt/departamentos/dgest/wp-content/uploads/sites/6/2016/06/foto-pag1-2.png',
        'https://www.estgv.ipv.pt/estgv/fotografias/albuns/estgv/IMG_3513.JPG',
        'https://www1.esev.ipv.pt/dacomunicacao/wp-content/uploads/2024/12/estgv-800x445.jpg'
    ];

    // Lógica do carrossel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const toggleLogin = () => setIsLoginOpen(!isLoginOpen);

    // Lógica para fechar o painel ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isLoginOpen && loginPanelRef.current && !loginPanelRef.current.contains(event.target)) {
                const loginIcon = document.querySelector('.custom-login-icon');
                if (loginIcon && !loginIcon.contains(event.target)) {
                    setIsLoginOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isLoginOpen]);

    // Mapeamento dos tipos de utilizador para os valores da BD
    const loginTypeMap = {
        'admin': 'admin',
        'empresa': 'company',
        'gestor de departamento': 'manager',
        'ex/aluno': 'student'
    };
    const loginTypes = Object.keys(loginTypeMap);

    // Função para lidar com a submissão do formulário de login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const roleForApi = loginTypeMap[loginType];

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role: roleForApi }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocorreu um erro.');
            }

            // Usar a função de login do contexto
            login(data);
            setIsLoginOpen(false); // Fecha o painel de login
            navigate('/perfil'); // Redireciona para o perfil

        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/'); // Redireciona para a home após o logout
    };

    return (
        <div className="unique-home">
            <div className="unique-home-wrapper">
                <Helmet>
                    <title>Bem-vindo - ESTGV</title>
                </Helmet>
                <header className="unique-header">
                    <div className="unique-header-left">
                        <div className="unique-logo">LOGO</div>
                    </div>
                    <div className="unique-header-right">
                        {/* Renderização condicional dos botões */}
                        {!user ? (
                            <button className="custom-login-icon" onClick={toggleLogin}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </button>
                        ) : (
                            <div className="user-actions-logged-in">
                                <Link to="/perfil" className="custom-user-link">O Meu Perfil</Link>
                                <button className="custom-logout-button" onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Mostra o painel de login apenas se o utilizador não estiver logado e o painel estiver aberto */}
                {!user && isLoginOpen && (
                    <div className={`custom-login-panel ${isLoginOpen ? 'active' : ''}`} ref={loginPanelRef}>
                        <div className="custom-login-content">
                            <h2>LOGIN</h2>
                            <form className="custom-login-form" onSubmit={handleLoginSubmit}>
                                <div className="custom-form-field">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="custom-form-field">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="custom-login-type-container">
                                    <div className="custom-type-selector" onClick={() => setShowDropdown(!showDropdown)}>
                                        {loginType}
                                        <svg className={`custom-dropdown-icon ${showDropdown ? 'rotated' : ''}`} viewBox="0 0 24 24">
                                            <path d="M7 10l5 5 5-5z" />
                                        </svg>
                                    </div>
                                    {showDropdown && (
                                        <div className="custom-type-dropdown">
                                            {loginTypes.map((type) => (
                                                <div
                                                    key={type}
                                                    className={`custom-dropdown-item ${loginType === type ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setLoginType(type);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    {type}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {error && <p style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '10px' }}>{error}</p>}

                                <button type="submit" className="custom-submit-button">Login</button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="unique-carousel">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`unique-slide ${index === currentSlide ? 'showing' : ''}`}
                            style={{ backgroundImage: `linear-gradient(rgba(12, 12, 12, 1), rgba(12, 12, 12, 0.3)), url(${slide})` }}
                        >
                            {index === currentSlide && (
                                <div className="unique-slide-content">
                                    <h1>Bem Vindo</h1>
                                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="unique-carousel-indicators">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`unique-indicator ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};