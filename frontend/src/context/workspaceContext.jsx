// src/context/WorkspaceContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; 
import { useAuth } from './authContext';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const { user } = useAuth(); // Only fetch if user is logged in

  const fetchWorkspaces = async () => {
    if (!user) return; // Don't fetch if not logged in
    
    try {
      // 👇 Attach the user ID as a query parameter so the backend knows who is asking!
      const res = await api.get(`/api/workspaces?userId=${user.id}`);
      
      setWorkspaces(res.data);
    } catch (err) {
      console.error("Error fetching workspaces", err);
    }
  };

  useEffect(() => {
  fetchWorkspaces();

  const handleWorkspaceChange = () => {
    fetchWorkspaces();
  };

  window.addEventListener(
    "workspaceListChanged",
    handleWorkspaceChange
  );

  return () => {
    window.removeEventListener(
      "workspaceListChanged",
      handleWorkspaceChange
    );
  };
}, [user]);

  return (
    <WorkspaceContext.Provider value={{ workspaces, setWorkspaces, fetchWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspaces = () => useContext(WorkspaceContext);