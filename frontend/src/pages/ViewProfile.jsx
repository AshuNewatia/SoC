import React, { useState } from 'react'; // 1. Import useState
import { useAuth } from '../context/authContext';
import { User, Mail, Shield, Edit2 } from 'lucide-react';
import EditProfile from './EditProfile'; // 2. Import your modal

export default function ViewProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false); // 3. State for modal

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Settings</h2>
      
      {/* 4. Render the Modal */}
      <EditProfile isOpen={isEditing} onClose={() => setIsEditing(false)} />
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <p className="text-slate-500">First-year B.Tech CSE</p>
            </div>
          </div>
          {/* 5. Attach trigger to the button */}
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField icon={<Mail size={20} />} label="Email Address" value={user?.email} />
          <ProfileField icon={<User size={20} />} label="Full Name" value={user?.name} />
          <ProfileField icon={<Shield size={20} />} label="Account Status" value="Verified Member" />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="text-primary mt-1">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-slate-700 font-medium">{value}</p>
      </div>
    </div>
  );
}