// src/Components/admin/StudentList.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css'; // Reutilizamos o CSS

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRemoval, setFilterRemoval] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('/api/admin/students', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao buscar estudantes.');
                const data = await response.json();
                setStudents(data);
                setFilteredStudents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, [token]);

    useEffect(() => {
        let result = students;
        if (searchTerm) {
            result = result.filter(student =>
                student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterRemoval) {
            result = result.filter(student => student.wants_to_be_removed);
        }
        setFilteredStudents(result);
    }, [searchTerm, filterRemoval, students]);

    if (isLoading) return <p>A carregar estudantes...</p>;

    return (
        <div className="list-view-container">
            <h2>Gestão de Estudantes</h2>
            <div className="filter-controls">
                <input
                    type="text"
                    placeholder="Pesquisar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={filterRemoval}
                        onChange={(e) => setFilterRemoval(e.target.checked)}
                    />
                    Mostrar apenas pedidos de remoção
                </label>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Nome Completo</th>
                        <th>Email</th>
                        <th>Curso</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map(student => (
                        <tr key={student.id} className={student.wants_to_be_removed ? 'removal-request' : ''}>
                            <td>{student.full_name}</td>
                            <td>{student.email}</td>
                            <td>{student.course || 'N/A'}</td>
                            <td>
                                {student.wants_to_be_removed && (
                                    <span className="status-badge danger">Remoção Pedida</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentList;