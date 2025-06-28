// src/Components/company/AddCompanyProposalForm.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const AddCompanyProposalForm = ({ onProposalAdded }) => {
    // 1. Estado inicial completo com todos os campos da tabela 'proposals'
    const [formData, setFormData] = useState({
        title: '',
        proposalType: 'emprego',
        description: '',
        workLocation: '',
        applicationDeadline: '',
        contractType: '',
        interviewContactName: '',
        interviewContactEmail: '',
        targetDepartmentIds: [],
        skillIds: []
    });
    const [departments, setDepartments] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const deptRes = await fetch('/api/departments', { headers: { 'Authorization': `Bearer ${token}` } });
                setDepartments(await deptRes.json());
                const skillRes = await fetch('/api/skills', { headers: { 'Authorization': `Bearer ${token}` } });
                setAllSkills(await skillRes.json());
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };
        fetchData();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleMultiSelectChange = (e) => {
        const { name } = e.target;
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value).map(Number); // Converte para número
        setFormData(prevData => ({ ...prevData, [name]: selectedIds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error((await response.json()).error || "Erro desconhecido");
            alert('Proposta submetida com sucesso! Ficará pendente de validação.');
            onProposalAdded();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    return (
        <div className="form-container">
            <h2>Submeter Nova Proposta</h2>
            <form onSubmit={handleSubmit} className="overlay-form">
                
                {/* 2. Formulário JSX completo */}
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
                        <option value="outro">Outro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Descrição Detalhada</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="6" required />
                </div>

                <div className="form-group">
                    <label>Departamentos Alvo (Ctrl/Cmd para selecionar vários)</label>
                    <select
                        name="targetDepartmentIds"
                        value={formData.targetDepartmentIds}
                        onChange={handleMultiSelectChange}
                        multiple
                        required
                        size="5"
                    >
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Competências (Ctrl/Cmd para selecionar vários)</label>
                    <select
                        name="skillIds"
                        value={formData.skillIds}
                        onChange={handleMultiSelectChange}
                        multiple
                        size="8"
                    >
                        {allSkills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                    </select>
                </div>

                <div className="form-group-grid">
                    <div className="form-group">
                        <label>Local de Trabalho</label>
                        <input type="text" name="workLocation" value={formData.workLocation} onChange={handleChange} placeholder="Ex: Viseu, Remoto" />
                    </div>
                    <div className="form-group">
                        <label>Tipo de Contrato</label>
                        <input type="text" name="contractType" value={formData.contractType} onChange={handleChange} placeholder="Ex: Full-time, Part-time" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Data Limite para Candidaturas</label>
                    <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} />
                </div>
                
                <h3 className="form-section-title">Contacto para Entrevista</h3>
                <div className="form-group-grid">
                    <div className="form-group">
                        <label>Nome do Contacto (Opcional)</label>
                        <input type="text" name="interviewContactName" value={formData.interviewContactName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Email do Contacto (Opcional)</label>
                        <input type="email" name="interviewContactEmail" value={formData.interviewContactEmail} onChange={handleChange} />
                    </div>
                </div>
                
                <div className="form-actions">
                    <button type="submit" className="btn-submit">Submeter para Validação</button>
                </div>
            </form>
        </div>
    );
};

export default AddCompanyProposalForm;