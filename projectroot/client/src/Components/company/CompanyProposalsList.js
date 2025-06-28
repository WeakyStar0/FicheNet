// src/Components/company/CompanyProposalsList.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const CompanyProposalsList = () => {
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchProposals = async () => {
            setIsLoading(true);
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
            <p>As suas propostas ficam pendentes de validação por um gestor da ESTGV.</p>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {proposals.length > 0 ? proposals.map(prop => (
                        <tr key={prop.id}>
                            <td>{prop.title}</td>
                            <td>{prop.proposal_type}</td>
                            <td>
                                <span className={`status-badge ${prop.status}`}>{prop.status.replace(/_/g, ' ')}</span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="3">Ainda não submeteu nenhuma proposta.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CompanyProposalsList;