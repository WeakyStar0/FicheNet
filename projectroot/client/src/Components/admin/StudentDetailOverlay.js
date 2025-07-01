// src/Components/admin/StudentDetailOverlay.js

import React from 'react';
import '../../styles/Dashboard.css'; // Reutilizamos estilos
import '../../styles/ProposalFeed.css'; // Reutilizamos estilos das tags

const StudentDetailOverlay = ({ student, onClose }) => {
    if (!student) return null;

    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-content large" onClick={(e) => e.stopPropagation()}>
                <h2 className="proposal-title-overlay">{student.full_name}</h2>
                <p className="company-name-overlay">{student.email}</p>

                <div className="proposal-details-grid overlay">
                    <div><strong>Curso:</strong> <span className="detail-value">{student.course || 'N/A'}</span></div>
                    <div><strong>Ano de Conclusão:</strong> <span className="detail-value">{student.graduation_year || 'N/A'}</span></div>
                </div>
                
                <div className="proposal-details-grid overlay" style={{ borderTop: 0 }}>
                    <div><strong>Email Institucional:</strong> <span className="detail-value">{student.institutional_email || 'N/A'}</span></div>
                    <div><strong>Email Pessoal:</strong> <span className="detail-value">{student.personal_email || 'N/A'}</span></div>
                </div>

                <div className="proposal-details-section">
                    <h4>Sobre Mim</h4>
                    <p>{student.aboutme || 'O estudante ainda não escreveu nada sobre si.'}</p>
                </div>
                
                <div className="proposal-details-section">
                    <h4>Competências</h4>
                    <div className="profile-skills-list">
                        {student.skills && student.skills.length > 0 ? student.skills.map(skill => (
                            <span key={skill.id} className="profile-skill-tag">{skill.name}</span>
                        )) : <p>Nenhuma competência adicionada.</p>}
                    </div>
                </div>

                {student.wants_to_be_removed && (
                    <div className="proposal-details-section contact">
                        <h4>Atenção</h4>
                        <p>Este utilizador solicitou a remoção da sua conta da plataforma.</p>
                    </div>
                )}
                
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailOverlay;