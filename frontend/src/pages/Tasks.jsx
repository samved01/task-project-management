import React, { useState, useEffect } from 'react';
import api from '../api';

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('To-Do');
    const [priority, setPriority] = useState('Medium');
    const [projectId, setProjectId] = useState('');
    const [assignedUserId, setAssignedUserId] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Filters state
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterUser, setFilterUser] = useState('');

    const fetchData = async () => {
        // Fetch projects for dropdown
        const projRes = await api.get('/projects');
        setProjects(projRes.data);
        if (projRes.data.length > 0 && !projectId) {
            setProjectId(projRes.data[0].id);
        }

        // Fetch users for assignment dropdown
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);

        // Fetch tasks
        let queryParams = [];
        if (filterStatus) queryParams.push(`status=${filterStatus}`);
        if (filterPriority) queryParams.push(`priority=${filterPriority}`);
        if (filterUser) queryParams.push(`assigned_user_id=${filterUser}`);
        
        const tasksRes = await api.get(`/tasks?${queryParams.join('&')}`);
        setTasks(tasksRes.data);
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterPriority, filterUser]); // Re-fetch when filters change

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title, description, status, priority, 
            project_id: projectId, 
            assigned_user_id: assignedUserId || null
        };

        if (editingId) {
            await api.put(`/tasks/${editingId}`, payload);
            setEditingId(null);
        } else {
            await api.post('/tasks', payload);
        }
        
        // Reset form
        setTitle('');
        setDescription('');
        setStatus('To-Do');
        setPriority('Medium');
        setAssignedUserId('');
        fetchData();
    };

    const handleEdit = (task) => {
        setEditingId(task.id);
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setProjectId(task.project_id);
        setAssignedUserId(task.assigned_user_id || '');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await api.delete(`/tasks/${id}`);
            fetchData();
        }
    };

    return (
        <div className="tasks-container">
            <h2>Tasks Management</h2>
            
            {/* Filters */}
            <div className="filters">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                    <option value="">All Users</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
            </div>

            <form onSubmit={handleSubmit} className="crud-form">
                <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <select value={projectId} onChange={e => setProjectId(e.target.value)} required>
                    <option value="" disabled>Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <select value={assignedUserId} onChange={e => setAssignedUserId(e.target.value)}>
                    <option value="">Assign User</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
                
                <button type="submit" className="btn-primary">
                    {editingId ? 'Update Task' : 'Add Task'}
                </button>
                {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }}>Cancel</button>}
            </form>

            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id} className="task-item">
                        <div className="task-info">
                            <h3>{task.title} <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span></h3>
                            <p>{task.description}</p>
                            <small>Status: {task.status} | Assigned To: {task.assigned_user_name || 'Unassigned'}</small>
                        </div>
                        <div className="task-actions">
                            <button onClick={() => handleEdit(task)} className="btn-secondary">Edit</button>
                            <button onClick={() => handleDelete(task.id)} className="btn-danger">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Tasks;
