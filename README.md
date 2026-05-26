# Task & Project Management Web Application

A full-stack Task & Project Management Web Application built using the PERN Stack (PostgreSQL, Express.js, React, Node.js). This application allows users to register, log in, manage projects, and create tasks within those projects, along with a dashboard overview.

**🚀 Live Demo (Vercel):** [https://task-project-management.vercel.app](https://task-project-management.vercel.app)

## Features

- **Authentication**: User Registration and Login with JWT.
- **Dashboard**: Visual overview of total projects, total tasks, completed, and pending tasks.
- **Projects**: Full CRUD operations for projects.
- **Tasks**: Full CRUD operations for tasks, assign to projects/users, status tracking (To-Do, In Progress, Completed), and filtering by status, priority, and assigned user.

## Prerequisites

- Node.js installed (v16+ recommended).
- PostgreSQL installed and running on your local machine.

## Setup Instructions

### 1. Database Setup

1. Open your PostgreSQL terminal (psql) or a tool like pgAdmin.
2. Run the SQL script provided in `database.sql` to create the database and tables:

```bash
# If using command line:
psql -U postgres -f database.sql
```

Alternatively, open `database.sql`, copy its contents, and execute it in your SQL tool. It will create a database named `task_management` and the `users`, `projects`, and `tasks` tables.

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder (or edit the existing one) with the following environment variables. **Make sure to change `DB_PASSWORD` to your actual PostgreSQL password**:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=task_management
   JWT_SECRET=super_secret_jwt_key_12345
   ```
4. Start the backend server:
   ```bash
   npm start
   # or to run with nodemon if installed:
   node server.js
   ```
   The backend will run on `http://localhost:5000`.

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
4. The frontend will usually run on `http://localhost:5173`. Open this URL in your browser.

## How to use

1. Go to the frontend URL.
2. Click **Register** to create a new user account.
3. Log in with the newly created account.
4. Go to **Projects** to create your first project.
5. Go to **Tasks** to create tasks. You can assign tasks to the project you just created, set priority, and assign it to a user.
6. Check the **Dashboard** to see the updated statistics.
