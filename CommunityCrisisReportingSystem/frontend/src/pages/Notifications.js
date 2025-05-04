import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/notifications/user/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setNotifications(response.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.patch(`/api/notifications/${notificationId}/mark-as-read`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(notifications.map(notification => 
        notification.id === notificationId ? response.data : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-container">
      <h2>Your Notifications</h2>
      {error && <div className="error-message">{error}</div>}
      
      {notifications.length === 0 ? (
        <p>No notifications to display</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map(notification => (
            <li 
              key={notification.id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <p className="notification-time">
                  {new Date(notification.sentAt).toLocaleString()}
                </p>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    className="mark-read-button"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button 
                  className="delete-button"
                  onClick={() => deleteNotification(notification.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;