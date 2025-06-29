// src/Pages/ProposalFeedPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProposalCard from '../Components/student/ProposalCard';
import ProposalDetailOverlay from '../Components/student/ProposalDetailOverlay';
import RecommendedProposals from '../Components/student/RecommendedProposals';

import '../styles/ProposalFeed.css';

const ProposalFeedPage = () => {
    const [proposals, setProposals] = useState([]);
    const [filteredProposals, setFilteredProposals] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const { token } = useAuth();

    // Estados dos filtros
    const [searchCompany, setSearchCompany] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propResponse, skillsResponse, recResponse] = await Promise.all([
                    fetch('/api/proposals', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/skills', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/proposals/recommended', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                // Verificar se todos os pedidos foram bem-sucedidos
                if (!propResponse.ok || !skillsResponse.ok || !recResponse.ok) {
                    throw new Error("Falha ao buscar dados da página.");
                }

                // Extrair o JSON de cada resposta
                const propData = await propResponse.json();
                const skillsData = await skillsResponse.json();
                const recData = await recResponse.json();

                // Atualizar todos os estados
                setProposals(propData);
                setFilteredProposals(propData);
                setAllSkills(skillsData);
                setRecommendations(recData);


            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token]);

    useEffect(() => {
        let result = proposals;
        if (searchCompany) result = result.filter(p => p.company_name.toLowerCase().includes(searchCompany.toLowerCase()));
        if (selectedType) result = result.filter(p => p.proposal_type === selectedType);
        if (selectedSkill) result = result.filter(p => p.skills.some(s => s.id === parseInt(selectedSkill)));
        setFilteredProposals(result);
    }, [searchCompany, selectedType, selectedSkill, proposals]);

    const handleShowInterest = async (proposalId) => {
        try {
            const response = await fetch(`/api/proposals/${proposalId}/match`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            alert(data.message);
            return true; // Indica sucesso
        } catch (error) {
            alert(`Erro: ${error.message}`);
            return false; // Indica falha
        }
    };

    return (
        <div className="proposal-feed-page">
            <h1>Propostas Disponíveis</h1>

            {recommendations.length > 0 && (
                <RecommendedProposals
                    proposals={recommendations}
                    onViewDetails={setSelectedProposal}
                />
            )}

            <div className="filter-bar">
                <input type="text" placeholder="Pesquisar por empresa..." onChange={e => setSearchCompany(e.target.value)} />
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                    <option value="">Todos os Tipos</option>
                    <option value="emprego">Emprego</option>
                    <option value="estagio">Estágio</option>
                    <option value="estagio_profissional">Estágio Profissional</option>
                    <option value="projeto">Projeto</option>
                    <option value="outro">Outro</option>
                </select>
                <select onChange={e => setSelectedSkill(e.target.value)}>
                    <option value="">Competência</option>
                    {allSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            {isLoading ? <p>A carregar...</p> : (
                <div className="proposal-list">
                    {filteredProposals.map(p => (
                        <ProposalCard key={p.id} proposal={p} onViewDetails={setSelectedProposal} />
                    ))}
                </div>
            )}
            {selectedProposal && (
                <ProposalDetailOverlay
                    proposal={selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    onShowInterest={handleShowInterest}
                    isMatchView={false} // Importante: diz ao overlay para mostrar "Mostrar Interesse"
                />
            )}
        </div>
    );
};

export default ProposalFeedPage;