import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './ResponderDashboard.css';

const API_BASE_URL = 'http://localhost:8281';

const ResponderDashboard = () => {
  const { currentUser } = useAuth();
  const [assignedCrises, setAssignedCrises] = useState([]);
  const [availableCrises, setAvailableCrises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch assigned crises
        const assignedResponse = await axios.get(
          `${API_BASE_URL}/api/crisis-reports/responder/${currentUser.id}`,
          {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        // Fetch available crises (UNRESOLVED status)
        const availableResponse = await axios.get(
          `${API_BASE_URL}/api/crisis-reports?status=UNRESOLVED`,
          {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        // Fetch unread notifications count
        const notificationsResponse = await axios.get(
          `${API_BASE_URL}/api/notifications/unread-count/user/${currentUser.id}`,
          {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        setAssignedCrises(assignedResponse.data);
        setAvailableCrises(availableResponse.data);
        setUnreadCount(notificationsResponse.data.count || 0);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'RESPONDER') {
      fetchData();
    }
  }, [currentUser]);

  const assignToMe = async (crisisId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/crisis-reports/${crisisId}/assign/${currentUser.id}`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAssignedCrises([...assignedCrises, response.data]);
      setAvailableCrises(availableCrises.filter(c => c.id !== crisisId));
      setSuccess('Crisis assigned successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error assigning crisis:', err);
      setError(err.response?.data?.message || 'Failed to assign crisis');
      setTimeout(() => setError(''), 5000);
    }
  };

  const updateCrisisStatus = async (crisisId, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/crisis-reports/${crisisId}/status`,
        { status },
        { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAssignedCrises(assignedCrises.map(c => 
        c.id === crisisId ? response.data : c
      ));
      
      if (status === 'RESOLVED') {
        setAvailableCrises(availableCrises.filter(c => c.id !== crisisId));
      }
      
      setSuccess(`Status updated to ${status}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 5000);
    }
  };

  const filteredCrises = assignedCrises.filter(crisis => {
    if (filter === 'ALL') return true;
    return crisis.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your assignments...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'RESPONDER') {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="responder-dashboard">
      <div className="dashboard-header">
        <h1>Responder Dashboard</h1>
        <div className="header-actions">
          <span className="notification-badge">
            Unread Notifications: {unreadCount}
          </span>
          <span className="welcome-message">
            Welcome, {currentUser.firstName}!
          </span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="dashboard-sections">
        {/* Available Crises Section */}
        <section className="available-crises">
          <h2>Available Crises</h2>
          {availableCrises.length === 0 ? (
            <p>No available crises at this time</p>
          ) : (
            <div className="crises-grid">
              {availableCrises.map(crisis => (
                <div key={crisis.id} className="crisis-card">
                  <h3>{crisis.title}</h3>
                  <p><strong>Category:</strong> {crisis.category}</p>
                  <p><strong>Location:</strong> {crisis.address || 'Unknown'}</p>
                  <button
                    className="assign-button"
                    onClick={() => assignToMe(crisis.id)}
                  >
                    Assign to Me
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assigned Crises Section */}
        <section className="assigned-crises">
          <div className="section-header">
            <h2>Your Assigned Crises</h2>
            <div className="filter-group">
              <label>Filter:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {filteredCrises.length === 0 ? (
            <p>No assigned crises match your filter</p>
          ) : (
            <div className="crises-grid">
              {filteredCrises.map(crisis => (
                <div key={crisis.id} className="crisis-card">
                  <div className="crisis-header">
                    <h3>{crisis.title}</h3>
                    <span className={`status-badge ${crisis.status.toLowerCase()}`}>
                      {crisis.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="crisis-details">
                    <p><strong>Category:</strong> {crisis.category}</p>
                    <p><strong>Reporter:</strong> {crisis.reporterName || 'Anonymous'}</p>
                    <p><strong>Reported:</strong> {new Date(crisis.reportTime).toLocaleString()}</p>
                    <p><strong>Location:</strong> {crisis.address || 'Unknown'}</p>
                  </div>

                  <div className="crisis-actions">
                    {crisis.status === 'ASSIGNED' && (
                      <button
                        className="action-button start-button"
                        onClick={() => updateCrisisStatus(crisis.id, 'IN_PROGRESS')}
                      >
                        Start Work
                      </button>
                    )}
                    {crisis.status !== 'RESOLVED' && (
                      <button
                        className="action-button resolve-button"
                        onClick={() => updateCrisisStatus(crisis.id, 'RESOLVED')}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResponderDashboard;