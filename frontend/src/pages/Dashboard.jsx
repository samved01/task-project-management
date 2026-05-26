import React, { useState, useEffect } from 'react';
import api from '../api';
import '../dashboard-dropdowns.css';

function Dashboard() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
    });
    
    // States for holding actual data for dropdowns
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State to track which card is expanded (null means none)
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats, projects, and tasks simultaneously
                const [statsRes, projectsRes, tasksRes] = await Promise.all([
                    api.get('/dashboard'),
                    api.get('/projects'),
                    api.get('/tasks')
                ]);
                
                setStats(statsRes.data);
                setProjects(projectsRes.data);
                setTasks(tasksRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const toggleCard = (cardName) => {
        if (expandedCard === cardName) {
            setExpandedCard(null); // Close if already open
        } else {
            setExpandedCard(cardName); // Open new one
        }
    };

    if (loading) return <div>Loading...</div>;

    // Filter tasks for specific dropdowns
    const completedTasksList = tasks.filter(t => t.status === 'Completed');
    const pendingTasksList = tasks.filter(t => t.status !== 'Completed');

    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            <div className="stats-grid">
                
                {/* Total Projects Card */}
                <div className="stat-card-container">
                    <div className="stat-card" onClick={() => toggleCard('projects')} style={{cursor: 'pointer'}}>
                        <h3>Total Projects</h3>
                        <p className="stat-number">{stats.totalProjects}</p>
                        <small className="click-hint">Click to view ▾</small>
                    </div>
                    {expandedCard === 'projects' && (
                        <div className="dashboard-dropdown">
                            {projects.length > 0 ? (
                                <ul>
                                    {projects.map(p => <li key={p.id}>❖ {p.name}</li>)}
                                </ul>
                            ) : (<p>No projects found.</p>)}
                        </div>
                    )}
                </div>

                {/* Total Tasks Card */}
                <div className="stat-card-container">
                    <div className="stat-card" onClick={() => toggleCard('tasks')} style={{cursor: 'pointer'}}>
                        <h3>Total Tasks</h3>
                        <p className="stat-number">{stats.totalTasks}</p>
                        <small className="click-hint">Click to view ▾</small>
                    </div>
                    {expandedCard === 'tasks' && (
                        <div className="dashboard-dropdown">
                            {tasks.length > 0 ? (
                                <ul>
                                    {tasks.map(t => <li key={t.id}>❖ {t.title} <span className="dropdown-badge">{t.status}</span></li>)}
                                </ul>
                            ) : (<p>No tasks found.</p>)}
                        </div>
                    )}
                </div>

                {/* Completed Tasks Card */}
                <div className="stat-card-container">
                    <div className="stat-card" onClick={() => toggleCard('completed')} style={{cursor: 'pointer'}}>
                        <h3>Completed Tasks</h3>
                        <p className="stat-number">{stats.completedTasks}</p>
                        <small className="click-hint">Click to view ▾</small>
                    </div>
                    {expandedCard === 'completed' && (
                        <div className="dashboard-dropdown">
                            {completedTasksList.length > 0 ? (
                                <ul>
                                    {completedTasksList.map(t => <li key={t.id}>✓ {t.title}</li>)}
                                </ul>
                            ) : (<p>No completed tasks.</p>)}
                        </div>
                    )}
                </div>

                {/* Pending Tasks Card */}
                <div className="stat-card-container">
                    <div className="stat-card" onClick={() => toggleCard('pending')} style={{cursor: 'pointer'}}>
                        <h3>Pending Tasks</h3>
                        <p className="stat-number">{stats.pendingTasks}</p>
                        <small className="click-hint">Click to view ▾</small>
                    </div>
                    {expandedCard === 'pending' && (
                        <div className="dashboard-dropdown">
                            {pendingTasksList.length > 0 ? (
                                <ul>
                                    {pendingTasksList.map(t => <li key={t.id}>⏳ {t.title} <span className="dropdown-badge">{t.priority}</span></li>)}
                                </ul>
                            ) : (<p>No pending tasks.</p>)}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Dashboard;
