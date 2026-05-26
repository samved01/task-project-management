const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Middleware
app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// ==========================================
//                 ROUTES
// ==========================================

// --- Authentication Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- User Route (to fetch list of users for assignment) ---
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await pool.query('SELECT id, username FROM users');
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Projects Routes ---

// Create Project
app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const newProject = await pool.query(
            'INSERT INTO projects (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
            [name, description, req.user.id]
        );
        res.json(newProject.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all projects for the logged-in user
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(projects.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Project
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        // Ensure user owns project
        const updateProject = await pool.query(
            'UPDATE projects SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [name, description, id, req.user.id]
        );
        
        if (updateProject.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found or unauthorized' });
        }
        res.json(updateProject.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteProject = await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
        
        if (deleteProject.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found or unauthorized' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Tasks Routes ---

// Create Task
app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const { title, description, status, priority, project_id, assigned_user_id } = req.body;
        
        // Simple check to see if project belongs to user (optional based on logic, but good practice)
        const projectCheck = await pool.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [project_id, req.user.id]);
        if (projectCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to add task to this project' });
        }

        const newTask = await pool.query(
            'INSERT INTO tasks (title, description, status, priority, project_id, assigned_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, status || 'To-Do', priority || 'Medium', project_id, assigned_user_id]
        );
        res.json(newTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get tasks (with optional filters)
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const { project_id, status, priority, assigned_user_id } = req.query;
        
        let query = 'SELECT tasks.*, users.username as assigned_user_name FROM tasks LEFT JOIN users ON tasks.assigned_user_id = users.id WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (project_id) {
            query += ` AND project_id = $${paramIndex}`;
            params.push(project_id);
            paramIndex++;
        }
        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        if (priority) {
            query += ` AND priority = $${paramIndex}`;
            params.push(priority);
            paramIndex++;
        }
        if (assigned_user_id) {
            query += ` AND assigned_user_id = $${paramIndex}`;
            params.push(assigned_user_id);
            paramIndex++;
        }

        query += ' ORDER BY tasks.created_at DESC';

        const tasks = await pool.query(query, params);
        res.json(tasks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Task
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, assigned_user_id } = req.body;
        
        const updateTask = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, assigned_user_id = $5 WHERE id = $6 RETURNING *',
            [title, description, status, priority, assigned_user_id, id]
        );

        if (updateTask.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(updateTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteTask = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        
        if (deleteTask.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Dashboard Stats Route ---
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const projectsCount = await pool.query('SELECT COUNT(*) FROM projects WHERE user_id = $1', [req.user.id]);
        
        // To get task stats, we find tasks belonging to user's projects
        const tasksQuery = `
            SELECT status, COUNT(*) 
            FROM tasks 
            JOIN projects ON tasks.project_id = projects.id 
            WHERE projects.user_id = $1 
            GROUP BY status
        `;
        const taskStats = await pool.query(tasksQuery, [req.user.id]);
        
        let totalTasks = 0;
        let completedTasks = 0;
        let pendingTasks = 0;

        taskStats.rows.forEach(row => {
            const count = parseInt(row.count);
            totalTasks += count;
            if (row.status === 'Completed') {
                completedTasks += count;
            } else {
                pendingTasks += count;
            }
        });

        res.json({
            totalProjects: parseInt(projectsCount.rows[0].count),
            totalTasks,
            completedTasks,
            pendingTasks
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
