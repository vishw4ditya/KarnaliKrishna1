import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User as UserIcon, Mail, Phone, Lock, Loader2 } from 'lucide-react';

const RegisterBranchHead = () => {
  const { registerBranchHead } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Branch options
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch current branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        if (res.data.success) {
          setBranches(res.data.branches);
          if (res.data.branches.length > 0) {
            setSelectedBranchId(res.data.branches[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching branches list', err);
      }
    };
    fetchBranches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const payload = {
      name,
      email,
      phone,
      password,
    };

    if (selectedBranchId === 'new') {
      if (!newBranchName.trim()) {
        setError('Please specify the new branch name.');
        setLoading(false);
        return;
      }
      payload.branchName = newBranchName;
    } else {
      const match = branches.find((b) => b._id === selectedBranchId);
      payload.branchId = selectedBranchId;
      payload.branchName = match ? match.name : '';
    }

    try {
      const res = await registerBranchHead(payload);
      if (res.success) {
        setSuccessMsg(res.message || 'Registration successful! Waiting for approval.');
        setTimeout(() => {
          navigate('/login');
        }, 4000);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-lg p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">Branch Head Application</h2>
          <p className="text-sm text-slate-500 mt-1.5">Apply to join as a vendor/manager. Pending Super Admin approval.</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Harry Dev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Mobile Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9851000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Password</label>
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
          </div>

          {/* Branch Select */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Assigned Branch</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} - {b.address}
                </option>
              ))}
              <option value="new">Create & Propose New Branch...</option>
            </select>
          </div>

          {selectedBranchId === 'new' && (
            <div className="animate-fade-in">
              <label className="text-xs font-bold text-primary-500 block mb-1">New Branch Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pokhara Lakeside"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 mt-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Application</span>}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-primary-500 hover:underline font-bold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterBranchHead;
