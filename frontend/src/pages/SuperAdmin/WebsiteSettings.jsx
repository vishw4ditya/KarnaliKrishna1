import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Settings, Save, CheckCircle, Loader2, Plus, Edit3, Trash2, X, Upload, Ticket } from 'lucide-react';

const WebsiteSettings = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('settings');

  // Website Settings States
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [vatRate, setVatRate] = useState(13);
  const [shippingCharge, setShippingCharge] = useState(100);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [fonepayMerchantCode, setFonepayMerchantCode] = useState('');
  const [fonepayStoreCode, setFonepayStoreCode] = useState('');
  const [fonepaySecretKey, setFonepaySecretKey] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Category Management States
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catFile, setCatFile] = useState(null);
  const [savingCat, setSavingCat] = useState(false);

  // Coupon Management States
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editCouponId, setEditCouponId] = useState(null);
  
  // Coupon Form Fields
  const [cpCode, setCpCode] = useState('');
  const [cpDiscountType, setCpDiscountType] = useState('percentage');
  const [cpDiscountValue, setCpDiscountValue] = useState(0);
  const [cpExpiryDate, setCpExpiryDate] = useState('');
  const [cpMinOrderAmount, setCpMinOrderAmount] = useState(0);
  const [cpMaxDiscount, setCpMaxDiscount] = useState(0);
  const [cpIsActive, setCpIsActive] = useState(true);
  const [savingCoupon, setSavingCoupon] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        setSiteName(s.siteName);
        setContactEmail(s.contactEmail);
        setContactPhone(s.contactPhone);
        setAddress(s.address);
        setVatRate(s.vatRate);
        setShippingCharge(s.shippingCharge);
        setMaintenanceMode(s.maintenanceMode);
        setFonepayMerchantCode(s.fonepayMerchantCode || '');
        setFonepayStoreCode(s.fonepayStoreCode || '');
        setFonepaySecretKey(s.fonepaySecretKey || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCatLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponLoading(true);
    try {
      const res = await api.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await api.put('/settings', {
        siteName,
        contactEmail,
        contactPhone,
        address,
        vatRate: Number(vatRate),
        shippingCharge: Number(shippingCharge),
        maintenanceMode,
        fonepayMerchantCode,
        fonepayStoreCode,
        fonepaySecretKey,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update website settings');
    } finally {
      setSaving(false);
    }
  };

  // Category Actions
  const openAddCatModal = () => {
    setEditCatId(null);
    setCatName('');
    setCatDesc('');
    setCatFile(null);
    setShowCatModal(true);
  };

  const openEditCatModal = (cat) => {
    setEditCatId(cat._id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatFile(null);
    setShowCatModal(true);
  };

  const handleCatFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCatFile(e.target.files[0]);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSavingCat(true);

    const formData = new FormData();
    formData.append('name', catName);
    formData.append('description', catDesc);
    if (catFile) {
      formData.append('image', catFile);
    }

    try {
      let res;
      if (editCatId) {
        res = await api.put(`/categories/${editCatId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        setShowCatModal(false);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will affect products in this category.')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete category');
    }
  };

  // Coupon Actions
  const openAddCouponModal = () => {
    setEditCouponId(null);
    setCpCode('');
    setCpDiscountType('percentage');
    setCpDiscountValue(0);
    // Default expiry date to 7 days from now (YYYY-MM-DD)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    setCpExpiryDate(futureDate.toISOString().split('T')[0]);
    setCpMinOrderAmount(0);
    setCpMaxDiscount(0);
    setCpIsActive(true);
    setShowCouponModal(true);
  };

  const openEditCouponModal = (cp) => {
    setEditCouponId(cp._id);
    setCpCode(cp.code);
    setCpDiscountType(cp.discountType);
    setCpDiscountValue(cp.discountValue);
    setCpExpiryDate(new Date(cp.expiryDate).toISOString().split('T')[0]);
    setCpMinOrderAmount(cp.minOrderAmount || 0);
    setCpMaxDiscount(cp.maxDiscount || 0);
    setCpIsActive(cp.isActive);
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    setSavingCoupon(true);

    const payload = {
      code: cpCode.toUpperCase().trim(),
      discountType: cpDiscountType,
      discountValue: Number(cpDiscountValue),
      expiryDate: cpExpiryDate,
      minOrderAmount: Number(cpMinOrderAmount),
      maxDiscount: Number(cpMaxDiscount),
      isActive: cpIsActive,
    };

    try {
      let res;
      if (editCouponId) {
        res = await api.put(`/coupons/${editCouponId}`, payload);
      } else {
        res = await api.post('/coupons', payload);
      }

      if (res.data.success) {
        setShowCouponModal(false);
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.data.success) {
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete coupon');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading website configurations...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Platform Control Hub</h1>
        <p className="text-xs text-slate-400 mt-1 font-semibold">Configure platform parameters, manage product categories, and issue promotional coupon keys.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs font-bold uppercase border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {t('settings')}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-xs font-bold uppercase border-b-2 transition-all ${
            activeTab === 'categories'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {t('allCategories')}
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 text-xs font-bold uppercase border-b-2 transition-all ${
            activeTab === 'coupons'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {t('coupons')}
        </button>
      </div>

      {/* Tab 1: System Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-xs font-semibold animate-fade-in">
          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Website configurations updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmitSettings} className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-400">Site Display Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400">Contact Office Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">VAT Rate (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Standard Delivery Charge (Rs.)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={shippingCharge}
                  onChange={(e) => setShippingCharge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Fonepay Integration Credentials */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
              <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Fonepay Integration Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Fonepay Merchant Code</label>
                  <input
                    type="text"
                    value={fonepayMerchantCode}
                    onChange={(e) => setFonepayMerchantCode(e.target.value)}
                    placeholder="e.g. MS-001-TEST"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Fonepay Store Code</label>
                  <input
                    type="text"
                    value={fonepayStoreCode}
                    onChange={(e) => setFonepayStoreCode(e.target.value)}
                    placeholder="e.g. ST-001"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Fonepay Secret Key</label>
                  <input
                    type="password"
                    value={fonepaySecretKey}
                    onChange={(e) => setFonepaySecretKey(e.target.value)}
                    placeholder="e.g. secret_api_key_here"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-white select-none">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded"
                />
                <span>Enable Maintenance Mode (Block Customer Shopping)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Category Management */}
      {activeTab === 'categories' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Product Categories</h2>
            <button
              onClick={openAddCatModal}
              className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {catLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
              No categories registered yet. Click "Add Category" to create one.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold uppercase">
                      <th className="p-4">Image</th>
                      <th className="p-4">Category Name</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categories.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-semibold">
                        <td className="p-4">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                            {c.imageUrl ? (
                              <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-slate-400">No Image</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-slate-900 dark:text-white capitalize">
                          {c.name}
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 truncate max-w-[250px]">
                          {c.description || 'No description provided'}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditCatModal(c)}
                              className="p-1.5 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Category"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c._id)}
                              className="p-1.5 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Coupon Management */}
      {activeTab === 'coupons' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="w-4.5 h-4.5 text-primary-500" />
              <span>Promotional Coupons</span>
            </h2>
            <button
              onClick={openAddCouponModal}
              className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          {couponLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
              No promotional coupons registered yet. Click "Create Coupon" to issue one.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold uppercase">
                      <th className="p-4">Coupon Code</th>
                      <th className="p-4">Discount Details</th>
                      <th className="p-4">Constraints</th>
                      <th className="p-4">Expiry Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {coupons.map((cp) => (
                      <tr key={cp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-semibold">
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-750 dark:text-primary-400 border border-primary-500/10 rounded-lg text-xs font-black uppercase tracking-wider">
                            {cp.code}
                          </span>
                        </td>
                        <td className="p-4 text-slate-850 dark:text-white">
                          {cp.discountType === 'percentage' ? (
                            <span>{cp.discountValue}% Off</span>
                          ) : (
                            <span>Rs. {cp.discountValue} Off</span>
                          )}
                        </td>
                        <td className="p-4 space-y-0.5 text-slate-500 dark:text-slate-400">
                          <p>Min Order: Rs. {cp.minOrderAmount || 0}</p>
                          {cp.maxDiscount > 0 && <p>Max Cap: Rs. {cp.maxDiscount}</p>}
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400">
                          {new Date(cp.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${cp.isActive && new Date(cp.expiryDate) > new Date() ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {cp.isActive && new Date(cp.expiryDate) > new Date() ? 'Active' : 'Expired/Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditCouponModal(cp)}
                              className="p-1.5 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Coupon"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(cp._id)}
                              className="p-1.5 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Add/Edit Drawer Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-fade-in text-xs font-semibold">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                {editCatId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Tea"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Description</label>
                <textarea
                  rows="3"
                  placeholder="Provide short category information..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Category Cover Image</label>
                <div className="relative border border-dashed border-slate-250 dark:border-slate-800 hover:border-primary-500 rounded-2xl p-4 text-center transition-all bg-slate-50 dark:bg-slate-950 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCatFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 block">
                    {catFile ? catFile.name : 'Select category image cover'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  {savingCat ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editCatId ? 'Save Changes' : 'Create Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Coupon Add/Edit Drawer Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-fade-in text-xs font-semibold">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                {editCouponId ? 'Edit Promo Coupon' : 'Create Promo Coupon'}
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Coupon Key Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DASHAIN20"
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Discount Type</label>
                  <select
                    value={cpDiscountType}
                    onChange={(e) => setCpDiscountType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Price Amount (Rs.)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={cpDiscountValue}
                    onChange={(e) => setCpDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Min Purchase (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={cpMinOrderAmount}
                    onChange={(e) => setCpMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Max Discount Limit (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={cpMaxDiscount}
                    onChange={(e) => setCpMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                    placeholder="0 for no limit"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={cpExpiryDate}
                  onChange={(e) => setCpExpiryDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-850 dark:text-white select-none">
                  <input
                    type="checkbox"
                    checked={cpIsActive}
                    onChange={(e) => setCpIsActive(e.target.checked)}
                    className="rounded"
                  />
                  <span>Activate Coupon Immediately</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  {savingCoupon ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editCouponId ? 'Save Changes' : 'Create Coupon'}</span>
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

export default WebsiteSettings;
