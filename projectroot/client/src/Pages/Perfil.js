// src/Pages/Perfil.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Perfil.css'; // Certifique-se de que este CSS existe e está importado

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Estados para edição do "Sobre Mim"
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [editableAboutMe, setEditableAboutMe] = useState('');

    // Estados para edição de Competências (para estudantes)
    const [allSkills, setAllSkills] = useState([]);
    const [mySkills, setMySkills] = useState([]);
    const [isEditingSkills, setIsEditingSkills] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const profileRes = await fetch('/api/users/me/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!profileRes.ok) {
                    // Se o token for inválido, o servidor retorna 403, limpamos e voltamos para a home
                    if (profileRes.status === 403 || profileRes.status === 401) {
                         throw new Error('Sessão inválida. Por favor, faça login novamente.');
                    }
                    throw new Error('Falha ao buscar perfil.');
                }
                
                const profileData = await profileRes.json();
                setProfile(profileData);
                // Define o texto editável inicial para "Sobre Mim"
                setEditableAboutMe(profileData.aboutme || profileData.description || '');

                // Se o utilizador for um estudante, busca as competências
                if (profileData.role === 'student') {
                    setMySkills(profileData.skills);
                    const skillsRes = await fetch('/api/skills', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!skillsRes.ok) throw new Error('Falha ao buscar competências.');
                    setAllSkills(await skillsRes.json());
                }

            } catch (error) {
                console.error(error);
                localStorage.removeItem('token'); // Limpa o token inválido
                localStorage.removeItem('user');
                navigate('/'); // Redireciona para a página de login
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    // --- Funções para "Sobre Mim" ---
    const handleSaveAboutMe = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/users/me/aboutme', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ aboutme: editableAboutMe })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Falha ao guardar "Sobre Mim".');
            
            const updatedData = await response.json();
            setProfile(prevProfile => ({ ...prevProfile, aboutme: updatedData.aboutme }));
            setIsEditingAboutMe(false);
            alert('"Sobre Mim" atualizado com sucesso!');
        } catch (error) {
            alert(error.message);
        }
    };

    // --- Funções para Competências ---
    const handleAddSkill = (skillId) => {
        const skillToAdd = allSkills.find(s => s.id === parseInt(skillId));
        if (skillToAdd && !mySkills.find(s => s.id === skillToAdd.id)) {
            setMySkills([...mySkills, skillToAdd]);
        }
    };

    const handleRemoveSkill = (skillId) => {
        setMySkills(mySkills.filter(s => s.id !== skillId));
    };

    const handleSaveSkills = async () => {
        const token = localStorage.getItem('token');
        const skillIds = mySkills.map(s => s.id);
        try {
            const response = await fetch('/api/students/me/skills', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ skillIds })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Falha ao guardar alterações.');
            
            alert('Competências guardadas com sucesso!');
            setIsEditingSkills(false);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    // --- Função para Pedido de Remoção ---
    const handleRequestRemoval = async () => {
        if (window.confirm('Tem a certeza que deseja solicitar a remoção da sua conta? Esta ação será enviada para aprovação.')) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('/api/students/me/request-removal', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error((await response.json()).error);
                
                // Atualiza o estado local para desativar o botão imediatamente
                setProfile(prevProfile => ({ ...prevProfile, wants_to_be_removed: true }));
                alert('Pedido de remoção enviado com sucesso.');
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        }
    };
    
    if (isLoading) return <div className="profile-page-wrapper"><h1>A carregar perfil...</h1></div>;
    if (!profile) return <div className="profile-page-wrapper"><h1>Não foi possível carregar o perfil. Por favor, tente fazer login novamente.</h1></div>;

    const availableSkillsToAdd = allSkills.filter(skill => !mySkills.some(mySkill => mySkill.id === skill.id));

    return (
        <div className="profile-page-wrapper">
            <h1>O Meu Perfil</h1>
            <div className="profile-main-card">
                <h2>{profile.full_name || profile.company_name || 'Administrador'}</h2>
                <p><strong>Email:</strong> {profile.email}</p>

                <div className="profile-aboutme-section">
                    <h3>Sobre Mim</h3>
                    {!isEditingAboutMe ? (
                        <>
                            <p>{editableAboutMe || 'Nenhuma informação disponível. Clique em editar para adicionar algo sobre si.'}</p>
                            <button className="profile-button-edit" onClick={() => setIsEditingAboutMe(true)}>Editar</button>
                        </>
                    ) : (
                        <>
                            <textarea
                                className="profile-aboutme-textarea"
                                value={editableAboutMe}
                                onChange={(e) => setEditableAboutMe(e.target.value)}
                                rows="5"
                            />
                            <div className="profile-action-buttons">
                                <button className="profile-button profile-button-primary" onClick={handleSaveAboutMe}>Guardar</button>
                                <button className="profile-button profile-button-secondary" onClick={() => setIsEditingAboutMe(false)}>Cancelar</button>
                            </div>
                        </>
                    )}
                </div>

                {profile.role === 'company' && <p><strong>Website:</strong> <a href={profile.website_url} target="_blank" rel="noopener noreferrer">{profile.website_url}</a></p>}
                {profile.role === 'manager' && <p><strong>Departamento:</strong> {profile.department_name}</p>}

                {profile.role === 'student' && (
                    <>
                        <div className="profile-skills-section">
                            <h3>As Minhas Competências</h3>
                            {!isEditingSkills ? (
                                <>
                                    <div className="profile-skills-list">
                                        {mySkills.length > 0 ? mySkills.map(skill => (
                                            <span key={skill.id} className="profile-skill-tag">{skill.name}</span>
                                        )) : <p>Ainda não adicionou competências.</p>}
                                    </div>
                                    <div className="profile-action-buttons">
                                        <button className="profile-button profile-button-primary" onClick={() => setIsEditingSkills(true)}>Editar Competências</button>
                                    </div>
                                </>
                            ) : (
                                <div className="profile-skills-editor">
                                    <div className="profile-skills-list">
                                        {mySkills.map(skill => (
                                            <span key={skill.id} className="profile-skill-tag-editing">
                                                {skill.name}
                                                <button onClick={() => handleRemoveSkill(skill.id)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="profile-add-skill-form">
                                        <select onChange={(e) => handleAddSkill(e.target.value)} defaultValue="">
                                            <option value="" disabled>Adicionar competência...</option>
                                            {availableSkillsToAdd.map(skill => (
                                                <option key={skill.id} value={skill.id}>{skill.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="profile-action-buttons">
                                        <button className="profile-button profile-button-primary" onClick={handleSaveSkills}>Guardar Alterações</button>
                                        <button className="profile-button profile-button-secondary" onClick={() => {
                                            setMySkills(profile.skills);
                                            setIsEditingSkills(false);
                                        }}>Cancelar</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="profile-danger-zone">
                            <h3>Zona de Perigo</h3>
                            <p>Ações permanentes que requerem confirmação.</p>
                            <button
                                className="profile-button-danger"
                                onClick={handleRequestRemoval}
                                disabled={profile.wants_to_be_removed}
                            >
                                {profile.wants_to_be_removed ? 'Pedido de Remoção Enviado' : 'Solicitar Remoção da Plataforma'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;