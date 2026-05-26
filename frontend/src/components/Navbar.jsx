import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Task Manager</Link>
            </div>
            <ul className="navbar-links">
                {user ? (
                    <>
                        <li><Link to="/">Dashboard</Link></li>
                        <li><Link to="/projects">Projects</Link></li>
                        <li><Link to="/tasks">Tasks</Link></li>
                        <li><span>Hi, {user.username}</span></li>
                        <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
