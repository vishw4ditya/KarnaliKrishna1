import React, { useState, useEffect } from 'react';
import { api, useAuth, getAssetUrl } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Edit3, Trash2, X, Upload, Save, HelpCircle, Loader2 } from 'lucide-react';

const ProductManagement = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null); // null means adding

  // Form Fields
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [status, setStatus] = useState('active');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Specs key-values
  const [specsList, setSpecsList] = useState([{ key: '', value: '' }]);
  
  // Variants key-values (e.g., name: "Size", options: "S, M, L")
  const [variantsList, setVariantsList] = useState([{ name: '', options: '' }]);

  // Image Upload
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  // Category Quick Creation States
  const [showCatAddModal, setShowCatAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatFile, setNewCatFile] = useState(null);
  const [savingNewCat, setSavingNewCat] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch products filtered by the merchant's branch
      const res = await api.get('/products', { params: { branch: user.branchId, status: 'all' } });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0) {
          setSelectedCategory(res.data.categories[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditProductId(null);
    setName('');
    setSelectedCategory(categories[0]?._id || '');
    setDescription('');
    setOriginalPrice('');
    setSalePrice('');
    setStockQuantity('');
    setStatus('active');
    setIsFeatured(false);
    setSpecsList([{ key: '', value: '' }]);
    setVariantsList([{ name: '', options: '' }]);
    setFiles([]);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditProductId(p._id);
    setName(p.name);
    setSelectedCategory(p.category?._id || p.category);
    setDescription(p.description);
    setOriginalPrice(p.originalPrice);
    setSalePrice(p.salePrice);
    setStockQuantity(p.stockQuantity);
    setStatus(p.status);
    setIsFeatured(p.isFeatured);

    // Map specs
    const specsMap = p.specifications ? Object.entries(p.specifications).map(([key, value]) => ({ key, value })) : [];
    setSpecsList(specsMap.length > 0 ? specsMap : [{ key: '', value: '' }]);

    // Map variants
    const varsMap = p.variants ? p.variants.map((v) => ({ name: v.name, options: v.options.join(', ') })) : [];
    setVariantsList(varsMap.length > 0 ? varsMap : [{ name: '', options: '' }]);
    
    setFiles([]);
    setShowModal(true);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specsList];
    updated[index][field] = value;
    setSpecsList(updated);
  };

  const handleAddSpec = () => {
    setSpecsList([...specsList, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index) => {
    setSpecsList(specsList.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variantsList];
    updated[index][field] = value;
    setVariantsList(updated);
  };

  const handleAddVariant = () => {
    setVariantsList([...variantsList, { name: '', options: '' }]);
  };

  const handleRemoveVariant = (index) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Prepare specs JSON Map object
    const specsObject = {};
    specsList.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        specsObject[item.key.trim()] = item.value.trim();
      }
    });

    // Prepare variants array
    const variantsArray = [];
    variantsList.forEach((item) => {
      if (item.name.trim() && item.options.trim()) {
        variantsArray.push({
          name: item.name.trim(),
          options: item.options.split(',').map((opt) => opt.trim()).filter(Boolean),
        });
      }
    });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', selectedCategory);
    formData.append('branch', user.branchId);
    formData.append('description', description);
    formData.append('originalPrice', originalPrice);
    formData.append('salePrice', salePrice);
    formData.append('stockQuantity', stockQuantity);
    formData.append('status', status);
    formData.append('isFeatured', isFeatured);
    formData.append('specifications', JSON.stringify(specsObject));
    formData.append('variants', JSON.stringify(variantsArray));

    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      let res;
      if (editProductId) {
        res = await api.put(`/products/${editProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        setShowModal(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingNewCat(true);

    const formData = new FormData();
    formData.append('name', newCatName);
    formData.append('description', newCatDesc);
    if (newCatFile) {
      formData.append('image', newCatFile);
    }

    try {
      const res = await api.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setShowCatAddModal(false);
        // Refresh Category List
        const catRes = await api.get('/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
          setSelectedCategory(res.data.category._id);
        }
        setNewCatName('');
        setNewCatDesc('');
        setNewCatFile(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating category');
    } finally {
      setSavingNewCat(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action is irreversible.')) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        fetchProducts();
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">Manage your branch inventory, items, specifications, and sale details.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          Loading catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
          No products in your branch catalog. Click "Add Product" to create one.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold uppercase">
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (Rs.)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-semibold">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={getAssetUrl(p.images[0])} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]">{p.name}</p>
                        {p.isFeatured && (
                          <span className="text-[9px] text-amber-500 font-bold">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 capitalize">
                      {p.category?.name || 'Uncategorized'}
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="text-slate-850 dark:text-white">Rs. {p.salePrice}</p>
                      {p.salePrice < p.originalPrice && (
                        <p className="text-[10px] text-slate-400 line-through">Rs. {p.originalPrice}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stockQuantity <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4 capitalize">
                      <span className={`text-[10px] font-bold ${p.status === 'active' ? 'text-emerald-500' : p.status === 'draft' ? 'text-slate-400' : 'text-rose-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-1.5 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Product"
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

      {/* Edit/Add Modal drawer */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800 animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-950 dark:text-white">
                {editProductId ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-400">Category</label>
                    <button
                      type="button"
                      onClick={() => setShowCatAddModal(true)}
                      className="text-[10px] text-primary-500 hover:underline font-bold"
                    >
                      + Create New Category
                    </button>
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl capitalize"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Description</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                ></textarea>
              </div>

              {/* Prices and stock */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Original Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Sale Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft / Hidden</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer font-bold text-slate-800 dark:text-white">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <span>Featured Product Option</span>
                </label>
              </div>

              {/* Specifications addition */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-slate-850 dark:text-white">Technical Specifications</span>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-[10px] text-primary-500 font-bold hover:underline"
                  >
                    + Add Field
                  </button>
                </div>
                {specsList.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Weight"
                      value={item.key}
                      onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 500g"
                      value={item.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Variants addition */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-slate-850 dark:text-white">Product Variants</span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-[10px] text-primary-500 font-bold hover:underline"
                  >
                    + Add Variant Type
                  </button>
                </div>
                {variantsList.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Size"
                      value={item.name}
                      onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="e.g. S, M, L (comma separated)"
                      value={item.options}
                      onChange={(e) => handleVariantChange(idx, 'options', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Images */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Upload Product Images</label>
                <div className="relative border-2 border-dashed border-slate-250 dark:border-slate-800 hover:border-primary-500 rounded-2xl p-6 text-center transition-all bg-slate-50 dark:bg-slate-950 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 block">
                    {files.length > 0 ? `${files.length} images selected` : 'Drag files here or click to browse'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editProductId ? 'Save Product' : 'Create Product'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Category Creation modal in Product View */}
      {showCatAddModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-fade-in text-xs font-semibold">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                Add Category
              </h3>
              <button type="button" onClick={() => setShowCatAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCategory} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Clothing"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Description</label>
                <textarea
                  rows="3"
                  placeholder="Provide short category information..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Category Cover Image</label>
                <div className="relative border border-dashed border-slate-250 dark:border-slate-800 hover:border-primary-500 rounded-2xl p-4 text-center transition-all bg-slate-50 dark:bg-slate-950 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewCatFile(e.target.files[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 block">
                    {newCatFile ? newCatFile.name : 'Select category image cover'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCatAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNewCat}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  {savingNewCat ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Category</span>
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

export default ProductManagement;
