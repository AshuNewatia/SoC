import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, signup as signupApi } from '../services/authServices';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // 1. CHANGED THIS FROM false TO true
    const [loading, setLoading] = useState(true); 
    
    useEffect(() =>{
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        // 2. Once the check is complete, turn off loading so the route can render
        setLoading(false);
    }, []);
    
    const login = async (email, password) =>{
        const data = await loginApi({email, password});
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        return data;
    }
    
    const signup = async (name, email, password) => {
        const data = await signupApi({ name, email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        return data;
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };
    
    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};