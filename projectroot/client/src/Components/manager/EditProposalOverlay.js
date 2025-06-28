// src/Components/manager/EditProposalOverlay.js

import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

const EditProposalOverlay = ({ proposal, onClose, onSave }) => {
    const [formData, setFormData] = useState(proposal);

    useEffect(() => {
        setFormData(proposal); // Atualiza o formulário se a proposta mudar
    }, [proposal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!proposal) return null;

    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-content large" onClick={(e) => e.stopPropagation()}>
                <h2>Editar Proposta: {proposal.title}</h2>
                <form onSubmit={handleSaveChanges} className="overlay-form">
                    <div className="form-group">
                        <label>Título</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="6" />
                    </div>
                    <div className="form-group">
                        <label>Local de Trabalho</label>
                        <input type="text" name="workLocation" value={formData.workLocation} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Tipo de Contrato</label>
                        <input type="text" name="contractType" value={formData.contractType} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Estado</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="pending_validation">Pendente Validação</option>
                            <option value="active">Ativa</option>
                            <option value="inactive">Inativa</option>
                            <option value="expired">Expirada</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-success">Guardar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProposalOverlay;