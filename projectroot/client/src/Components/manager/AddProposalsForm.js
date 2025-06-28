// src/Components/manager/AddProposalForm.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const AddProposalForm = ({ onProposalAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        companyId: '',
        proposalType: 'emprego',
        description: '',
        workLocation: '',
        applicationDeadline: '',
        contractType: '',
        interviewContactName: '',
        interviewContactEmail: '',
        skillIds: []
    });
    const [companies, setCompanies] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            // Buscar empresas
            const compRes = await fetch('/api/companies/list', { headers: { 'Authorization': `Bearer ${token}` } });
            setCompanies(await compRes.json());
            // Buscar skills
            const skillRes = await fetch('/api/skills', { headers: { 'Authorization': `Bearer ${token}` } });
            setAllSkills(await skillRes.json());
        };
        fetchData();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillChange = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, skillIds: selectedIds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error((await response.json()).error);
            alert('Proposta adicionada com sucesso!');
            onProposalAdded(); // Chama a função para mudar de vista
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    return (
        <div className="form-container">
            <h2>Adicionar Nova Proposta</h2>
            <form onSubmit={handleSubmit} className="overlay-form">
                {/* Campos do formulário */}
                <div className="form-group">
                    <label>Empresa</label>
                    <select name="companyId" value={formData.companyId} onChange={handleChange} required>
                        <option value="" disabled>Selecione uma empresa</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Título da Proposta</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Tipo de Proposta</label>
                    <select name="proposalType" value={formData.proposalType} onChange={handleChange} required>
                        <option value="emprego">Emprego</option>
                        <option value="estagio">Estágio</option>
                        <option value="estagio_profissional">Estágio Profissional</option>
                        <option value="projeto">Projeto</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Descrição</label>
                    <textarea className="textarea-description" name="description" value={formData.description} onChange={handleChange} rows="5" required></textarea>
                </div>
                <div className="form-group">
                    <label>Competências (Ctrl/Cmd para selecionar várias)</label>
                    <select name="skillIds" value={formData.skillIds} onChange={handleSkillChange} multiple size="8">
                        {allSkills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-submit">Submeter Proposta</button>
                </div>
            </form>
        </div>
    );
};

export default AddProposalForm;