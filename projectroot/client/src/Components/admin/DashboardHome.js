// src/Components/admin/DashboardHome.js

import React, { useState } from 'react';
import AddStudentOverlay from '../AddStudentOverlay.js';
import AddAdminOverlay from '../AddAdminOverlay.js';
import AddCompanyOverlay from '../AddCompanyOverlay.js';
import AddManagerOverlay from '../AddManagerOverlay.js';
import '../../styles/Dashboard.css'; // O estilo é reutilizado

// Este componente representa a "página principal" do dashboard do admin,
// contendo as ações principais e a lógica para os overlays.
const DashboardHome = () => {
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
    
    // Função para adicionar GESTORES
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
        // Usamos um React Fragment <> pois este componente não tem o seu próprio container principal.
        <>
            <div className="welcome">
                <h1>Bem-vindo ao Dashboard ESTGV</h1>
                <p>Use as ações abaixo para gerir os utilizadores da plataforma.</p>
            </div>

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
                <div className="action-card" onClick={() => setIsManagerOverlayVisible(true)}>
                    <div className="icon">🏛️</div>
                    <div>
                        <h3>Adicionar gestores</h3>
                        <p>Adicione gestores de departamento para validar propostas.</p>
                    </div>
                </div>
            </div>

            {/* Renderização condicional para TODOS os quatro overlays */}
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
        </>
    );
}

export default DashboardHome;