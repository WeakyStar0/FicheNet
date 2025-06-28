// src/Components/AddCompanyOverlay.js

import React, { useState } from 'react';
import '../styles/Dashboard.css';

function AddCompanyOverlay({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        description: '',
        websiteUrl: '',
    });
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setIsDirty(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.companyName || !formData.email || !formData.password) {
            alert('Por favor, preencha o nome da empresa, email e password.');
            return;
        }
        onSubmit(formData);
    };

    const handleClose = () => {
        if (isDirty) {
            if (window.confirm('Tem alterações não guardadas. Deseja mesmo sair?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="overlay-backdrop" onClick={handleClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <h2>Adicionar Nova Empresa</h2>
                <p>Crie um novo perfil para uma empresa parceira.</p>
                
                <form onSubmit={handleSubmit} className="overlay-form">
                    <div className="form-group">
                        <label htmlFor="companyName">Nome da Empresa</label>
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email de Contacto (para login)</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                     <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Descrição da Empresa</label>
<textarea
    id="description"
    name="description"
    rows="4"
    className="textarea-description"
    value={formData.description}
    onChange={handleChange}
/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="websiteUrl">Website (Opcional)</label>
                        <input
                            type="url"
                            id="websiteUrl"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleChange}
                            placeholder="https://www.exemplo.com"
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Cancelar</button>
                        <button type="submit" className="btn-submit">Adicionar Empresa</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCompanyOverlay;