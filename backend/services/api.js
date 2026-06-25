import axios from "axios";

// 1. Create the base Axios instance pointing to your backend
const api = axios.create({
  // Vite uses import.meta.env, falling back to localhost if the .env is missing
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// 2. The Interceptor: Automatically attaches your token to every request
api.interceptors.request.use(
  (config) => {
    // Grab the token from localStorage (Make sure "token" matches your auth setup!)
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;