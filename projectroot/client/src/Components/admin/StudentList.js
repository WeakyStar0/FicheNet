// src/Components/admin/StudentList.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentDetailOverlay from './StudentDetailOverlay'; // 1. Importar o novo componente de overlay
import '../../styles/Dashboard.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRemoval, setFilterRemoval] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();
    
    // 2. Novo estado para gerir qual estudante está selecionado para o overlay
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    // Função para buscar a lista geral de estudantes (inalterada)
    const fetchStudents = async () => {
        setIsLoading(true);
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

    useEffect(() => {
        if (token) {
            fetchStudents();
        }
    }, [token]);

    // Lógica de filtragem da lista (inalterada)
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

    // Função para apagar o estudante (inalterada)
    const handleDeleteStudent = async (studentId, studentName) => {
        if (window.confirm(`Tem a certeza que deseja apagar permanentemente a conta de ${studentName}? Esta ação não pode ser desfeita.`)) {
            try {
                const response = await fetch(`/api/admin/students/${studentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Ocorreu um erro.');
                alert(data.message);
                fetchStudents();
            } catch (error) {
                console.error("Erro ao apagar estudante:", error);
                alert(`Erro: ${error.message}`);
            }
        }
    };

    // 3. Nova função para buscar os detalhes de um estudante específico e abrir o overlay
    const handleViewDetails = async (studentId) => {
        setIsFetchingDetails(true);
        try {
            const response = await fetch(`/api/admin/students/${studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error((await response.json()).error);
            const studentDetails = await response.json();
            setSelectedStudent(studentDetails);
        } catch (error) {
            console.error("Erro ao buscar detalhes do estudante:", error);
            alert(`Erro: ${error.message}`);
        } finally {
            setIsFetchingDetails(false);
        }
    };

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
            
            <table className="data-table clickable-rows">
                <thead>
                    <tr>
                        <th>Nome Completo</th>
                        <th>Email</th>
                        <th>Curso</th>
                        <th>Estado</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.length > 0 ? filteredStudents.map(student => (
                        <tr key={student.id} onClick={() => handleViewDetails(student.id)} className={student.wants_to_be_removed ? 'removal-request' : ''}>
                            <td>{student.full_name}</td>
                            <td>{student.email}</td>
                            <td>{student.course || 'N/A'}</td>
                            <td>
                                {student.wants_to_be_removed && (
                                    <span className="status-badge danger">Remoção Pedida</span>
                                )}
                            </td>
                            <td>
                                {student.wants_to_be_removed && (
                                    <button
                                        className="btn-delete-small"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Impede que o clique no botão abra o overlay
                                            handleDeleteStudent(student.id, student.full_name);
                                        }}
                                    >
                                        Apagar Conta
                                    </button>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">Nenhum estudante encontrado com os filtros selecionados.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {isFetchingDetails && <p>A carregar detalhes...</p>}

            {selectedStudent && (
                <StudentDetailOverlay 
                    student={selectedStudent} 
                    onClose={() => setSelectedStudent(null)} 
                />
            )}
        </div>
    );
};

export default StudentList;