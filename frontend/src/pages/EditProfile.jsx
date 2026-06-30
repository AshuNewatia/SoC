import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import api from '../services/api';
import { handleSuccess } from '../utils/handleApiError';

export default function EditProfile({ isOpen, onClose }) {
  const { user, setUser } = useAuth();

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
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        {user?.role === "professor" && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Designation
            </label>

            <select
              value={formData.facultyType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  facultyType: e.target.value,
                })
              }
              className="w-full p-3 border border-slate-200 rounded-xl"
            >
              <option value="">Select Designation</option>
              <option value="Assistant Professor">
                Assistant Professor
              </option>
              <option value="Associate Professor">
                Associate Professor
              </option>
              <option value="Professor">
                Professor
              </option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Program
              </label>

              <select
                value={formData.program}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    program: e.target.value,
                  })
                }
                className="w-full p-3 mb-4 border border-slate-200 rounded-xl"
              >
                <option value="">Select Program</option>
                <option value="BTech">BTech</option>
                <option value="MTech">MTech</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</label>
            <select
              value={formData.year}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: e.target.value,
                })
              }
              className="w-full p-3 mb-4 border border-slate-200 rounded-xl"
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Branch
            </label>

            <select
              value={branches.includes(formData.branch)
                ? formData.branch
                : "Other"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  branch: e.target.value === "Other" ? "" : e.target.value,
                })
              }
              className="w-full p-3 mb-3 border border-slate-200 rounded-xl"
            >
              <option value="">Select Branch</option>

              {branches.map(branch => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

            {(
              formData.branch === "" ||
              !branches.includes(formData.branch)
            ) && (
                <input
                  type="text"
                  placeholder="Enter your branch"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branch: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              )}
          </div>
        </div>

        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security</label>
        <input
          type="password"
          className="w-full p-3 mb-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Old Password (required)"
          onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
        />
        <input
          type="password"
          className="w-full p-3 mb-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="New Password (optional)"
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
        />

        {/* 3. The new Confirm Password input field */}
        <input
          type="password"
          className="w-full p-3 mb-6 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Confirm New Password"
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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