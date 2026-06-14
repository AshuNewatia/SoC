import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
// Import official brand icons
import { FaGoogle, FaGithub } from 'react-icons/fa'; 


function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  setError('');
  setLoading(true); // <--- CORRECTED: Use the setter function
  try {
    await signup(name, email, password);
    navigate('/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Signup failed');
  } finally {
    setLoading(false); // <--- CORRECTED: Use the setter function
  }
};


  // --- NEW: OAUTH INITIATORS ---
  const handleGoogleLogin = () => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: "https://soc-frontend.onrender.com/oauth/callback", // Your frontend callback route
      client_id: '504301300518-n1dds4ima2782diua2pfsft0q50o8bft.apps.googleusercontent.com', // Put your Client ID here
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
      client_id: 'Ov23liAjvQDdoB6Ix9s4', // Put your GitHub Client ID here
      redirect_uri: "https://soc-frontend.onrender.com/oauth/callback",
      scope: 'user:email',
    };
    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-blue-900">
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
              <span className="text-white font-bold text-2xl">IIT </span>
              <span className="text-white font-bold text-2xl">Indore</span>
            </div>
            <h1 className="text-white text-4xl font-bold tracking-tight">Join the community</h1>
            <p className="text-white/70 mt-2">Start collaborating with your team</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8">
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-white rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-5">
                <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="block text-white/80 text-sm font-medium mb-2">IITI Email</label>
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

              {/* Password */}
              <div className="mb-5">
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

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-primary font-semibold py-3 rounded-xl hover:bg-white/90 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-5 h-5" />
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            {/* --- NEW: VISUAL DIVIDER AND SOCIAL LOGIN BUTTONS --- */}
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
            {/* --- END OF OAUTH VISUAL CHANGES --- */}

            <p className="mt-6 text-center text-sm text-white/70">
              Already have an account?{' '}
              <a href="/login" className="text-white font-semibold hover:underline">
                Sign in
              </a>
            </p>
          </div>

          <p className="text-center text-white/50 text-xs mt-8">
            By joining, you agree to IIT Indore's Code of Conduct
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;