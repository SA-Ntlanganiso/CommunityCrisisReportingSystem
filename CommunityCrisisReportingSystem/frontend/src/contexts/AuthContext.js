import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token on initial load
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and set user
      verifyToken(token);
    }
    setLoading(false);
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:8281/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", { email, password });
      const response = await axios.post('http://localhost:8281/api/auth/login', {
        email: email.trim().toLowerCase(),
        password: password
      });
      
      console.log("Login response:", response.data);
      
      const { accessToken, id, email: userEmail, role } = response.data;
      localStorage.setItem('token', accessToken);
      setUser({ id, email: userEmail, role });
      
      return { 
        success: true,
        role: role,
        data: response.data // Include full response for debugging
      };
      
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Login failed',
        error: error.response?.data // Include error details
      };
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    currentUser: user, // Expose user as currentUser for consistency with your components
    loading,
    login,
    logout,
    setUser // Include setUser if needed by child components
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}