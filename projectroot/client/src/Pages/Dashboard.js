// src/Pages/Dashboard.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import { Helmet } from 'react-helmet';

// Vistas de Admin
import DashboardHome from '../Components/admin/DashboardHome';
import StudentList from '../Components/admin/StudentList';

// Vistas de Gestor
import MyProposalsList from '../Components/manager/MyProposalsList';
import AddProposalForm from '../Components/manager/AddProposalsForm'; // Atenção ao nome do ficheiro aqui
import ProposalManagement from '../Components/manager/ProposalManagement';

// Vistas de Empresa
import CompanyProposalsList from '../Components/company/CompanyProposalsList';
import AddCompanyProposalForm from '../Components/company/AddCompanyProposalForm';

// Vistas de Estudante
import MyMatches from '../Components/student/MyMatches';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('home');

    if (!user) {
        return <div className="dashboard-container"><p>A carregar utilizador...</p></div>;
    }

    const renderActiveView = () => {
        // Lógica do Admin
        if (user.role === 'admin') {
            switch (activeView) {
                case 'home': return <div><h2>Bem-vindo ao seu Dashboard, {user.email}!</h2><p>Navegue pelas secções na barra lateral.</p><br /><br /><br /><br /><DashboardHome /></div>;
                case 'students': return <StudentList />;
                default: return <DashboardHome />;
            }
        }

        // Lógica do Gestor
        if (user.role === 'manager') {
            switch (activeView) {
                case 'home': return <div><h2>Bem-vindo ao seu Dashboard, {user.email}!</h2><p>Navegue pelas secções na barra lateral.</p><br /><br /><br /><br /><MyProposalsList /></div>;
                case 'add_proposal': return <AddProposalForm onProposalAdded={() => setActiveView('home')} />;
                case 'manage_proposals': return <ProposalManagement />;
                default: return <MyProposalsList />;
            }
        }

        // Lógica da Empresa
        if (user.role === 'company') {
            switch (activeView) {
                case 'home': return <div><h2>Bem-vindo ao seu Dashboard, {user.email}!</h2><p>Navegue pelas secções na barra lateral.</p><br /><br /><br /><br /><CompanyProposalsList /></div>;
                case 'add_proposal': return <AddCompanyProposalForm onProposalAdded={() => setActiveView('home')} />;
                default: return <CompanyProposalsList />;
            }
        }

        // Lógica do Estudante
        if (user.role === 'student') {
            switch (activeView) {
                case 'home': return <div><h2>Bem-vindo ao seu Dashboard, {user.email}!</h2><p>Navegue pelas secções na barra lateral.</p></div>;
                case 'my_matches': return <MyMatches />;
                default: return <div>Página não encontrada</div>;
            }
        }

        return <p>Dashboard para {user.role} em construção.</p>;
    };

    return (
        <div className="dashboard-container">
            <Helmet>
                <title>Dashboard - ESTGV</title>
            </Helmet>
            <aside className="sidebar">
                <div className="logo-section">
                    <img src="https://imgur.com/F8aAiKi.png" alt="ESTGV Logo" className="logo" />
                    <h2>ESTGV</h2>
                    <h5>{user.email}</h5>
                    <span className="role-tag">{user.role.toUpperCase()}</span>
                </div>
                <nav className="menu">
                    {/* Menu do Admin */}
                    {user.role === 'admin' && (
                        <>
                            <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>Dashboard</button>
                            <button onClick={() => setActiveView('students')} className={activeView === 'students' ? 'active' : ''}>Estudantes</button>
                        </>
                    )}
                    {/* Menu do Gestor */}
                    {user.role === 'manager' && (
                        <>
                            <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>Minhas Propostas</button>
                            <button onClick={() => setActiveView('manage_proposals')} className={activeView === 'manage_proposals' ? 'active' : ''}>Gerir Propostas</button>
                        </>
                    )}
                    {/* Menu da Empresa */}
                    {user.role === 'company' && (
                        <>
                            <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>Minhas Propostas</button>
                            <button onClick={() => setActiveView('add_proposal')} className={activeView === 'add_proposal' ? 'active' : ''}>Adicionar Proposta</button>
                        </>
                    )}
                    {/* Menu do Estudante */}
                    {user.role === 'student' && (
                        <>
                            <button onClick={() => setActiveView('home')}>Dashboard</button>
                            <button onClick={() => setActiveView('my_matches')}>Meus Interesses</button>
                        </>
                    )}
                </nav>
            </aside>
            <main className="main-content-area">
                {renderActiveView()}
            </main>
        </div>
    );
}

export default Dashboard;