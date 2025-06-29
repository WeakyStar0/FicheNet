// src/Components/student/MyMatches.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProposalCard from './ProposalCard';
import ProposalDetailOverlay from './ProposalDetailOverlay';
import '../../styles/ProposalFeed.css';

const MyMatches = () => {
    const [matches, setMatches] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

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
            setSelectedProposal(null); // Fecha o overlay
            fetchMatches(); // Atualiza a lista
            return true;
        } catch (error) {
            alert(`Erro: ${error.message}`);
            return false;
        }
    };

    if (isLoading) return <p>A carregar os seus interesses...</p>;

    return (
        <div className="proposal-feed-page">
            <h2>Propostas com Interesse</h2>
            <p>Aqui estão as propostas nas quais você demonstrou interesse.</p>
            <div className="proposal-list">
                {matches.length > 0 ? matches.map(prop => (
                    <ProposalCard key={prop.id} proposal={prop} onViewDetails={setSelectedProposal} />
                )) : (
                    <p>Você ainda não demonstrou interesse em nenhuma proposta.</p>
                )}
            </div>

            {selectedProposal && (
                <ProposalDetailOverlay
                    proposal={selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    onRemoveInterest={handleRemoveInterest} // Passa a nova função
                    isMatchView={true} // Diz ao overlay para mostrar o botão de remover
                />
            )}
        </div>
    );
};

export default MyMatches;