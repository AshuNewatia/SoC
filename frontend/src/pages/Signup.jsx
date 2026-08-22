import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { User, Mail, Lock, UserPlus, ArrowRight, ArrowLeft } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa'; 
import logo from '../assets/logo.png';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, [location]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

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
      redirect_uri: "http://localhost:5173/oauth/callback",
      scope: 'user:email',
    };
    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-blue-50 via-sky-50 to-indigo-50 font-sans">
      {/* Premium gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 sm:w-72 sm:h-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 sm:w-80 sm:h-80 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 sm:w-60 sm:h-60 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-violet-200/20 blur-3xl" />
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.4),transparent_70%)]" />
      </div>

      {/* Back to Home Button - Top Left Corner */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate("/")}
          className="group inline-flex items-center gap-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-x-1 hover:bg-white hover:shadow-md"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back to Home
        </button>
      </div>

      {/* Centered container with vertical padding */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md lg:max-w-lg">
          
          {/* Glass card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] border border-white/60 px-8 pt-8 pb-8 transition-all duration-500 hover:shadow-[0_30px_80px_rgba(37,99,235,0.18)]">
            
            {/* Brand Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img src={logo} alt="CampusFlow" className="h-12 w-12 rounded-2xl shadow-lg" />
                <h1 className="text-4xl font-bold text-blue-600 tracking-tight">
                  CampusFlow
                </h1>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Join the Community
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                Start collaborating with your team
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            {/* REGISTRATION FORM */}
            <form onSubmit={handleSignup}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all duration-200 hover:border-primary/40"
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">IITI Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@iiti.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all duration-200 hover:border-primary/40"
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all duration-200 hover:border-primary/40"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all duration-200 hover:border-primary/40"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:scale-[1.01] hover:shadow-lg active:scale-95 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 cursor-pointer group"
                >
                  <UserPlus className="w-5 h-5" />
                  {loading ? 'Creating Account...' : 'Create Account'}
                  {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </button>
              </form>

            {/* OAuth Separator */}
            <div className="relative my-7">
              <div className="border-t border-slate-200" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white/90 px-3 text-xs font-medium text-slate-400 backdrop-blur-sm">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2 text-slate-700 font-medium text-sm cursor-pointer hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-md"
              >
                <FaGoogle className="text-red-500" />
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubLogin}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2 text-slate-700 font-medium text-sm cursor-pointer hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-md"
              >
                <FaGithub />
                GitHub
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </a>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
            By joining, you agree to CampusFlow's Code of Conduct
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;