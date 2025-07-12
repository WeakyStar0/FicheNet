// src/Pages/Dashboard.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import { Helmet } from 'react-helmet';
import {
    FaTachometerAlt, FaUserGraduate, FaChartBar, FaFolderOpen, FaTasks,
    FaPlusCircle, FaHeart, FaUserTie, FaBuilding, FaUserShield
} from 'react-icons/fa';

// Vistas de Admin
import DashboardHome from '../Components/admin/DashboardHome';
import StudentList from '../Components/admin/StudentList';
import AdminStats from '../Components/admin/AdminStats';
import ManagerList from '../Components/admin/ManagerList';
import CompanyList from '../Components/admin/CompanyList';
import AdminList from '../Components/admin/AdminList';

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
                case 'home': return <DashboardHome />;
                case 'students': return <StudentList />;
                case 'managers': return <ManagerList />;
                case 'companies': return <CompanyList />;
                case 'admins': return <AdminList />;
                case 'stats': return <AdminStats />;
                default: return <DashboardHome />;
            }
        }

        // Lógica do Gestor
        if (user.role === 'manager') {
            switch (activeView) {
                case 'home': return <MyProposalsList />;
                case 'add_proposal': return <AddProposalForm onProposalAdded={() => setActiveView('home')} />;
                case 'manage_proposals': return <ProposalManagement />;
                default: return <MyProposalsList />;
            }
        }

        // Lógica da Empresa
        if (user.role === 'company') {
            switch (activeView) {
                case 'home': return <CompanyProposalsList />;
                case 'add_proposal': return <AddCompanyProposalForm onProposalAdded={() => setActiveView('home')} />;
                default: return <CompanyProposalsList />;
            }
        }

        // Lógica do Estudante
        if (user.role === 'student') {
            switch (activeView) {
                case 'home': return <div className="p-4"><h2>Bem-vindo ao seu Dashboard, {user.email}!</h2><p>Navegue pelas secções na barra lateral.</p></div>;
                case 'my_matches': return <MyMatches />;
                default: return <div className="p-4">Página não encontrada</div>;
            }
        }

        return <p>Dashboard para {user.role} em construção.</p>;
    };

    return (
        <div className="dashboard-container">
            <Helmet>
                <title>Dashboard - FicheNet ESTGV</title>
            </Helmet>
            <aside className="sidebar">
                <div className="logo-section">
                    <img src="https://imgur.com/FFcLnAU.png" alt="ESTGV Logo" className="logo-dash" />
                    <h2>ESTGV</h2>
                    <h5 className="email-sidebar">{user.email}</h5>
                    <span className="role-tag">{user.role.toUpperCase()}</span>
                </div>
                <nav className="menu">
                    {/* Menu do Admin */}
                    {user.role === 'admin' && (
                        <>
                            <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>
                                <FaTachometerAlt /> Dashboard
                            </button>
                            <button onClick={() => setActiveView('students')} className={activeView === 'students' ? 'active' : ''}>
                                <FaUserGraduate /> Estudantes
                            </button>
                            <button onClick={() => setActiveView('managers')} className={activeView === 'managers' ? 'active' : ''}>
                                <FaUserTie /> Gestores
                            </button>
                            <button onClick={() => setActiveView('companies')} className={activeView === 'companies' ? 'active' : ''}>
                                <FaBuilding /> Empresas
                            </button>
                            <button onClick={() => setActiveView('admins')} className={activeView === 'admins' ? 'active' : ''}>
                                <FaUserShield /> Admins
                            </button>
                            <button onClick={() => setActiveView('stats')} className={activeView === 'stats' ? 'active' : ''}>
                                <FaChartBar /> Estatísticas
                            </button>
                        </>
                    )}

                    {/* Menu do Gestor */}
                    {user.role === 'manager' && (
                        <>
                            <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>
                                <FaFolderOpen /> Minhas Propostas
                            </button>
                            <button onClick={() => setActiveView('manage_proposals')} className={activeView === 'manage_proposals' ? 'active' : ''}>
                                <FaTasks /> Gerir Propostas
                            </button>
                        </>
                    )}

                    {/* Menu da Empresa */}
                    {user.role === 'company' && (
                        <>
                            <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>
                                <FaFolderOpen /> Minhas Propostas
                            </button>
                            <button onClick={() => setActiveView('add_proposal')} className={activeView === 'add_proposal' ? 'active' : ''}>
                                <FaPlusCircle /> Adicionar Proposta
                            </button>
                        </>
                    )}

                    {/* Menu do Estudante */}
                    {user.role === 'student' && (
                        <>
                            <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>
                                <FaTachometerAlt /> Dashboard
                            </button>
                            <button onClick={() => setActiveView('my_matches')} className={activeView === 'my_matches' ? 'active' : ''}>
                                <FaHeart /> Meus Interesses
                            </button>
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