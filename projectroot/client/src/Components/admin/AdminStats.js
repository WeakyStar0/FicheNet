// src/Components/admin/AdminStats.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import '../../styles/AdminStats.css';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    ArcElement, PointElement, LineElement
);

const AdminStats = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error("Falha ao buscar estatísticas.");
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    if (isLoading || !stats) {
        return <p>A carregar estatísticas...</p>;
    }

    const userCountsData = {
        labels: Object.keys(stats.userCounts).map(role => role.charAt(0).toUpperCase() + role.slice(1)),
        datasets: [{
            label: 'Total de Utilizadores',
            data: Object.values(stats.userCounts),
            backgroundColor: ['#e53935', '#1e88e5', '#43a047', '#fdd835'],
            borderRadius: 5,
            borderWidth: 0
        }],
    };

    const proposalStatusData = {
        labels: Object.keys(stats.proposalStatusCounts).map(key => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
        datasets: [{
            data: Object.values(stats.proposalStatusCounts),
            backgroundColor: ['#ff8f00', '#2e7d32', '#616161', '#c62828'],
            borderColor: '#2e2e2e',
            borderWidth: 4,
        }],
    };

    const matchesOverTimeData = {
        labels: stats.matchesOverTime.map(item => item.month),
        datasets: [{
            label: 'Interesses por Mês',
            data: stats.matchesOverTime.map(item => item.count),
            fill: true,
            backgroundColor: 'rgba(229, 57, 53, 0.2)',
            borderColor: '#e53935',
            pointBackgroundColor: '#e53935',
            pointBorderColor: '#fff',
            pointHoverRadius: 7,
            tension: 0.4
        }]
    };

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, color: '#f1f1f1', font: { size: 16 } },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#e53935',
                bodyColor: '#eee',
                borderColor: '#333',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 4
            }
        },
        scales: {
            x: { ticks: { color: '#888' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: { ticks: { color: '#888' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, beginAtZero: true }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { color: 'white', boxWidth: 20 } },
            title: { display: true, text: 'Propostas por Estado', color: '#f1f1f1', font: { size: 16 } }
        }
    };

    const totalProposals = Object.values(stats.proposalStatusCounts).reduce((sum, count) => sum + count, 0);

    return (
        <div className="stats-page-container">
            <h2 className="mb-5">Visão Geral da Plataforma</h2>
            <Row className="mb-4 g-4">
                <Col md={6} lg={3}><Card bg="dark" text="white" className="h-100 stats-card kpi-card"><Card.Body className="text-center d-flex flex-column justify-content-center"><Card.Title className="fs-1 text-danger">{stats.userCounts.student || 0}</Card.Title><Card.Text>Estudantes</Card.Text></Card.Body></Card></Col>
                <Col md={6} lg={3}><Card bg="dark" text="white" className="h-100 stats-card kpi-card"><Card.Body className="text-center d-flex flex-column justify-content-center"><Card.Title className="fs-1 text-primary">{stats.userCounts.company || 0}</Card.Title><Card.Text>Empresas</Card.Text></Card.Body></Card></Col>
                <Col md={6} lg={3}><Card bg="dark" text="white" className="h-100 stats-card kpi-card"><Card.Body className="text-center d-flex flex-column justify-content-center"><Card.Title className="fs-1 text-warning">{totalProposals}</Card.Title><Card.Text>Propostas Totais</Card.Text></Card.Body></Card></Col>
                <Col md={6} lg={3}><Card bg="dark" text="white" className="h-100 stats-card kpi-card"><Card.Body className="text-center d-flex flex-column justify-content-center"><Card.Title className="fs-1 text-info">{stats.matchesOverTime.reduce((sum, item) => sum + Number(item.count), 0)}</Card.Title><Card.Text>Interesses (6 Meses)</Card.Text></Card.Body></Card></Col>
            </Row>

            <Row className="g-4">
                <Col lg={7}><Card bg="dark" text="white" className="stats-card-charts-1"><Card.Body><div style={{ height: '300px' }}><Line options={{ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Evolução de Interesses na Plataforma' } } }} data={matchesOverTimeData} /></div></Card.Body></Card></Col>
                <Col lg={5}><Card bg="dark" text="white" className="stats-card-charts-2"><Card.Body><div style={{ height: '300px' }}><Doughnut data={proposalStatusData} options={doughnutOptions} /></div></Card.Body></Card></Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card bg="dark" text="white" className="stats-card-charts-3">
                        <Card.Body>
                            <div style={{ height: '250px' }}>
                                <Bar
                                    options={{ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Distribuição de Utilizadores por Perfil' } } }}
                                    data={userCountsData}
                                />
                            </div>
                        </Card.Body>
                        {/* ESTA É A TAG DE FECHO QUE ESTAVA EM FALTA */}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminStats;