// src/Components/AddManagerOverlay.js

import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

function AddManagerOverlay({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        departmentId: '', // Campo para o ID do departamento selecionado
    });
    // Estado para guardar a lista de departamentos vinda da API
    const [departments, setDepartments] = useState([]);
    const [isDirty, setIsDirty] = useState(false);

    // Este useEffect corre uma vez quando o componente é montado
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('/api/departments');
                if (!response.ok) {
                    throw new Error('Falha ao buscar departamentos');
                }
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error(error);
                alert('Não foi possível carregar a lista de departamentos.');
            }
        };

        fetchDepartments();
    }, []); // O array vazio [] garante que isto só corre uma vez

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setIsDirty(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.password || !formData.departmentId) {
            alert('Por favor, preencha todos os campos, incluindo o departamento.');
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
                <h2>Adicionar Novo Gestor</h2>
                <p>Crie um perfil para um gestor de departamento.</p>
                
                <form onSubmit={handleSubmit} className="overlay-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Nome Completo</label>
                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                     <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="departmentId">Departamento</label>
                        <select
                            id="departmentId"
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Selecione um departamento...</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Cancelar</button>
                        <button type="submit" className="btn-submit">Adicionar Gestor</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddManagerOverlay;