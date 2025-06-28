// src/components/AdminDashboard.js

import React, { useState } from 'react';
import AddStudentOverlay from '../Components/AddStudentOverlay.js';
import '../styles/Dashboard.css';

function AdminDashboard() {
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    // Função para submeter os dados do novo aluno para o backend
const handleAddStudent = async (studentData) => {
    console.log("A enviar para a API:", studentData);

    try {
        // ALTERAÇÃO AQUI: Removemos "http://localhost:5000"
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ocorreu uma falha ao adicionar o aluno.');
        }

        const result = await response.json();
        console.log('Resposta do servidor:', result);
        alert('Aluno adicionado com sucesso!');
        setIsOverlayVisible(false);

    } catch (error) {
        console.error('Erro ao adicionar aluno:', error);
        alert(`Erro: ${error.message}`);
    }
};

    return (
        <div className="dashboard-container">
            {/* Sidebar (inalterada) */}
            <aside className="sidebar">
                <div className="logo-section">
                    <img src="/logo.png" alt="ESTGV Logo" className="logo" />
                    <h2>Inst. Politécnico de Viseu</h2>
                    <span className="admin-tag">ADMIN</span>
                </div>
                <nav className="menu">
                    <a href="#">Dashboard</a>
                    <a href="#">Estudantes</a>
                    <a href="#">Propostas de Empresas</a>
                    <a href="#">Empresas</a>
                    <a href="#">Submissões</a>
                    <a href="#">Departamento</a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main">
                <div className="welcome">
                    <h1>Bem-vindo ao Dashboard ESTGV</h1>
                    <p className="email">Estgv@estgv.ipv.pt</p>

                    <div className="actions">
                        <div className="action-card">
                            <div className="icon">👤</div>
                            <div>
                                <h3>Adicionar um admin</h3>
                                <p>Crie e gira outros utilizadores com permissões de administrador na plataforma.</p>
                            </div>
                        </div>
                        <div className="action-card">
                            <div className="icon">🏛️</div>
                            <div>
                                <h3>Adicionar gestores</h3>
                                <p>Adicione gestores de departamento para ajudar a validar e gerir propostas.</p>
                            </div>
                        </div>
                        <div className="action-card" onClick={() => setIsOverlayVisible(true)}>
                            <div className="icon">🎓</div>
                            <div>
                                <h3>Adicionar estudantes</h3>
                                <p>Crie novos perfis para estudantes e ex-estudantes, dando-lhes acesso à plataforma.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Renderização condicional do Overlay */}
            {isOverlayVisible && (
                <AddStudentOverlay
                    onClose={() => setIsOverlayVisible(false)}
                    onSubmit={handleAddStudent}
                />
            )}
        </div>
    );
}

export default AdminDashboard;