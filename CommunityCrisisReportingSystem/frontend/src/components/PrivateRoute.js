import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


// src/components/PrivateRoute.js
const PrivateRoute = ({ children, requiredRole }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Convert both to uppercase for consistent comparison
  if (requiredRole && currentUser.role.toUpperCase() !== requiredRole.toUpperCase()) {
    // Redirect to default dashboard for their role
    switch(currentUser.role.toUpperCase()) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'RESPONDER':
        return <Navigate to="/responder" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};
export default PrivateRoute;