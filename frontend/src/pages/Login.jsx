import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
// Import official brand icons
import { FaGoogle, FaGithub } from 'react-icons/fa'; 
import api from '../services/api'; // Added for the forgot-password API calls

function Login() {
  const [view, setView] = useState('login'); // 'login', 'forgot', 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); // New state for OTP
  const [newPassword, setNewPassword] = useState(''); // New state for New Password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate(); 
  const location = useLocation();

  // --- Catch errors passed via URL from OAuthCallback ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (view === 'forgot') {
        await api.post('/auth/forgot-password', { email });
        setView('otp');
      } else if (view === 'otp') {
        await api.post('/auth/reset-password', { email, otp, newPassword });
        alert("Password reset successfully! Please log in.");
        setView('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- OAUTH INITIATORS ---
  const handleGoogleLogin = () => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: `${window.location.origin}/oauth/callback`, 
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
      redirect_uri: `${window.location.origin}/oauth/callback`, 
      scope: 'user:email',
    };
    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <div className="h-screen relative overflow-hidden bg-linear-to-br from-blue-50 via-sky-50 to-indigo-50">
      {/* Premium gradient mesh background with subtle network illustration */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft blurred shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-violet-200/20 blur-3xl" />
        {/* Faint network / research nodes illustration */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern id="nodes" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="2" fill="currentColor" />
            <path d="M40 40 L80 40 M40 40 L40 80 M40 40 L0 40 M40 40 L40 0" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#nodes)" />
        </svg>
        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.4),transparent_70%)]" />
      </div>

      {/* Centered container - no extra padding, uses full height */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {/* Glass card with hover depth */}
          <div className="bg-white/90 backdrop-blur-sm rounded-4xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-white/60 p-10 transition-all duration-500 hover:shadow-[0_30px_80px_rgba(37,99,235,0.18)]">
            
            {/* Brand - CampusFlow in BLUE, reduced bottom margin */}
            <div className="text-center mb-3">
              <h1 className="text-4xl font-bold text-blue-600 tracking-tight">
                CampusFlow
              </h1>
            </div>
            <h1 className="text-white text-4xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-white/70 mt-2">Sign in to your collaborative workspace</p>
          </div>

          {/* Glass card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8">
            
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 disabled:opacity-50 group"
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

          {/* Trust signal footer */}
          <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Secured with IIT Indore Authentication
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
