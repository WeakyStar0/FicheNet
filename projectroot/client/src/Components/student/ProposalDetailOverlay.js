// src/components/student/ProposalDetailOverlay.js

import React, { useState } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/ProposalFeed.css';

const ProposalDetailOverlay = ({ 
    proposal, 
    onClose, 
    onShowInterest,   // Função para adicionar interesse
    onRemoveInterest, // Função para remover interesse
    isMatchView = false // Prop que diz se estamos na vista "Meus Interesses"
}) => {
    // Estado para desativar o botão durante o processamento do pedido
    const [isProcessing, setIsProcessing] = useState(false);

    if (!proposal) return null;

    const handleInterestClick = async () => {
        if (!onShowInterest) return;
        setIsProcessing(true);
        await onShowInterest(proposal.id);
        setIsProcessing(false);
    };

    const handleRemoveClick = async () => {
        if (!onRemoveInterest) return;
        setIsProcessing(true);
        await onRemoveInterest(proposal.id);
        setIsProcessing(false);
    };

    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-content large" onClick={(e) => e.stopPropagation()}>
                <h2 className="proposal-title-overlay">{proposal.title}</h2>
                <p className="company-name-overlay"><strong>Empresa:</strong> {proposal.company_name}</p>

                <div className="proposal-details-grid overlay">
                    <div><strong>Tipo de Proposta:</strong> <span className="detail-value">{proposal.proposal_type}</span></div>
                    <div><strong>Local:</strong> <span className="detail-value">{proposal.work_location || 'Não especificado'}</span></div>
                    <div><strong>Tipo de Contrato:</strong> <span className="detail-value">{proposal.contract_type || 'Não especificado'}</span></div>
                    <div><strong>Prazo para Candidaturas:</strong> <span className="detail-value">{proposal.application_deadline ? new Date(proposal.application_deadline).toLocaleDateString() : 'Não especificado'}</span></div>
                </div>

                <div className="proposal-details-section">
                    <h4>Descrição Detalhada</h4>
                    <p>{proposal.description}</p>
                </div>

                <div className="proposal-details-section">
                    <h4>Competências Necessárias</h4>
                    <div className="profile-skills-list">
                        {/* =============================== */}
                        {/* A CORREÇÃO ESTÁ NESTA LINHA     */}
                        {/* =============================== */}
                        {proposal.skills && proposal.skills.length > 0 ? proposal.skills.map(skill => (
                            <span key={skill.id} className="profile-skill-tag">{skill.name}</span>
                        )) : <p>Nenhuma competência especificada.</p>}
                    </div>
                </div>

                {(proposal.interview_contact_name || proposal.interview_contact_email) && (
                    <div className="proposal-details-section contact">
                        <h4>Contacto para Entrevista</h4>
                        {proposal.interview_contact_name && <p><strong>Nome:</strong> {proposal.interview_contact_name}</p>}
                        {proposal.interview_contact_email && <p><strong>Email:</strong> {proposal.interview_contact_email}</p>}
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Fechar</button>

                    {isMatchView ? (
                        <button type="button" className="btn-danger" onClick={handleRemoveClick} disabled={isProcessing}>
                            {isProcessing ? 'A remover...' : 'Remover Interesse'}
                        </button>
                    ) : (
                        <button type="button" className="btn-success" onClick={handleInterestClick} disabled={isProcessing}>
                            {isProcessing ? 'A registar...' : 'Mostrar Interesse'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProposalDetailOverlay;