import  { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import api from '../services/api';
import { handleSuccess } from '../utils/handleApiError';
import { User, Shield, GraduationCap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    program: user?.program || '',
    year: user?.year || '',
    branch: user?.branch || '',
    facultyType: user?.facultyType || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        program: user.program || '',
        year: user.year || '',
        branch: user.branch || '',
        facultyType: user.facultyType || '',
      }));
    }
  }, [user]);

  const branches = [
    "Computer Science and Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Metallurgical Engineering and Material Science",
    "Engineering Physics",
    "Mathematics & Computing",
    "Space Science and Engineering",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("Your new passwords do not match. Please try again.");
      return;
    }

    try {
      const response = await api.patch('/api/auth/update-profile', formData);
      handleSuccess("Profile updated successfully");
      setUser(response.data.user);
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (err) {
      console.error("FRONTEND CRASH DETAILS:", err);
      if (err.response) {
        alert(err.response.data.message || "Update failed.");
      } else {
        alert("React Error: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 px-4 sm:px-6 lg:px-10 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 shadow-xs text-slate-600 hover:-translate-x-1"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage your institutional student profile identities and security settings.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/20 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <User size={16} className="text-primary" />
              Personal Information
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm text-slate-800 font-medium hover:border-primary/30"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {user?.role === "professor" && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Designation</label>
                <select
                  value={formData.facultyType}
                  onChange={(e) => setFormData({ ...formData, facultyType: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm text-slate-800 font-medium hover:border-primary/30"
                >
                  <option value="">Select Designation</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/20 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap size={16} className="text-primary" />
              Academic Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Program</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm text-slate-800 font-medium hover:border-primary/30"
                >
                  <option value="">Select Program</option>
                  <option value="BTech">BTech</option>
                  <option value="MTech">MTech</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm text-slate-800 font-medium hover:border-primary/30"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Branch</label>
                <select
                  value={branches.includes(formData.branch) ? formData.branch : formData.branch === "" ? "" : "Other"}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value === "Other" ? "" : e.target.value })}
                  className="w-full p-3 mb-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm text-slate-800 font-medium hover:border-primary/30"
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>

                {(formData.branch === "" || !branches.includes(formData.branch)) && (
                  <input
                    type="text"
                    placeholder="Enter your custom branch title"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm hover:border-primary/30"
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/20 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield size={16} className="text-primary" />
              Security & Credentials
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Old Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm hover:border-primary/30"
                  placeholder="Verify old password to commit modifications"
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">New Password (Optional)</label>
                  <input
                    type="password"
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm hover:border-primary/30"
                    placeholder="Enter new password code"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 bg-white text-sm hover:border-primary/30"
                    placeholder="Confirm new password code"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm transition-all duration-200 shadow-2xs hover:border-primary hover:text-primary hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 focus:ring-4 focus:ring-slate-900/30"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}