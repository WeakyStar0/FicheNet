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
import Dashboard from './Pages/Dashboard.js';
import MainNavbar from './Components/MainNavbar.js';
import ProtectedRoute from './Components/ProtectedRoute.js';

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
        element: <ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/student',
        // Apenas utilizadores com a role 'student' podem ver esta página.
        element: <ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/company',
        // Apenas utilizadores com a role 'company' podem ver esta página.
        element: <ProtectedRoute allowedRoles={['company']}><Dashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/manager',
        // Apenas utilizadores com a role 'manager' podem ver esta página.
        element: <ProtectedRoute allowedRoles={['manager']}><Dashboard /></ProtectedRoute>,
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