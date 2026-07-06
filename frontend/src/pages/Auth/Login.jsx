import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, Lock, Phone, ArrowRight, ShieldCheck, Globe, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, loginGoogle, loginOTP } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Mode State
  const [useOtp, setUseOtp] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Route according to role
        if (res.user.role === 'super_admin') {
          navigate('/admin/dashboard');
        } else if (res.user.role === 'branch_head') {
          navigate('/branch/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!otpSent) {
        // Send OTP
        const res = await loginOTP(phone, '', 'send');
        if (res.success) {
          setOtpSent(true);
          setInfoMsg("OTP code '123456' sent (simulated).");
        } else {
          setError(res.message);
        }
      } else {
        // Verify OTP
        const res = await loginOTP(phone, otpCode, 'verify');
        if (res.success) {
          navigate('/');
        } else {
          setError(res.message || 'Invalid OTP');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    
    if (typeof window.google === 'undefined') {
      setError('Google Sign-In service is currently loading or unavailable. Please check your internet connection and refresh.');
      return;
    }

    try {
      setLoading(true);
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '333776092050-177k3lba6rf24oc6h38ftojacg36igsv.apps.googleusercontent.com',
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // Fetch user details from Google API using the access token
              const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`);
              const userInfo = await userInfoRes.json();
              
              if (userInfo && userInfo.email) {
                const res = await loginGoogle({
                  name: userInfo.name || userInfo.given_name || 'Google User',
                  email: userInfo.email,
                  googleId: userInfo.sub,
                  imageUrl: userInfo.picture || '',
                });
                
                if (res.success) {
                  navigate('/');
                } else {
                  setError(res.message || 'Google Sign-In failed');
                }
              } else {
                setError('Could not fetch user details from Google');
              }
            } catch (err) {
              console.error(err);
              setError('Failed to retrieve Google profile info');
            } finally {
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        },
        error_callback: (err) => {
          console.error(err);
          setError('Google popup block or authorization error');
          setLoading(false);
        }
      });
      
      client.requestAccessToken();
    } catch (err) {
      console.error(err);
      setError('Error initializing Google login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">{t('welcomeBack')}</h2>
          <p className="text-sm text-slate-500 mt-1.5">Sign in to access your dashboard and shopping basket</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}
        {infoMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg">
            {infoMsg}
          </div>
        )}

        {/* Mode Toggler */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl mb-6">
          <button
            onClick={() => { setUseOtp(false); setError(''); setInfoMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!useOtp ? 'bg-white dark:bg-slate-900 shadow text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}
          >
            Email & Password
          </button>
          <button
            onClick={() => { setUseOtp(true); setError(''); setInfoMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${useOtp ? 'bg-white dark:bg-slate-900 shadow text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}
          >
            Mobile OTP
          </button>
        </div>

        {/* Forms */}
        {!useOtp ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
                <span className="text-[10px] text-primary-500 font-semibold cursor-pointer hover:underline">Forgot?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  disabled={otpSent}
                  placeholder="e.g. 9841000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Verification Code (OTP)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{otpSent ? 'Verify OTP' : 'Send Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center my-6 text-slate-400 text-xs font-semibold">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
          <span className="px-3">OR</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Google login button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 w-full py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all"
        >
          <Globe className="w-4.5 h-4.5 text-rose-500" />
          <span>Continue with Google</span>
        </button>

        {/* Links to Register */}
        <div className="mt-8 text-center text-xs space-y-2 text-slate-500">
          <div>
            New customer?{' '}
            <Link to="/register" className="text-primary-500 hover:underline font-bold">
              Create an account
            </Link>
          </div>
          <div>
            Merchant / Branch Owner?{' '}
            <Link to="/register-branch-head" className="text-primary-500 hover:underline font-bold">
              Register Branch Head
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
