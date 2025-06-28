// src/Components/manager/ProposalManagement.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ManageProposalOverlay from './ManageProposalOverlay'; // 1. Importar o novo overlay
import '../../styles/Dashboard.css';

const ProposalManagement = () => {
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    const fetchProposals = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/proposals/management/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar propostas.');
            setProposals(await response.json());
        } catch (error) {
            console.error(error);
            setProposals([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, [token]);

    // 2. Nova função para atualizar APENAS o status
    const handleUpdateStatus = async (proposalId, newStatus) => {
        try {
            const response = await fetch(`/api/proposals/${proposalId}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus })
            });
            if (!response.ok) throw new Error((await response.json()).error);
            alert('Estado da proposta atualizado com sucesso!');
            setSelectedProposal(null);
            fetchProposals(); // Atualiza a lista
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    if (isLoading) return <p>A carregar propostas...</p>;

    return (
        <div className="list-view-container">
            <h2>Gestão de Todas as Propostas</h2>
            <p>Veja e gira todas as propostas da plataforma.</p>
            <table className="data-table clickable-rows">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Empresa</th>
                        <th>Departamentos Alvo</th>
                        <th>Estado</th>
                        <th>Data de Submissão</th>
                    </tr>
                </thead>
                <tbody>
                    {proposals.length > 0 ? proposals.map(prop => (
                        <tr key={prop.id} onClick={() => setSelectedProposal(prop)}>
                            <td>{prop.title}</td>
                            <td>{prop.company_name}</td>
                            <td>
                                {prop.target_departments && prop.target_departments.length > 0
                                    ? prop.target_departments.join(', ')
                                    : 'Nenhum'}
                            </td>
                            <td><span className={`status-badge ${prop.status}`}>{prop.status.replace(/_/g, ' ')}</span></td>
                            <td>{new Date(prop.created_at).toLocaleDateString()}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">Nenhuma proposta encontrada na plataforma.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 3. Usar o novo overlay de gestão */}
            {selectedProposal && (
                <ManageProposalOverlay
                    proposal={selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
};

export default ProposalManagement;