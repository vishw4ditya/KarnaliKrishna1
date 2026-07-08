import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, Lock, Phone, ArrowRight, ShieldCheck, Globe, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login, loginGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot Password Mode State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotId, setForgotId] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const hasAlphabet = /[a-zA-Z]/.test(forgotNewPassword);
    const hasDigit = /[0-9]/.test(forgotNewPassword);
    if (!hasAlphabet || !hasDigit) {
      setError('Password must contain a mix of alphabets and digits');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        customId: forgotId.trim(),
        phone: forgotPhone.trim(),
        newPassword: forgotNewPassword,
      });

      if (res.data.success) {
        setInfoMsg(res.data.message || 'Password reset successful! Please log in.');
        setShowForgot(false);
        // Clear forgot inputs
        setForgotId('');
        setForgotPhone('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      } else {
        setError(res.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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
        
        {showForgot ? (
          <div>
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">Reset Password</h2>
              <p className="text-sm text-slate-500 mt-1.5">Enter your Custom ID and phone number to reset your password</p>
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

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Custom ID (e.g. SA123456 or BH654321)</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your Custom ID"
                  value={forgotId}
                  onChange={(e) => setForgotId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Phone Number (registered with profile)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+977-9800000000"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Reset Password</span>}
              </button>
            </form>

            <button
              onClick={() => { setShowForgot(false); setError(''); setInfoMsg(''); }}
              className="flex items-center justify-center gap-1.5 mt-5 mx-auto text-xs text-slate-500 dark:text-slate-400 font-bold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <div>
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
                  <span onClick={() => { setShowForgot(true); setError(''); setInfoMsg(''); }} className="text-[10px] text-primary-500 font-semibold cursor-pointer hover:underline">Forgot?</span>
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
        )}

      </div>
    </div>
  );
};

export default Login;
