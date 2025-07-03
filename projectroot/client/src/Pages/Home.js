// src/Pages/Home.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';
import '../styles/App.css';
import { Helmet } from 'react-helmet';

// Componente para um ícone (SVG) para usar nas secções
const Icon = ({ path }) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

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

    const loginTypeMap = { 'admin': 'admin', 'empresa': 'company', 'gestor de departamento': 'manager', 'ex/aluno': 'student' };
    const loginTypes = Object.keys(loginTypeMap);

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
            if (!response.ok) throw new Error(data.error || 'Ocorreu um erro.');
            login(data);
            setIsLoginOpen(false);
            navigate('/perfil');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="hp-landing-page">
            <Helmet>
                <title>ESTGV - Conectando Talento ao Futuro</title>
            </Helmet>

            <header className="unique-header">
                <div className="unique-header-left">
                    <div className="unique-logo">
                        <img src="https://imgur.com/FFcLnAU.png" alt="ESTGV Logo" className="nav-logo" />
                    </div>
                </div>
                <div className="unique-header-right">
                    {!user ? (
                        <button className="custom-login-icon" onClick={toggleLogin}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </button>
                    ) : (
                        <div className="user-actions-logged-in">
                            <Link to="/perfil" className="custom-user-link">O Meu Perfil</Link>
                            <button className="custom-logout-button" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </header>

            {!user && isLoginOpen && (
                <div className={`custom-login-panel ${isLoginOpen ? 'active' : ''}`} ref={loginPanelRef}>
                    <div className="custom-login-content">
                        <h2>LOGIN</h2>
                        <form className="custom-login-form" onSubmit={handleLoginSubmit}>
                            <div className="custom-form-field">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="custom-form-field">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <div className="custom-login-type-container">
                                <div className="custom-type-selector" onClick={() => setShowDropdown(!showDropdown)}>
                                    {loginType}
                                    <svg className={`custom-dropdown-icon ${showDropdown ? 'rotated' : ''}`} viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                                </div>
                                {showDropdown && (
                                    <div className="custom-type-dropdown">
                                        {loginTypes.map((type) => (
                                            <div key={type} className={`custom-dropdown-item ${loginType === type ? 'selected' : ''}`} onClick={() => { setLoginType(type); setShowDropdown(false); }}>
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
            
            <section className="hp-hero-section">
                <div className="unique-carousel">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`unique-slide ${index === currentSlide ? 'showing' : ''}`}
                            style={{ backgroundImage: `linear-gradient(to top, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0.5) 100%), url(${slide})` }}
                        />
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
                
                <div className="hp-hero-content-wrapper">
                    <div className="hp-hero-content">
                        <h1>Conectando Talento ao Futuro</h1>
                        <p>A plataforma que liga os estudantes e diplomados da ESTGV às melhores oportunidades de emprego e estágio do mercado.</p>
                        <a href="#how-it-works" className="hp-cta-button">Descubra Como</a>
                    </div>
                </div>
            </section>
            
            <section id="how-it-works" className="hp-section hp-how-it-works-section">
                <h2>Simples. Rápido. Eficaz.</h2>
                <div className="hp-steps-container">
                    <div className="hp-step-card">
                        <Icon path="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                        <h3>Crie o seu Perfil</h3>
                        <p>Complete o seu perfil com as suas competências e interesses para que o nosso sistema inteligente possa encontrar as melhores propostas para si.</p>
                    </div>
                    <div className="hp-step-card">
                        <Icon path="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
                        <h3>Descubra Oportunidades</h3>
                        <p>Receba recomendações personalizadas ou explore livremente centenas de vagas de emprego e estágio de empresas parceiras.</p>
                    </div>
                    <div className="hp-step-card">
                        <Icon path="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <h3>Inicie a sua Carreira</h3>
                        <p>Demonstre interesse, contacte as empresas e dê o próximo passo rumo a uma carreira de sucesso com o apoio da ESTGV.</p>
                    </div>
                </div>
            </section>

            <section className="hp-section hp-stats-section">
                <div className="hp-stats-container">
                    <div className="hp-stat-item">
                        <span className="hp-stat-number">150+</span>
                        <span className="hp-stat-label">Empresas Parceiras</span>
                    </div>
                    <div className="hp-stat-item">
                        <span className="hp-stat-number">300+</span>
                        <span className="hp-stat-label">Propostas Ativas</span>
                    </div>
                    <div className="hp-stat-item">
                        <span className="hp-stat-number">95%</span>
                        <span className="hp-stat-label">Compatibilidade Média</span>
                    </div>
                </div>
            </section>

            <section className="hp-section hp-partners-section">
                <h2>Empresas que Confiam no Talento ESTGV</h2>
                <div className="hp-logos-container">
                    <img src="https://logo.clearbit.com/microsoft.com" alt="Microsoft Logo" />
                    <img src="https://logo.clearbit.com/google.com" alt="Google Logo" />
                    <img src="https://logo.clearbit.com/feedzai.com" alt="Feedzai Logo" />
                    <img src="https://logo.clearbit.com/criticalsoftware.com" alt="Critical Software Logo" />
                    <img src="https://logo.clearbit.com/outsystems.com" alt="Outsystems Logo" />
                </div>
            </section>
            
            <footer className="hp-footer">
                <div className="hp-footer-content">
                    <p>© 2025 FicheNet ESTGV. Todos os direitos reservados.</p>
                    <p>Um projeto de TDM / Projeto Integrado III.</p>
                </div>
            </footer>
        </div>
    );
};