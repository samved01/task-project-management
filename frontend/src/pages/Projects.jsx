import React, { useState, useEffect } from 'react';
import api from '../api';

function Projects() {
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);

    const fetchProjects = async () => {
        const res = await api.get('/projects');
        setProjects(res.data);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await api.put(`/projects/${editingId}`, { name, description });
            setEditingId(null);
        } else {
            await api.post('/projects', { name, description });
        }
        setName('');
        setDescription('');
        fetchProjects();
    };

    const handleEdit = (project) => {
        setEditingId(project.id);
        setName(project.name);
        setDescription(project.description);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            await api.delete(`/projects/${id}`);
            fetchProjects();
        }
    };

    return (
        <div className="projects-container">
            <h2>Projects Management</h2>
            
            <form onSubmit={handleSubmit} className="crud-form">
                <input 
                    type="text" 
                    placeholder="Project Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                />
                <textarea 
                    placeholder="Project Description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                />
                <button type="submit" className="btn-primary">
                    {editingId ? 'Update Project' : 'Add Project'}
                </button>
                {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setName(''); setDescription(''); }}>Cancel</button>}
            </form>

            <ul className="project-list">
                {projects.map(project => (
                    <li key={project.id} className="project-item">
                        <div className="project-info">
                            <h3>{project.name}</h3>
                            <p>{project.description}</p>
                        </div>
                        <div className="project-actions">
                            <button onClick={() => handleEdit(project)} className="btn-secondary">Edit</button>
                            <button onClick={() => handleDelete(project.id)} className="btn-danger">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Projects;
