// src/Components/admin/ManagerList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const ManagerList = () => {
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await fetch('/api/admin/managers', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao buscar gestores.');
                setManagers(await response.json());
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        };
        fetchManagers();
    }, [token]);

    if (isLoading) return <p>A carregar gestores...</p>;

    return (
        <div className="list-view-container">
            <h2>Gestão de Gestores de Departamento</h2>
            <table className="data-table">
                <thead>
                    <tr><th>Nome Completo</th><th>Email</th><th>Departamento</th></tr>
                </thead>
                <tbody>
                    {managers.map(manager => (
                        <tr key={manager.id}>
                            <td>{manager.full_name}</td>
                            <td>{manager.email}</td>
                            <td>{manager.department_name || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default ManagerList;