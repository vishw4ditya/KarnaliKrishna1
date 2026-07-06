import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, X, Upload, Save, HelpCircle, Phone, Calendar, Loader2 } from 'lucide-react';

const IssueReporting = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [issueCategory, setIssueCategory] = useState('Delivery');
  const [issueDescription, setIssueDescription] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [status, setStatus] = useState('Open');
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, [user]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/issues');
      if (res.data.success) {
        setIssues(res.data.issues);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setIssueCategory('Delivery');
    setIssueDescription('');
    setResolutionDetails('');
    setStatus('Open');
    setFiles([]);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('customerName', customerName);
    formData.append('customerPhone', customerPhone);
    formData.append('customerAddress', customerAddress);
    formData.append('issueCategory', issueCategory);
    formData.append('issueDescription', issueDescription);
    formData.append('resolutionDetails', resolutionDetails);
    formData.append('status', status);

    files.forEach((file) => {
      formData.append('supportingImages', file);
    });

    try {
      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setShowModal(false);
        fetchIssues();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit issue report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Issue Tracking</h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Merchant resolution logger. Register and resolve issues filed by customers assigned to your branch.
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Customer Issue</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          Loading issues...
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs animate-fade-in">
          No customer issues filed for your branch.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold uppercase">
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Filer (Branch Head)</th>
                  <th className="p-4">Resolution Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {issues.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-semibold">
                    <td className="p-4 space-y-0.5">
                      <p className="font-extrabold text-slate-900 dark:text-white">{i.customerName}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {i.customerPhone}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-350">{i.issueCategory}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{i.branchHeadName}</td>
                    <td className="p-4 space-y-0.5 text-slate-500">
                      {i.resolutionDate ? (
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(i.resolutionDate).toLocaleDateString()}
                        </p>
                      ) : (
                        <span className="text-slate-400 italic">Not resolved yet</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${i.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : i.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 max-h-[90vh] animate-fade-in text-xs">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-950 dark:text-white">
                Log Resolved Customer Issue
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Customer Phone</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Customer Address</label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Category</label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="Delivery">Delivery</option>
                    <option value="Product Quality">Product Quality</option>
                    <option value="Billing">Billing</option>
                    <option value="Return/Refund">Return/Refund</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Issue Description</label>
                <textarea
                  required
                  rows="3"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Resolution Details</label>
                <textarea
                  rows="3"
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  placeholder="e.g. Delivery redelivered and client signed package..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                ></textarea>
              </div>

              {/* Upload Supporting Images */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Upload Supporting Images (Optional)</label>
                <div className="relative border-2 border-dashed border-slate-250 dark:border-slate-800 hover:border-primary-500 rounded-2xl p-4 text-center transition-all bg-slate-50 dark:bg-slate-950">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 block">
                    {files.length > 0 ? `${files.length} images selected` : 'Choose files'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                      <span>Log Issue</span>
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

export default IssueReporting;
