import React, { useState, useEffect, useRef } from 'react';
import '../styles/home.css';
import '../styles/App.css';
import { Helmet } from 'react-helmet';

export const Home = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loginType, setLoginType] = useState('ex/aluno');
    const [showDropdown, setShowDropdown] = useState(false);
    const loginPanelRef = useRef(null);

    const slides = [
        'https://dep.estgv.ipv.pt/departamentos/dgest/wp-content/uploads/sites/6/2016/06/foto-pag1-2.png',
        'https://www.estgv.ipv.pt/estgv/fotografias/albuns/estgv/IMG_3513.JPG',
        'https://www1.esev.ipv.pt/dacomunicacao/wp-content/uploads/2024/12/estgv-800x445.jpg'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length, currentSlide]);

    const toggleLogin = () => {
        setIsLoginOpen(!isLoginOpen);
    };

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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLoginOpen]);

    const loginTypes = ['admin', 'empresa', 'gestor de departamento', 'ex/aluno'];

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
                        <button className="custom-login-icon" onClick={toggleLogin}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </button>
                    </div>
                </header>

                <div className={`custom-login-panel ${isLoginOpen ? 'active' : ''}`} ref={loginPanelRef}>
                    <div className="custom-login-content">
                        <h2>LOGIN</h2>
                        <form className="custom-login-form">
                            <div className="custom-form-field">
                                <label htmlFor="username">Utilizador</label>
                                <input type="text" id="username" name="username" />
                            </div>
                            <div className="custom-form-field">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" />
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

                            <button type="submit" className="custom-submit-button">Login</button>
                        </form>
                    </div>
                </div>

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