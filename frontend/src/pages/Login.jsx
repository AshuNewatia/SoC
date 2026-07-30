import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa'; 
import api from '../services/api'; 
import logo from '../assets/logo.png';

function Login() {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); 
  const [newPassword, setNewPassword] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate(); 
  const location = useLocation();

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
        await api.post('api/auth/forgot-password', { email });
        setView('otp');
      } else if (view === 'otp') {
        await api.post('/api/auth/reset-password', { email, otp, newPassword });
        alert("Password reset successfully! Please log in.");
        setView('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed';
      setError(message);
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
      redirect_uri: `${window.location.origin}/oauth/callback`, 
      scope: 'user:email',
    };
    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-blue-50 via-sky-50 to-indigo-50">
      {/* Premium gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 sm:w-72 sm:h-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 sm:w-80 sm:h-80 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 sm:w-60 sm:h-60 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-violet-200/20 blur-3xl" />
        
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md lg:max-w-lg">
          
          {/* Header Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-t-2xl shadow-lg border border-white px-8 pt-8 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="CampusFlow" className="h-12 w-12 rounded-2xl shadow-lg" />
              <h1 className="text-3xl font-bold text-blue-600 tracking-tight">CampusFlow</h1>
            </div>
            <h2 className="text-slate-800 text-2xl font-bold">
              {view === 'login' ? 'Welcome back' : 'Account Recovery'}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              {view === 'login' ? 'Sign in to your collaborative workspace' : 'Follow the steps to reset your password'}
            </p>
          </div>

          {/* Main Form Card */}
          <div className="backdrop-blur-xl bg-white/60 rounded-b-2xl shadow-xl border-x border-b border-white px-8 pb-8 pt-6">
            
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* --- LOGIN VIEW --- */}
              {view === 'login' && (
                <>
                  <div className="mb-5">
                    <label className="block text-slate-700 text-sm font-medium mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="you@iiti.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-primary/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-slate-700 text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-primary/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mb-6">
                    <button 
                      type="button" 
                      onClick={() => setView('forgot')} 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 hover:translate-x-1"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </>
              )}

              {/* --- FORGOT PASSWORD VIEW --- */}
              {view === 'forgot' && (
                <div className="mb-6">
                  <label className="block text-slate-700 text-sm font-medium mb-2">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="you@iiti.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-primary/40"
                      required
                    />
                  </div>
                </div>
              )}

              {/* --- OTP VERIFICATION VIEW --- */}
              {view === 'otp' && (
                <>
                  <div className="mb-5">
                    <label className="block text-slate-700 text-sm font-medium mb-2">Enter OTP</label>
                    <input
                      type="text"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-primary/40 tracking-widest"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-slate-700 text-sm font-medium mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-primary/40"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 hover:scale-[1.01] hover:shadow-lg active:scale-95 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                {loading ? 'Processing...' : view === 'login' ? 'Sign In' : 'Continue'}
              </button>
            </form>

            {/* --- BACK BUTTON (Only shows during password reset) --- */}
            {view !== 'login' && (
              <button 
                type="button" 
                onClick={() => setView('login')} 
                className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-all duration-200 hover:translate-x-1"
              >
                <ArrowLeft size={16} /> Back to Login
              </button>
            )}

            {/* --- OAUTH AND SIGNUP (Only shows on Login view) --- */}
            {view === 'login' && (
              <>
                <div className="relative my-6 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="absolute bg-white/60 px-3 text-xs text-slate-400 uppercase tracking-wider">
                    Or continue with
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium transition-all duration-200 text-sm shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <FaGoogle className="w-4 h-4 text-red-500" />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={handleGithubLogin}
                    className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium transition-all duration-200 text-sm shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <FaGithub className="w-4 h-4 text-slate-900" />
                    GitHub
                  </button>
                </div>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-blue-600 font-semibold hover:underline">
                    Create account
                  </a>
                </p>
              </>
            )}

          </div>

          <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            Secured with IIT Indore SSO
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;