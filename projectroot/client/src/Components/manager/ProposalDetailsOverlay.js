// src/Components/manager/ProposalDetailsOverlay.js

import React from 'react';
import '../../styles/Dashboard.css';

const ProposalDetailsOverlay = ({ proposal, onClose, onUpdateStatus }) => {
    if (!proposal) return null;

    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <h2>Detalhes da Proposta</h2>
                <h3>{proposal.title}</h3>
                <p><strong>Empresa:</strong> {proposal.company_name}</p>
                
                <div className="proposal-details-section">
                    <h4>Descrição</h4>
                    <p>{proposal.description}</p>
                </div>
                
                <div className="proposal-details-section">
                    <h4>Competências Necessárias</h4>
                    <div className="profile-skills-list">
                        {proposal.skills.length > 0 ? proposal.skills.map(skill => (
                            <span key={skill.id} className="profile-skill-tag">{skill.name}</span>
                        )) : <p>Nenhuma competência especificada.</p>}
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn-cancel" onClick={onClose}>Fechar</button>
                    <button className="btn-danger" onClick={() => onUpdateStatus(proposal.id, 'inactive')}>Recusar</button>
                    <button className="btn-success" onClick={() => onUpdateStatus(proposal.id, 'active')}>Aceitar</button>
                </div>
            </div>
        </div>
    );
};

export default ProposalDetailsOverlay;