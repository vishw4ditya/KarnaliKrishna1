import React, { useState, useEffect } from 'react';
import { api, getAssetUrl } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, ShieldAlert, Calendar, Loader2, Edit3, Trash2, X } from 'lucide-react';

const BranchHeadApproval = () => {
  const { t } = useLanguage();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHead, setSelectedHead] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBranchId, setEditBranchId] = useState('');
  const [editStatus, setEditStatus] = useState('approved');
  const [editPassword, setEditPassword] = useState('');
  const [branches, setBranches] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/branch-heads');
      if (res.data.success) {
        setApplicants(res.data.branchHeads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data.success) {
        setBranches(res.data.branches);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this Branch Head application?`)) return;

    try {
      const res = await api.put(`/admin/branch-heads/${id}/status`, { status });
      if (res.data.success) {
        fetchApplicants();
      }
    } catch (err) {
      console.error(err);
      alert('Action failed');
    }
  };

  const handleOpenEditModal = (head) => {
    setSelectedHead(head);
    setEditName(head.name || '');
    setEditEmail(head.email || '');
    setEditPhone(head.phone || '');
    setEditBranchId(head.branchId || '');
    setEditStatus(head.status || 'approved');
    setEditPassword('');
    setShowEditModal(true);
    fetchBranches();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim()) {
      alert('Name, email, and phone are required.');
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        status: editStatus,
        branchId: editBranchId || null,
      };
      if (editPassword.trim()) {
        payload.password = editPassword;
      }

      const res = await api.put(`/admin/branch-heads/${selectedHead._id}`, payload);
      if (res.data.success) {
        setShowEditModal(false);
        fetchApplicants();
        alert('Branch Head details updated successfully.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update branch head details.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteBranchHead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch head account? This action is irreversible.')) return;
    try {
      const res = await api.delete(`/admin/branch-heads/${id}`);
      if (res.data.success) {
        fetchApplicants();
        alert('Branch head deleted successfully.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete branch head.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Branch Head Registrations</h1>
        <p className="text-xs text-slate-400 mt-1 font-semibold">Review profile details before approving branch access.</p>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          Loading registrations list...
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs animate-fade-in">
          No branch head applications received yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-fade-in text-xs font-semibold">
          {applicants.map((head) => (
            <div
              key={head._id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1 min-w-0">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {head.profilePhotoUrl ? (
                    <img 
                      src={getAssetUrl(head.profilePhotoUrl)} 
                      alt="Profile" 
                      className="w-14 h-14 rounded-full object-cover border border-primary-500/20 shadow-sm" 
                    />
                  ) : (
                    <div className="w-14 h-14 bg-primary-100 dark:bg-primary-950/30 text-primary-600 rounded-full flex items-center justify-center text-lg font-bold font-sans shadow-sm">
                      {head.name?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-base leading-tight">
                      {head.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase font-mono font-bold">
                        ID: {head.customId || 'PENDING'}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase">
                        {head.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize ${head.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : head.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                        {head.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-500 font-medium">
                    <p>Email: <span className="text-slate-800 dark:text-slate-200">{head.email}</span></p>
                    <p>Phone: <span className="text-slate-800 dark:text-slate-200">{head.phone}</span></p>
                    <p>Branch: <span className="text-primary-600 font-bold">{head.branchName || 'Not Assigned'}</span></p>
                    <p className="flex items-center gap-1 justify-center sm:justify-start">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Applied {new Date(head.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
                {head.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(head._id, 'approved')}
                      className="flex items-center justify-center gap-1 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow transition-all active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(head._id, 'rejected')}
                      className="flex items-center justify-center gap-1 px-4.5 py-2.5 border border-rose-500/10 text-rose-500 hover:bg-rose-500/5 rounded-xl font-bold transition-all"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handleOpenEditModal(head)}
                  className="flex items-center justify-center gap-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl font-bold transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteBranchHead(head._id)}
                  className="flex items-center justify-center gap-1 px-4 py-2.5 border border-rose-500/25 hover:bg-rose-500/5 text-rose-500 rounded-xl font-bold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-fade-in text-xs font-semibold text-slate-600 dark:text-slate-350">
            
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              Edit Branch Head Details
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch Assignment</label>
                <select
                  value={editBranchId}
                  onChange={(e) => setEditBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="">Select Branch...</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BranchHeadApproval;
