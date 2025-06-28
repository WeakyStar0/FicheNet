// src/Components/manager/ProposalValidationList.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProposalDetailsOverlay from './ProposalDetailsOverlay';
import '../../styles/Dashboard.css';

const ProposalValidationList = () => {
    const [pendingProposals, setPendingProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    const fetchPendingProposals = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/manager/proposals/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar propostas pendentes.');
            const data = await response.json();
            setPendingProposals(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProposals();
    }, [token]);

    const handleUpdateStatus = async (proposalId, newStatus) => {
        try {
            const response = await fetch(`/api/proposals/${proposalId}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus })
            });
            if (!response.ok) throw new Error((await response.json()).error);
            alert(`Proposta ${newStatus === 'active' ? 'aceite' : 'recusada'} com sucesso!`);
            setSelectedProposal(null); // Fecha o overlay
            fetchPendingProposals(); // Atualiza a lista
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    if (isLoading) return <p>A carregar propostas para validação...</p>;

    return (
        <div className="list-view-container">
            <h2>Propostas Pendentes de Validação</h2>
            <p>Estas são as propostas submetidas por empresas para o seu departamento.</p>
            <table className="data-table clickable-rows">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Empresa</th>
                        <th>Data de Submissão</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingProposals.length > 0 ? pendingProposals.map(prop => (
                        <tr key={prop.id} onClick={() => setSelectedProposal(prop)}>
                            <td>{prop.title}</td>
                            <td>{prop.company_name}</td>
                            <td>{new Date(prop.created_at).toLocaleDateString()}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="3">Não há propostas pendentes de validação.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedProposal && (
                <ProposalDetailsOverlay
                    proposal={selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
};

export default ProposalValidationList;