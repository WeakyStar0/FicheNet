import React, { useState, useEffect, useRef } from 'react';
import '../styles/home.css';
import '../App.css';

export const Home = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const loginPanelRef = useRef(null);

    // Imagens para o carrossel
    const slides = [
        '../img/Captura de ecrã 2025-03-08 173025 1.png',
        '../img/Captura de ecrã 2025-03-08 173025 1.png',
        '../img/Captura de ecrã 2025-03-08 173025 1.png'
    ];

    // Efeito para mudar os slides automaticamente
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const toggleLogin = () => {
        setIsLoginOpen(!isLoginOpen);
    };

    // Fechar o painel ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isLoginOpen && loginPanelRef.current && !loginPanelRef.current.contains(event.target)) {
                // Verifica se o clique não foi no ícone de login
                const loginIcon = document.querySelector('.login-icon');
                if (loginIcon && !loginIcon.contains(event.target)) {
                    setIsLoginOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLoginOpen]);

    return (
        <div className="home-container">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <div className="logo">LOGO</div>
                </div>
                <div className="header-right">
                    <button className="login-icon" onClick={toggleLogin}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Painel de Login */}
            <div className={`login-panel ${isLoginOpen ? 'open' : ''}`} ref={loginPanelRef}>
                <div className="login-content">
                    <h2>LOGIN</h2>
                    <form className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Utilizador</label>
                            <input type="text" id="username" name="username" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" />
                        </div>
                        <button type="submit" className="login-button">Login</button>
                    </form>
                </div>
            </div>

            {/* Carrossel */}
            <div className="carousel">
                {slides.map((slide, index) => (
                    <div 
                        key={index}
                        className={`slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide})` }}
                    >
                        {index === currentSlide && (
                            <div className="slide-content">
                                <h1>Bem Vindo</h1>
                                <p>
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
                                    when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                                </p>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Indicadores do carrossel */}
                <div className="carousel-indicators">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};