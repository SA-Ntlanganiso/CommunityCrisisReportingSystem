import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

const API_BASE_URL = 'http://localhost:8281';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [crises, setCrises] = useState([]);
  const [filteredCrises, setFilteredCrises] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Transform crisis data to match frontend expectations
  const transformCrisisData = (crisis) => ({
    ...crisis,
    status: crisis.status === 'ACTIVE' ? 'UNRESOLVED' : crisis.status,
    firstName: crisis.first_name || crisis.firstName,
    lastName: crisis.last_name || crisis.lastName,
    reporterName: crisis.reporter_name || crisis.reporterName,
    reportTime: crisis.report_time || crisis.reportTime
  });

  // Transform user data to match frontend expectations
  const transformUserData = (user) => ({
    ...user,
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    createdAt: user.created_at || user.createdAt
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch crises from API
      const crisesResponse = await fetch(`${API_BASE_URL}/api/crisis-reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!crisesResponse.ok) throw new Error('Failed to fetch crises');
      let crisesData = await crisesResponse.json();
      crisesData = crisesData.map(transformCrisisData);
      setCrises(crisesData);
      setFilteredCrises(crisesData);

      // Fetch users from API
      const usersResponse = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      let usersData = await usersResponse.json();
      usersData = usersData.map(transformUserData);
      setUsers(usersData);

      // Fetch unread notifications count
      const notificationsResponse = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!notificationsResponse.ok) throw new Error('Failed to fetch notifications');
      const notificationsData = await notificationsResponse.json();
      setUnreadCount(notificationsData.count || 0);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'ADMIN') {
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    let result = [...crises];
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(crisis => crisis.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(crisis => crisis.category === categoryFilter);
    }
    
    setFilteredCrises(result);
  }, [statusFilter, categoryFilter, crises]);

  const handleResolveCrisis = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crisis-reports/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resolve crisis');
      }
      
      const updatedCrisis = await response.json();
      
      setCrises(prevCrises => 
        prevCrises.map(crisis => 
          crisis.id === id ? transformCrisisData(updatedCrisis) : crisis
        )
      );
      
      setSuccess('Crisis resolved successfully! Notification sent to reporter.');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error resolving crisis:', err);
      setError(err.message || 'Failed to resolve crisis');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeleteCrisis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crisis report?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/crisis-reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete crisis');
      }
      
      setCrises(prevCrises => prevCrises.filter(crisis => crisis.id !== id));
      setSuccess('Crisis deleted successfully! Notification sent to reporter.');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error deleting crisis:', err);
      setError(err.message || 'Failed to delete crisis');
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleUserStatus = async (userId) => {
    if (!window.confirm('Are you sure you want to change this user\'s status?')) return;
    
    try {
      setUserActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }
      
      const updatedUser = await response.json();
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? transformUserData(updatedUser) : user
        )
      );
      
      // Create appropriate notification based on new status
      const statusMessage = updatedUser.active 
        ? 'Your account has been activated by an administrator.'
        : 'Your account has been deactivated by an administrator.';
      
      await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: statusMessage,
          userId: updatedUser.id,
          channel: 'EMAIL'
        })
      });
      
      setSuccess(`User ${updatedUser.active ? 'activated' : 'deactivated'} successfully! Notification sent.`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err.message || 'Failed to update user status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUserActionLoading(false);
    }
  };
  
  const openCrisisDetails = (crisis) => {
    setSelectedCrisis(crisis);
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
  };

  const closeDetailsModal = () => {
    setSelectedCrisis(null);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <Link to="/" className="home-link">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <Link to="/notifications" className="notifications-link">
            Notifications {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </Link>
          <span className="welcome-message">Welcome, {currentUser.firstName}!</span>
        </div>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <section className="stats-section">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{users.filter(u => u.active).length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Crises</h3>
          <p>{crises.filter(c => c.status === 'UNRESOLVED').length}</p>
        </div>
        <div className="stat-card">
          <h3>Resolved Crises</h3>
          <p>{crises.filter(c => c.status === 'RESOLVED').length}</p>
        </div>
      </section>

      <section className="users-section">
        <h2>User Management</h2>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} onClick={() => openUserDetails(user)}>
                    <td>{user.id}</td>
                    <td>{user.firstName || 'N/A'}</td>
                    <td>{user.lastName || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-button status-toggle-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUserStatus(user.id);
                        }}
                        disabled={userActionLoading}
                      >
                        {userActionLoading ? 'Processing...' : (user.active ? 'Deactivate' : 'Activate')}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="crises-section">
        <div className="section-header">
          <h2>Crisis Reports Management</h2>
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select 
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNRESOLVED">Active</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select 
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="FIRE">Fire</option>
                <option value="FLOOD">Flood</option>
                <option value="MEDICAL">Medical</option>
                <option value="CRIME">Crime</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="table-container">
          <table className="crises-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Reporter</th>
                <th>Reported At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrises.length > 0 ? (
                filteredCrises.map(crisis => (
                  <tr key={crisis.id} onClick={() => openCrisisDetails(crisis)}>
                    <td>{crisis.title}</td>
                    <td>{crisis.category}</td>
                    <td>
                      <span className={`status-badge ${crisis.status.toLowerCase()}`}>
                        {crisis.status}
                      </span>
                    </td>
                    <td>
                      <span className={`severity-badge ${crisis.severity?.toLowerCase() || 'low'}`}>
                        {crisis.severity || 'LOW'}
                      </span>
                    </td>
                    <td>{crisis.reporterName || 'Anonymous'}</td>
                    <td>{new Date(crisis.reportTime).toLocaleString()}</td>
                    <td className="actions-cell">
                      {crisis.status !== 'RESOLVED' && (
                        <button
                          className="action-button resolve-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveCrisis(crisis.id);
                          }}
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        className="action-button delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCrisis(crisis.id);
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="action-button view-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCrisisDetails(crisis);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No crises found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Crisis Details Modal */}
      {selectedCrisis && (
        <div className="modal-overlay">
          <div className="crisis-details-modal">
            <button className="close-modal" onClick={closeDetailsModal}>
              &times;
            </button>
            <h2>{selectedCrisis.title}</h2>
            <div className="modal-content">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedCrisis.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-badge ${selectedCrisis.status.toLowerCase()}`}>
                    {selectedCrisis.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Severity:</span>
                  <span className={`detail-value severity-badge ${selectedCrisis.severity?.toLowerCase() || 'low'}`}>
                    {selectedCrisis.severity || 'LOW'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Reported By:</span>
                  <span className="detail-value">{selectedCrisis.reporterName || 'Anonymous'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Reported At:</span>
                  <span className="detail-value">
                    {new Date(selectedCrisis.reportTime).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Responders:</span>
                  <span className="detail-value">{selectedCrisis.responders || 0}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{selectedCrisis.address || 'Location not specified'}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Coordinates:</span>
                  <span className="detail-value">
                    {selectedCrisis.latitude?.toFixed(6)}, {selectedCrisis.longitude?.toFixed(6)}
                  </span>
                </div>
              </div>
              
              <div className="description-section">
                <h3>Description</h3>
                <p>{selectedCrisis.description || 'No description provided'}</p>
              </div>
              
              <div className="modal-actions">
                {selectedCrisis.status !== 'RESOLVED' && (
                  <button
                    className="action-button resolve-button"
                    onClick={() => {
                      handleResolveCrisis(selectedCrisis.id);
                      closeDetailsModal();
                    }}
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  className="action-button delete-button"
                  onClick={() => {
                    handleDeleteCrisis(selectedCrisis.id);
                    closeDetailsModal();
                  }}
                >
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="user-details-modal">
            <button className="close-modal" onClick={closeDetailsModal}>
              &times;
            </button>
            <h2>User Details</h2>
            <div className="modal-content">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedUser.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">First Name:</span>
                  <span className="detail-value">{selectedUser.firstName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name:</span>
                  <span className="detail-value">{selectedUser.lastName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Role:</span>
                  <span className={`detail-value role-badge ${selectedUser.role.toLowerCase()}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-badge ${selectedUser.active ? 'active' : 'inactive'}`}>
                    {selectedUser.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-value">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  className="action-button status-toggle-button"
                  onClick={() => {
                    toggleUserStatus(selectedUser.id);
                    closeDetailsModal();
                  }}
                  disabled={userActionLoading}
                >
                  {userActionLoading ? 'Processing...' : (selectedUser.active ? 'Deactivate User' : 'Activate User')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;