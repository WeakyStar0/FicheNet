// src/Components/AddAdminOverlay.js

import React, { useState } from 'react';
import '../styles/Dashboard.css';

function AddAdminOverlay({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setIsDirty(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            alert('Por favor, preencha o email e a password.');
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
                <h2>Adicionar Novo Administrador</h2>
                <p>Crie um novo perfil com permissões de administrador na plataforma.</p>

                <form onSubmit={handleSubmit} className="overlay-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
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

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Cancelar</button>
                        <button type="submit" className="btn-submit">Adicionar Admin</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddAdminOverlay;