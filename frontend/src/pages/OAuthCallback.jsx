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

      // Detect if the request came from Google or GitHub 
      // Google search strings usually include a 'scope' parameter.
      const isGoogle = location.search.includes('scope');
      const backendUrl = isGoogle
        ? 'http://localhost:5000/api/auth/google'
        : 'http://localhost:5000/api/auth/github';

      try {
        const response = await axios.post(backendUrl, { code });
        const { token, user } = response.data;

        // Save token and user details to localStorage (or hook into your useAuth() context)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Successful authentication redirect
        navigate('/'); 
      } catch (err) {
        console.error(err);
        const serverMessage = err.response?.data?.message || 'OAuth Verification Failed';
        navigate(`/signup?error=${encodeURIComponent(serverMessage)}`);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium tracking-wide">Authenticating with IIT Indore servers...</p>
    </div>
  );
}

export default OAuthCallback;