// src/components/AddStudentOverlay.js

import React, { useState } from 'react';
import '../styles/Dashboard.css'; // Usamos o mesmo CSS para o estilo do overlay

function AddStudentOverlay({ onClose, onSubmit }) {
    // Estado para guardar os dados do formulário
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        course: '',
        graduationYear: '',
    });

    // Estado para verificar se o utilizador escreveu algo
    const [isDirty, setIsDirty] = useState(false);

    // Função para atualizar o estado do formulário e marcar como "sujo"
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        setIsDirty(true);
    };

    // Função para lidar com a submissão
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validação simples (pode ser melhorada)
        if (!formData.fullName || !formData.email || !formData.password) {
            alert('Por favor, preencha o nome, email e password.');
            return;
        }
        onSubmit(formData);
    };

    // Função para lidar com o fecho do overlay
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
        // O fundo do overlay. Ao clicar aqui, tenta fechar.
        <div className="overlay-backdrop" onClick={handleClose}>
            {/* O conteúdo do formulário. Clicar aqui não fecha o overlay. */}
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <h2>Adicionar Novo Aluno</h2>
                <p>Preencha os detalhes abaixo para criar um novo perfil de estudante.</p>
                
                <form onSubmit={handleSubmit} className="overlay-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Nome Completo</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Institucional</label>
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
                        <label htmlFor="password">Password Temporária</label>
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
                        <label htmlFor="course">Curso</label>
                        <input
                            type="text"
                            id="course"
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="graduationYear">Ano de (previsão de) Conclusão</label>
                        <input
                            type="number"
                            id="graduationYear"
                            name="graduationYear"
                            value={formData.graduationYear}
                            onChange={handleChange}
                            placeholder="Ex: 2025"
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Cancelar</button>
                        <button type="submit" className="btn-submit">Adicionar Aluno</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddStudentOverlay;