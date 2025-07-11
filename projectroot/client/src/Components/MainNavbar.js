// src/components/MainNavbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';
import { GrTasks, GrCopy } from 'react-icons/gr';
import { FaUser } from 'react-icons/fa';



const MainNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    const getDashboardPath = () => {
        switch (user.role) {
            case 'admin': return '/dashboard/admin';
            case 'student': return '/dashboard/student';
            case 'company': return '/dashboard/company';
            case 'manager': return '/dashboard/manager';
            default: return '/';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="main-navbar-wrapper">
            <div className="navbar-section navbar-left">
                <Link to="/" className="navbar-logo">
                    <img src="https://imgur.com/FFcLnAU.png" alt="ESTGV Logo" className="nav-logo" />
                </Link>
            </div>
            <div className="navbar-section navbar-center">
                <Link to={getDashboardPath()} className="navbar-link">
                    <GrTasks/> Dashboard
                </Link> 
                {user && user.role === 'student' && (
                    <Link to="/propostas" className="navbar-link"> <GrCopy/> Propostas</Link>
                )}
            </div>
            <div className="navbar-section navbar-right">
                <Link to="/perfil" className="navbar-link">
                    <FaUser/>
                </Link>
                <button className="navbar-logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default MainNavbar;