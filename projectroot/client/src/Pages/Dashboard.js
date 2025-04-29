import React from 'react';
import '../styles/Dashboard.css';

function AdminDashboard() {
    return (
        <div className="dashboard-container">
            {/* Sidebar */}
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

            {/* Main */}
            <main className="main">

                <div className="welcome">
                    <h1>Bem-vindo ao Dashboard ESTGV</h1>
                    <p className="email">Estgv@estgv.ipv.pt</p>

                    <div className="actions">
                        <div className="action-card">
                            <div className="icon">👤</div>
                            <div>
                                <h3>Adicionar um admin</h3>
                                <p>Create rich course content and coaching products for your students. When you give them a pricing plan, they’ll appear on your site!</p>
                            </div>
                        </div>
                        <div className="action-card">
                            <div className="icon">🏛️</div>
                            <div>
                                <h3>Adicionar gestores</h3>
                                <p>Create rich course content and coaching products for your students. When you give them a pricing plan, they’ll appear on your site!</p>
                            </div>
                        </div>
                        <div className="action-card">
                            <div className="icon">🎓</div>
                            <div>
                                <h3>Adicionar estudantes</h3>
                                <p>Create rich course content and coaching products for your students. When you give them a pricing plan, they’ll appear on your site!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
