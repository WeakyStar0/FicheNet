// src/Pages/AboutUsPage.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../styles/AboutUs.css';

// Dados da equipa (hardcoded como pedido)
const teamMembers = [
    {
        nome: "Marcelo Dias",
        cargo: "Desenvolvedor Full-stack",
        info: "Marcelo é um desenvolvedor full-stack, criando aplicações web completas com expertise tanto no front-end quanto no back-end.",
        image: "https://imgur.com/YoTcJyL.png"
    },
    {
        nome: "João Paulo Santos",
        cargo: "Analista de Dados",
        info: "João é um analista de dados, responsável por interpretar e analisar conjuntos de dados complexos para extrair insights e informação que suportem decisões estratégicas e operacionais nas organizações.",
        image: "https://imgur.com/o1lUjjB.png"
    },
    {
        nome: "Francisco Fernandes",
        cargo: "Desenvolvedor Backend",
        info: "Francisco é um desenvolvedor de backend, responsável por implementar a lógica e a funcionalidade das aplicações web e sistemas, lidando com o processamento de dados e a integração com a Base de Dados.",
        image: "https://imgur.com/kjBiPVV.png"
    },
    {
        nome: "Rafael Nogueira",
        cargo: "Designer UI",
        info: "Rafael é um designer de UI, responsável por criar e implementar a interface visual de aplicações, garantindo uma experiência de usuário intuitiva e eficiente.",
        image: "https://imgur.com/wI6LAQe.png"
    },
    {
        nome: "Rúben Campos",
        cargo: "Desenvolvedor UX",
        info: "Rúben é um UX developer, responsável por criar interfaces de utilizador intuitivas e eficientes, combinando princípios de design e funcionalidade técnica para melhorar a experiência do utilizador.",
        image: "https://imgur.com/Km7bXEc.png"
    }
];

// Componente para um item individual do accordion
const AccordionItem = ({ member, isOpen, onClick }) => {
    return (
        <div className={`about-us-accordion-item ${isOpen ? 'open' : ''}`}>
            <button className="about-us-accordion-header" onClick={onClick}>
                <div className="about-us-member-summary">
                    <span className="about-us-member-name">{member.nome}</span>
                    <span className="about-us-member-role">{member.cargo}</span>
                </div>
                <div className="about-us-accordion-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </button>
            <div className="about-us-accordion-content">
                <div className="about-us-content-grid">
                    <div className="about-us-large-image-container">
                        <img src={member.image} alt={member.nome} className="about-us-member-large-image" />
                    </div>
                    <div className="about-us-member-info-text">
                        <p>{member.info}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente principal da página
const AboutUsPage = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const handleItemClick = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="about-us-page-wrapper">
            <Helmet>
                <title>Sobre Nós - FicheNet ESTGV</title>
            </Helmet>
            
                        <header className="unique-header">
                <div className="unique-header-left">
                    <div className="unique-logo">
                        <img src="https://imgur.com/FFcLnAU.png" alt="ESTGV Logo" className="nav-logo" />
                    </div>
                </div>
                <nav className="hp-main-nav">
                    <Link to="/" className="hp-nav-link">Home</Link>
                    <Link to="/sobre-nos" className="hp-nav-link">Sobre Nós</Link>
                </nav>
            </header>

            <div className="about-us-content-container">
                <h1 className="about-us-main-title">A Equipa por Trás do Projeto</h1>
                <p className="about-us-subtitle">
                    Somos um grupo de estudantes da Licenciatura em Tecnologias e Design de Multimédia da ESTGV,
                    apaixonados por criar soluções digitais que fazem a diferença. Este projeto é o culminar do nosso trabalho e dedicação.
                </p>

                <div className="about-us-accordion-container">
                    {teamMembers.map((member, index) => (
                        <AccordionItem
                            key={index}
                            member={member}
                            isOpen={openIndex === index}
                            onClick={() => handleItemClick(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;