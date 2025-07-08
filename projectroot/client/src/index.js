// src/index.js

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
import ProposalFeedPage from './Pages/ProposalFeedPage';
import AboutUsPage from './Pages/AboutUsPage';

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
      {
        path: '/perfil',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: '/dashboard/admin',
        element: <ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/student',
        element: <ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/company',
        element: <ProtectedRoute allowedRoles={['company']}><Dashboard /></ProtectedRoute>,
      },
      {
        path: '/dashboard/manager',
        element: <ProtectedRoute allowedRoles={['manager']}><Dashboard /></ProtectedRoute>,
      },
      {
        path: '/propostas',
        element: <ProtectedRoute allowedRoles={['student']}><ProposalFeedPage /></ProtectedRoute>,
      },
            {
        path: '/sobre-nos',
        element: <AboutUsPage />,
      }
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