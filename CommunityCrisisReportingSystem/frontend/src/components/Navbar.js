import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

// src/components/Navbar.js
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">
          Crisis Response System
        </Link>
      </div>

      <div className="nav-links">
        {currentUser ? (
          <>
            {currentUser.role.toUpperCase() === 'CITIZEN' && (
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            )}
            
            {currentUser.role.toUpperCase() === 'CITIZEN' && (
              <Link to="/report" className="nav-link">
                Report Crisis
              </Link>
            )}
            
            {currentUser.role.toUpperCase() === 'ADMIN' && (
              <Link to="/admin" className="nav-link">
                Admin Dashboard
              </Link>
            )}
            
            {currentUser.role.toUpperCase() === 'RESPONDER' && (
              <Link to="/responder" className="nav-link">
                Responder Dashboard
              </Link>
            )}
            
            <Link to="/map" className="nav-link">
              Map
            </Link>
            
            <div className="user-menu">
              <span className="user-greeting">
                Hello, {currentUser.email} ({currentUser.role})
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;