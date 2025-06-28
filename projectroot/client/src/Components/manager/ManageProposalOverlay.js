// src/Components/manager/ManageProposalOverlay.js

import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

const ManageProposalOverlay = ({ proposal, onClose, onUpdateStatus }) => {
    // Estado local para controlar apenas o dropdown de status
    const [newStatus, setNewStatus] = useState(proposal.status);

    // Garante que o estado local é atualizado se uma nova proposta for selecionada
    useEffect(() => {
        setNewStatus(proposal.status);
    }, [proposal]);

    if (!proposal) return null;

    const handleSave = () => {
        onUpdateStatus(proposal.id, newStatus);
    };

    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-content large" onClick={(e) => e.stopPropagation()}>
                <h2>Gerir Proposta</h2>
                <h3 className="proposal-title">{proposal.title}</h3>
                <p><strong>Empresa:</strong> {proposal.company_name}</p>

                <div className="proposal-details-grid">
                    <div><strong>Tipo:</strong> {proposal.proposal_type}</div>
                    <div><strong>Local:</strong> {proposal.work_location || 'N/A'}</div>
                    <div><strong>Contrato:</strong> {proposal.contract_type || 'N/A'}</div>
                    <div><strong>Prazo:</strong> {proposal.application_deadline ? new Date(proposal.application_deadline).toLocaleDateString() : 'N/A'}</div>
                </div>

                <div className="proposal-details-section">
                    <h4>Descrição</h4>
                    <p>{proposal.description}</p>
                </div>
                
                <div className="proposal-details-section">
                    <h4>Competências Necessárias</h4>
                    <div className="profile-skills-list">
                        {proposal.skills && proposal.skills.length > 0 ? proposal.skills.map(skill => (
                            <span key={skill.id} className="profile-skill-tag">{skill.name}</span>
                        )) : <p>Nenhuma competência especificada.</p>}
                    </div>
                </div>
                
                <div className="proposal-details-section">
                    <h4>Departamentos Alvo</h4>
                    <div className="profile-skills-list">
                        {proposal.target_departments && proposal.target_departments.length > 0 ? proposal.target_departments.map(dept => (
                            <span key={dept} className="profile-skill-tag department">{dept}</span>
                        )) : <p>Nenhum departamento alvo.</p>}
                    </div>
                </div>

                <div className="proposal-management-form">
                    <h4>Ações de Gestão</h4>
                    <div className="form-group">
                        <label>Alterar Estado da Proposta</label>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            <option value="pending_validation">Pendente Validação</option>
                            <option value="active">Ativa</option>
                            <option value="inactive">Inativa</option>
                            <option value="expired">Expirada</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Fechar</button>
                    <button type="button" className="btn-success" onClick={handleSave}>Guardar Novo Estado</button>
                </div>
            </div>
        </div>
    );
};

export default ManageProposalOverlay;