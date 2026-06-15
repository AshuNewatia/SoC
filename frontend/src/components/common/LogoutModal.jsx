import React from 'react';
import { X, LogOut } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <LogOut size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Ready to leave?</h2>
        </div>
        
        <p className="text-slate-600 mb-8">
          Are you sure you want to log out? You will need to sign in again to access your workspaces.
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}