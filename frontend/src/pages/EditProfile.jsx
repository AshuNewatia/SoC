import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import api from '../services/api';

export default function EditProfile({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  
  // 1. Added confirmPassword to the state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    year: user?.year || '',
    branch: user?.branch || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '', 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("Your new passwords do not match. Please try again.");
      return; 
    }

    try {
      const response = await api.patch('/auth/update-profile', formData);
      
      // If the code reaches this line, the backend WORKED.
      console.log("Backend Success! Response:", response.data); 
      
      setUser(response.data.user); // <--- This is the prime suspect for the crash
      onClose();
      
    } catch (err) {
      // This will print the exact reason React crashed to your browser console
      console.error("FRONTEND CRASH DETAILS:", err);
      
      if (err.response) {
        // This handles actual backend rejections (like typing the wrong old password)
        alert(err.response.data.message || "Update failed.");
      } else {
        // This handles React crashing!
        alert("React Error: " + err.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100"
      >
        <h2 className="text-xl font-bold mb-6 text-slate-800">Edit Profile</h2>

        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
        <input 
          className="w-full p-3 mb-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</label>
            <input 
              className="w-full p-3 mb-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g., 1"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Branch</label>
            <input 
              className="w-full p-3 mb-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g., CSE"
              value={formData.branch}
              onChange={(e) => setFormData({...formData, branch: e.target.value})}
            />
          </div>
        </div>

        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security</label>
        <input 
          type="password"
          className="w-full p-3 mb-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Old Password (required)"
          onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
        />
        <input 
          type="password"
          className="w-full p-3 mb-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="New Password (optional)"
          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
        />
        
        {/* 3. The new Confirm Password input field */}
        <input 
          type="password"
          className="w-full p-3 mb-6 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Confirm New Password"
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        />

        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-1 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}