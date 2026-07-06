import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Edit3, Trash2, X, Save, MapPin, Phone, CheckCircle, Loader2 } from 'lucide-react';

const BranchManagement = () => {
  const { t } = useLanguage();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editBranchId, setEditBranchId] = useState(null); // null means adding

  // Form Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branches');
      if (res.data.success) {
        setBranches(res.data.branches);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditBranchId(null);
    setName('');
    setAddress('');
    setContactNumber('');
    setStatus('active');
    setShowModal(true);
  };

  const openEditModal = (b) => {
    setEditBranchId(b._id);
    setName(b.name);
    setAddress(b.address);
    setContactNumber(b.contactNumber);
    setStatus(b.status);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = { name, address, contactNumber, status };

    try {
      let res;
      if (editBranchId) {
        res = await api.put(`/branches/${editBranchId}`, payload);
      } else {
        res = await api.post('/branches', payload);
      }

      if (res.data.success) {
        setShowModal(false);
        fetchBranches();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving branch');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch? All products matching this branch will be affected.')) return;
    try {
      const res = await api.delete(`/branches/${id}`);
      if (res.data.success) {
        fetchBranches();
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Branch Management</h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">Create and administer branches, warehouses and logistics hubs across Nepal.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Branch</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          Loading branch catalog...
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs animate-fade-in">
          No branches configured. Click "Create Branch" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in text-xs font-semibold">
          {branches.map((b) => (
            <div
              key={b._id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm leading-tight capitalize">
                    {b.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-400'}`}>
                    {b.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-500 font-medium">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{b.contactNumber}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4">
                <button
                  onClick={() => openEditModal(b)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 border border-slate-200 dark:border-slate-855 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-250 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteBranch(b._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 border border-rose-500/10 text-rose-500 hover:bg-rose-500/5 rounded-xl font-bold transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal drawer */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-fade-in text-xs">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                {editBranchId ? 'Edit Branch Details' : 'Create New Branch'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pokhara Lakeside"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Location Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lakeside Ward 6, Pokhara"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Contact Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +977-61-555555"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editBranchId ? 'Save Branch' : 'Create Branch'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default BranchManagement;
