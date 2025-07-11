// src/Components/company/AddCompanyProposalForm.js

import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Importar o componente da biblioteca
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';
import '../../styles/CustomSelect.css'; // Não se esqueça de criar e estilizar

const AddCompanyProposalForm = ({ onProposalAdded }) => {
    // Estado inicial completo com todos os campos da tabela 'proposals'
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
    
    // Estados para guardar as opções formatadas para a biblioteca react-select
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [skillOptions, setSkillOptions] = useState([]);
    
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                // Fazer os pedidos para a API em paralelo
                const [deptRes, skillsRes] = await Promise.all([
                    fetch('/api/departments', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/skills', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const departmentsData = await deptRes.json();
                const allSkillsData = await skillsRes.json();

                // Formatar os dados para o formato que a react-select espera: { value: '...', label: '...' }
                setDepartmentOptions(departmentsData.map(d => ({ value: d.id, label: d.name })));
                setSkillOptions(allSkillsData.map(s => ({ value: s.id, label: `${s.name} (${s.type})` })));
            } catch (error) {
                console.error("Failed to fetch initial data for the form:", error);
            }
        };
        fetchData();
    }, [token]);

    // Função genérica para lidar com a mudança em inputs de texto, data, e select simples
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Função para lidar com a seleção múltipla de Departamentos
    const handleDepartmentsChange = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
        setFormData(prev => ({ ...prev, targetDepartmentIds: selectedIds }));
    };

    // Função para lidar com a seleção múltipla de Competências
    const handleSkillsChange = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
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
            if (!response.ok) throw new Error((await response.json()).error || "Erro desconhecido");
            alert('Proposta submetida com sucesso! Ficará pendente de validação.');
            onProposalAdded(); // Chama a função para mudar de vista no dashboard
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    return (
        <div className="form-container">
            <h2>Submeter Nova Proposta</h2>
            <form onSubmit={handleSubmit} className="overlay-form">
                
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
                    <label>Departamentos Alvo</label>
                    <Select
                        isMulti
                        name="departments"
                        options={departmentOptions}
                        className="custom-react-select-container"
                        classNamePrefix="custom-react-select"
                        placeholder="Selecione um ou mais departamentos..."
                        onChange={handleDepartmentsChange}
                        noOptionsMessage={() => "Nenhum departamento encontrado"}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Competências</label>
                    <Select
                        isMulti
                        isSearchable
                        name="skills"
                        options={skillOptions}
                        className="custom-react-select-container"
                        classNamePrefix="custom-react-select"
                        placeholder="Pesquise e selecione competências..."
                        onChange={handleSkillsChange}
                        noOptionsMessage={() => "Nenhuma competência encontrada"}
                    />
                </div>

                <div className="form-group-grid">
                    <div className="form-group">
                        <label>Local de Trabalho</label>
                        <input type="text" name="workLocation" value={formData.workLocation} onChange={handleChange} placeholder="Ex: Presencial, Remoto" />
                    </div>
                    <div className="form-group">
                        <label>Tipo de Contrato</label>
                        <input type="text" name="contractType" value={formData.contractType} onChange={handleChange} placeholder="Ex: Full-time, Estágio Curricular" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Data Limite para Candidaturas</label>
                    <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} />
                </div>
                
                <h3 className="form-section-title">Contacto para Entrevista</h3>
                <div className="form-group-grid">
                    <div className="form-group">
                        <label>Nome do Contacto</label>
                        <input type="text" name="interviewContactName" value={formData.interviewContactName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Email do Contacto</label>
                        <input type="email" name="interviewContactEmail" value={formData.interviewContactEmail} onChange={handleChange} required />
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