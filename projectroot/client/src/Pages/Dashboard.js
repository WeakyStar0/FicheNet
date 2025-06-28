// src/components/AdminDashboard.js

import React, { useState } from 'react';
import AddStudentOverlay from '../Components/AddStudentOverlay.js';
import AddAdminOverlay from '../Components/AddAdminOverlay.js';
import AddCompanyOverlay from '../Components/AddCompanyOverlay.js';
import AddManagerOverlay from '../Components/AddManagerOverlay.js'; // 1. Importar o overlay de gestor
import '../styles/Dashboard.css';

function AdminDashboard() {
    // 2. Adicionar o estado para o novo overlay
    const [isStudentOverlayVisible, setIsStudentOverlayVisible] = useState(false);
    const [isAdminOverlayVisible, setIsAdminOverlayVisible] = useState(false);
    const [isCompanyOverlayVisible, setIsCompanyOverlayVisible] = useState(false);
    const [isManagerOverlayVisible, setIsManagerOverlayVisible] = useState(false);

    // Função para adicionar ALUNOS
    const handleAddStudent = async (studentData) => {
        console.log("A enviar dados de aluno:", studentData);
        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao adicionar aluno.');
            }
            alert('Aluno adicionado com sucesso!');
            setIsStudentOverlayVisible(false);
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    // Função para adicionar ADMINS
    const handleAddAdmin = async (adminData) => {
        console.log("A enviar dados de admin:", adminData);
        try {
            const response = await fetch('/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adminData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao adicionar administrador.');
            }
            alert('Administrador adicionado com sucesso!');
            setIsAdminOverlayVisible(false);
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    // Função para adicionar EMPRESAS
    const handleAddCompany = async (companyData) => {
        console.log("A enviar dados de empresa:", companyData);
        try {
            const response = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(companyData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao adicionar empresa.');
            }
            alert('Empresa adicionada com sucesso!');
            setIsCompanyOverlayVisible(false);
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };
    
    // 3. Nova função para adicionar GESTORES
    const handleAddManager = async (managerData) => {
        console.log("A enviar dados de gestor:", managerData);
        try {
            const response = await fetch('/api/managers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(managerData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao adicionar gestor.');
            }
            alert('Gestor adicionado com sucesso!');
            setIsManagerOverlayVisible(false);
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };


    return (
        <div className="dashboard-container">
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

            <main className="main">
                <div className="welcome">
                    <h1>Bem-vindo ao Dashboard ESTGV</h1>
                    <p className="email">Estgv@estgv.ipv.pt</p>

                    <div className="actions">
                        <div className="action-card" onClick={() => setIsAdminOverlayVisible(true)}>
                            <div className="icon">👤</div>
                            <div>
                                <h3>Adicionar um admin</h3>
                                <p>Crie utilizadores com permissões de administrador.</p>
                            </div>
                        </div>
                        <div className="action-card" onClick={() => setIsCompanyOverlayVisible(true)}>
                            <div className="icon">🏢</div>
                            <div>
                                <h3>Adicionar Empresa</h3>
                                <p>Registe novas empresas para que possam submeter propostas.</p>
                            </div>
                        </div>
                        <div className="action-card" onClick={() => setIsStudentOverlayVisible(true)}>
                            <div className="icon">🎓</div>
                            <div>
                                <h3>Adicionar estudantes</h3>
                                <p>Crie perfis para estudantes e ex-estudantes.</p>
                            </div>
                        </div>
                         {/* 4. Adicionar o onClick para abrir o overlay de gestor */}
                         <div className="action-card" onClick={() => setIsManagerOverlayVisible(true)}>
                            <div className="icon">🏛️</div>
                            <div>
                                <h3>Adicionar gestores</h3>
                                <p>Adicione gestores de departamento para validar propostas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 5. Renderização condicional para TODOS os quatro overlays */}
            {isStudentOverlayVisible && (
                <AddStudentOverlay onClose={() => setIsStudentOverlayVisible(false)} onSubmit={handleAddStudent} />
            )}
            {isAdminOverlayVisible && (
                <AddAdminOverlay onClose={() => setIsAdminOverlayVisible(false)} onSubmit={handleAddAdmin} />
            )}
            {isCompanyOverlayVisible && (
                <AddCompanyOverlay onClose={() => setIsCompanyOverlayVisible(false)} onSubmit={handleAddCompany} />
            )}
            {isManagerOverlayVisible && (
                <AddManagerOverlay onClose={() => setIsManagerOverlayVisible(false)} onSubmit={handleAddManager} />
            )}
        </div>
    );
}

export default AdminDashboard;