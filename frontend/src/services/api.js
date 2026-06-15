import axios from "axios";

// Dynamically use the .env variable, with a fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  // Adding /api here means all requests automatically go to /api/...
  baseURL: `${API_URL}`, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to every request if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;