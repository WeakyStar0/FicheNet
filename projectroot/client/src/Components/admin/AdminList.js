// src/Components/admin/AdminList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const AdminList = () => {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await fetch('/api/admin/admins', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao buscar administradores.');
                setAdmins(await response.json());
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        };
        fetchAdmins();
    }, [token]);

    if (isLoading) return <p>A carregar administradores...</p>;

    return (
        <div className="list-view-container">
            <h2>Gestão de Administradores</h2>
            <table className="data-table">
                <thead>
                    <tr><th>Email</th><th>Data de Criação</th></tr>
                </thead>
                <tbody>
                    {admins.map(admin => (
                        <tr key={admin.id}>
                            <td>{admin.email}</td>
                            <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default AdminList;