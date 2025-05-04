import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CITIZEN' // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
  
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8281/api/users/signup', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      navigate('/login', { 
        state: { 
          success: 'Account created successfully! Please log in.',
          prefilledEmail: formData.email
        }
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Email already exists');
      } else if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="CITIZEN">Citizen</option>
              <option value="RESPONDER">Responder</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`signup-button ${loading ? 'loading' : ''}`}
            aria-busy={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;