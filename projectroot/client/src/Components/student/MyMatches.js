// src/Components/student/MyMatches.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProposalCard from './ProposalCard';
import ProposalDetailOverlay from './ProposalDetailOverlay';
import '../../styles/Dashboard.css'; // Reutilizamos os estilos do Dashboard
import '../../styles/ProposalFeed.css';

const MyMatches = () => {
    const [matches, setMatches] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    // A função de buscar os interesses já retorna todos os dados necessários
    const fetchMatches = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/students/me/matches', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar interesses.');
            setMatches(await response.json());
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [token]);

    const handleRemoveInterest = async (proposalId) => {
        try {
            const response = await fetch(`/api/proposals/${proposalId}/match`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            alert(data.message);
            setSelectedProposal(null);
            fetchMatches(); // Atualiza a lista
            return true;
        } catch (error) {
            alert(`Erro: ${error.message}`);
            return false;
        }
    };

    if (isLoading) return <p>A carregar os seus interesses...</p>;

    return (
        <div className="list-view-container">
            <h2>Propostas com Interesse</h2>
            <p>Aqui estão as propostas nas quais você demonstrou interesse e o estado do seu processo.</p>
            
            <table className="data-table clickable-rows">
                <thead>
                    <tr>
                        <th>Título da Proposta</th>
                        <th>Empresa</th>
                        <th>Tipo</th>
                        <th>Estado</th> {/* 1. NOVA COLUNA */}
                    </tr>
                </thead>
                <tbody>
                    {matches.length > 0 ? matches.map(prop => (
                        <tr key={prop.id} onClick={() => setSelectedProposal(prop)}>
                            <td>{prop.title}</td>
                            <td>{prop.company_name}</td>
                            <td>{prop.proposal_type}</td>
                            <td>
                                {prop.is_notified ? (
                                    <span className="status-badge success">Aceite</span>
                                ) : (
                                    <span className="status-badge pending_validation">Sob Interesse</span>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4">Você ainda não demonstrou interesse em nenhuma proposta.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedProposal && (
                <ProposalDetailOverlay
                    proposal={selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    onRemoveInterest={handleRemoveInterest}
                    isMatchView={true}
                />
            )}
        </div>
    );
};

export default MyMatches;