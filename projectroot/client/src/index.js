// src/index.js (COMPLETO E ATUALIZADO)

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';

// Importação das suas páginas e componentes
import { Home } from './Pages/Home.js';
import ProfilePage from './Pages/Perfil.js';
import AdminDashboard from './Pages/Dashboard.js';
import MainNavbar from './Components/MainNavbar.js';
import ProtectedRoute from './Components/ProtectedRoute.js';

// Placeholders para os outros dashboards
const StudentDashboard = () => <div><h1>Dashboard do Estudante</h1></div>;
const CompanyDashboard = () => <div><h1>Dashboard da Empresa</h1></div>;
const ManagerDashboard = () => <div><h1>Dashboard do Gestor</h1></div>;

const AppLayout = () => {
    const location = useLocation();
    const showMainNavbar = location.pathname !== '/';

    return (
        <AuthProvider>
            {showMainNavbar && <MainNavbar />}
            <main>
                <Outlet />
            </main>
        </AuthProvider>
    );
};

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      // 2. Proteger as rotas
      {
        path: '/perfil',
        // Qualquer utilizador logado pode ver o seu perfil. Não precisa de 'allowedRoles'.
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: '/dashboard/admin',
        // Apenas utilizadores com a role 'admin' podem ver esta página.
        element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/student',
        // Apenas utilizadores com a role 'student' podem ver esta página.
        element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/company',
        // Apenas utilizadores com a role 'company' podem ver esta página.
        element: <ProtectedRoute allowedRoles={['company']}><CompanyDashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/manager',
        // Apenas utilizadores com a role 'manager' podem ver esta página.
        element: <ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>,
      },
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();