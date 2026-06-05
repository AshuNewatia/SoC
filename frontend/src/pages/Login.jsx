import { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
// Import official brand icons
import { FaGoogle, FaGithub } from 'react-icons/fa'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- OAUTH INITIATORS (Configured for port 5173) ---
  const handleGoogleLogin = () => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: 'http://localhost:5173/oauth/callback', // Matches Vite port config
      client_id: '504301300518-n1dds4ima2782diua2pfsft0q50o8bft.apps.googleusercontent.com', 
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };
    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  const handleGithubLogin = () => {
    const rootUrl = 'https://github.com/login/oauth/authorize';
    const options = {
      client_id: 'Ov23liAjvQDdoB6Ix9s4', 
      redirect_uri: 'http://localhost:5173/oauth/callback', 
      scope: 'user:email',
    };
    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-blue-900">
      {/* Decorative blurred circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      {/* Main container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Brand header above card */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
              <span className="text-white font-bold text-2xl">IIT </span>
              <span className="text-white font-bold text-2xl">Indore</span>
            </div>
            <h1 className="text-white text-4xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-white/70 mt-2">Sign in to your collaborative workspace</p>
          </div>

          {/* Glass card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8">
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-white rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email field with icon */}
              <div className="mb-5">
                <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="you@iiti.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Password field with icon */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-primary font-semibold py-3 rounded-xl hover:bg-white/90 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* --- VISUAL DIVIDER AND OAUTH BUTTONS --- */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="border-t border-white/20 w-full"></div>
              <span className="absolute bg-transparent px-3 text-xs text-white/50 uppercase tracking-wider backdrop-blur-sm">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition duration-200 text-sm"
              >
                <FaGoogle className="w-4 h-4 text-red-400" />
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition duration-200 text-sm"
              >
                <FaGithub className="w-4 h-4" />
                GitHub
              </button>
            </div>
            {/* --- END OF OAUTH SECTION --- */}

            {/* Signup link */}
            <p className="mt-6 text-center text-sm text-white/70">
              Don't have an account?{' '}
              <a href="/signup" className="text-white font-semibold hover:underline">
                Create account
              </a>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-white/50 text-xs mt-8">
            Secured with 🔐 IIT Indore SSO
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;