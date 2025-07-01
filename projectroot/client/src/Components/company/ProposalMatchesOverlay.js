// src/Components/company/ProposalMatchesOverlay.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentTooltip from './StudentTooltip';
import '../../styles/Dashboard.css';

const ProposalMatchesOverlay = ({ proposal, onClose }) => {
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tooltipStudent, setTooltipStudent] = useState(null);
    const { token } = useAuth();
    
    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch(`/api/proposals/${proposal.id}/matches`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error((await response.json()).error);
                setMatches(await response.json());
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMatches();
    }, [proposal.id, token]);
    
    const handleAcceptStudent = async (studentId, proposalId) => {
        if (window.confirm('Tem a certeza que deseja aceitar este candidato? Ele será notificado.')) {
            try {
                const response = await fetch(`/api/proposals/${proposalId}/matches/${studentId}/accept`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error((await response.json()).error);
                alert('Estudante aceite com sucesso!');
                // Atualiza a lista localmente para mostrar o novo estado
                setMatches(prevMatches => prevMatches.map(m => m.id === studentId ? { ...m, is_notified: true } : m));
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        }
    };
    
    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-content large" onClick={(e) => e.stopPropagation()}>
                <h2>Interessados em: {proposal.title}</h2>
                <div className="list-view-container compact">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome do Estudante</th>
                                <th>Estado</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <tr><td colSpan="3">A carregar...</td></tr>
                            : matches.length > 0 ? matches.map(student => (
                                <tr key={student.id}>
                                    <td 
                                        onMouseEnter={() => setTooltipStudent(student)}
                                        onMouseLeave={() => setTooltipStudent(null)}
                                        style={{ position: 'relative' }}
                                    >
                                        {student.full_name}
                                        {tooltipStudent && tooltipStudent.id === student.id && (
                                            <StudentTooltip student={student} />
                                        )}
                                    </td>
                                    <td>
                                        {student.is_notified ?
                                            <span className="status-badge success">Aceite</span> :
                                            <span className="status-badge">Interessado</span>
                                        }
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-success-small" 
                                            onClick={() => handleAcceptStudent(student.id, proposal.id)}
                                            disabled={student.is_notified}
                                        >
                                            {student.is_notified ? 'Aceite' : 'Aceitar'}
                                        </button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="3">Nenhum estudante demonstrou interesse ainda.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default ProposalMatchesOverlay;