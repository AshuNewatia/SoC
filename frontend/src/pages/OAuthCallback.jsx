import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function OAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      if (!code) {
        navigate('/signup?error=No code returned from provider');
        return;
      }

      const provider = searchParams.get('state');
      const isGoogle = provider === 'google';
      
      // Dynamic backend URL handling for Render and Localhost
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const backendUrl = isGoogle
        ? `${API_BASE_URL}/api/auth/google`
        : `${API_BASE_URL}/api/auth/github`;

      try {
        const response = await axios.post(backendUrl, { code });
        const { action, token, tempToken, user, message } = response.data;

        // INTERCEPT: Route new users to Create Profile with their temporary token
        if (action === 'requires_profile_creation') {
          navigate('/create-profile', { 
            state: { tempToken, message } 
          });
          return;
        }

        // LOGIN: Route existing users straight to the dashboard
        if (action === 'login') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/dashboard'); 
        }

      } catch (err) {
        console.error(err);
        const serverMessage = err.response?.data?.message || 'OAuth Verification Failed';
        navigate(`/signup?error=${encodeURIComponent(serverMessage)}`);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary to-blue-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium tracking-wide">Authenticating with IIT Indore servers...</p>
    </div>
  );
}

export default OAuthCallback;