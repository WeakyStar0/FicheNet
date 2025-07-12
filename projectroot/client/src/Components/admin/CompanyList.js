// src/Components/admin/CompanyList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('/api/admin/companies', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao buscar empresas.');
                setCompanies(await response.json());
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        };
        fetchCompanies();
    }, [token]);

    if (isLoading) return <p>A carregar empresas...</p>;

    return (
        <div className="list-view-container">
            <h2>Gestão de Empresas</h2>
            <table className="data-table">
                <thead>
                    <tr><th>Nome da Empresa</th><th>Email de Contacto</th><th>Website</th></tr>
                </thead>
                <tbody>
                    {companies.map(company => (
                        <tr key={company.id}>
                            <td>{company.company_name}</td>
                            <td>{company.email}</td>
                            <td><a href={company.website_url} target="_blank" rel="noopener noreferrer">{company.website_url}</a></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default CompanyList;