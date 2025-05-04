import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CrisisProvider } from './contexts/CrisisContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Essential Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ReportCrisis from './pages/ReportCrisis';
import AdminDashboard from './pages/AdminDashboard';
import ResponderDashboard from './pages/ResponderDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CrisisProvider> {/* Add CrisisProvider here */}
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/report" element={
              <PrivateRoute requiredRole="CITIZEN">
                <ReportCrisis />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/responder" element={
              <PrivateRoute requiredRole="RESPONDER">
                <ResponderDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </CrisisProvider> {/* Close CrisisProvider */}
      </AuthProvider>
    </Router>
  );
}

export default App;