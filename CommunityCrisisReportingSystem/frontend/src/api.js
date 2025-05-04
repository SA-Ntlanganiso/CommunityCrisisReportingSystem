// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8281/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      window.location = '/login';
      window.location = '/signup';
    }
    return Promise.reject(error);
  }
);

export default api;