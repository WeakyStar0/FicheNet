// src/Components/manager/MyProposalsList.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const MyProposalsList = () => {
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const response = await fetch('/api/proposals/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao buscar propostas.');
                const data = await response.json();
                setProposals(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProposals();
    }, [token]);

    if (isLoading) return <p>A carregar propostas...</p>;

    return (
        <div className="list-view-container">
            <h2>Minhas Propostas Submetidas</h2>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Empresa</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {proposals.length > 0 ? proposals.map(prop => (
                        <tr key={prop.id}>
                            <td>{prop.title}</td>
                            <td>{prop.company_name}</td>
                            <td>{prop.proposal_type}</td>
                            <td>
                                <span className={`status-badge ${prop.status}`}>{prop.status.replace('_', ' ')}</span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4">Ainda não submeteu nenhuma proposta.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MyProposalsList;