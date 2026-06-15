// Import your custom api instance instead of standard axios
import api from './api'; 

export const signup = async (userData) => {
  try {
    // Because api.js has '/api' in the baseURL, we just need '/auth/signup' here
    const response = await api.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    console.error("SIGNUP API ERROR:", error.response?.data || error.message);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error("LOGIN API ERROR:", error.response?.data || error.message);
    throw error;
  }
};