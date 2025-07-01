// src/Components/company/StudentTooltip.js

import React from 'react';
import '../../styles/Dashboard.css';

const StudentTooltip = ({ student }) => {
    return (
        <div className="student-tooltip">
            <h4>{student.full_name}</h4>
            <p><strong>Curso:</strong> {student.course || 'N/A'}</p>
            <p><strong>Conclusão:</strong> {student.graduation_year || 'N/A'}</p>
            <div className="tooltip-skills">
                <strong>Competências:</strong>
                <div className="profile-skills-list small">
                    {student.skills && student.skills.length > 0
                        ? student.skills.map(skill => <span key={skill} className="profile-skill-tag">{skill}</span>)
                        : <span>N/A</span>
                    }
                </div>
            </div>
        </div>
    );
};

export default StudentTooltip;