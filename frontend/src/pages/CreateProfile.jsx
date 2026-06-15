import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve the temporary token passed from the OAuthCallback component
  const tempToken = location.state?.tempToken;

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Security check: If someone tries to navigate to this page directly without 
  // going through Google/GitHub first, kick them back to the signup page.
  useEffect(() => {
    if (!tempToken) {
      navigate('/signup?error=Please start the signup process from the beginning.');
    }
  }, [tempToken, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic frontend validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setIsLoading(true);

    try {
      // Dynamic API URL for Local vs Render
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.post(`${API_BASE_URL}/api/auth/complete-oauth`, {
        tempToken,
        password: formData.password,
        // Only send the name if they typed one, otherwise the backend will 
        // fall back to the name pulled from their Google/GitHub account.
        ...(formData.name && { name: formData.name })
      });

      const { token, user } = response.data;

      // Save the official JWT session token and user details to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Successfully authenticated and profile created -> Redirect to dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete profile setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If there's no token, return null briefly to prevent layout flash before redirect
  if (!tempToken) return null;

  return (
    // Preserving your exact color palette from the OAuthCallback component
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex flex-col items-center justify-center text-white p-4">
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-semibold mb-2 tracking-wide">Complete Setup</h2>
        <p className="text-sm text-blue-200 mb-8">
          {location.state?.message || "Set a secure password to finalize your account creation."}
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-blue-100">
              Display Name <span className="text-blue-300 text-xs font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Leave blank to use OAuth profile name"
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 text-white placeholder-blue-200/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-blue-100">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-blue-100">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 text-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-4 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:bg-blue-50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-t-transparent border-blue-900 rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              'Create Profile & Login'
            )}
          </button>
        </form>
      </div>
      
    </div>
  );
}

export default CreateProfile;