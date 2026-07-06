import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Search, SlidersHorizontal, ShoppingCart, Star, MapPin, Grid, Layers, CreditCard, Droplet, Sparkles } from 'lucide-react';
import logo from '../../assets/logo.jpg';

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [loading, setLoading] = useState(true);

  // Fetch Filters & Catalog
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, branchRes] = await Promise.all([
          api.get('/categories'),
          api.get('/branches'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (branchRes.data.success) setBranches(branchRes.data.branches);
      } catch (err) {
        console.error('Error fetching categories/branches list:', err);
      }
    };
    fetchFilters();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBranch) params.branch = selectedBranch;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCatalog();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword, selectedCategory, selectedBranch, minPrice, maxPrice]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    // Retrieve existing cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item) => item.productId === product._id);

    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        alert(`Cannot add more. Only ${product.stockQuantity} items in stock.`);
        return;
      }
      existing.quantity += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        image: product.images[0] || '',
        variant: product.variants[0]?.options[0] || '',
        stockQuantity: product.stockQuantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger navbar event
    window.dispatchEvent(new Event('cart-updated'));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 transition-colors duration-300">
      
      {/* Visual Promo Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-sky-900 via-primary-800 to-indigo-950 text-white p-8 md:p-12 shadow-xl border border-sky-500/25">
        {/* Animated Water Wave Layers */}
        <div className="absolute bottom-0 left-0 w-full h-[60px] overflow-hidden leading-none z-0 opacity-15">
          <svg className="absolute bottom-0 left-0 w-[200%] h-full fill-current text-sky-200 animate-wave-slow" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1300,20 1450,60 C1600,100 1750,20 1900,60 L1900,120 L0,120 Z" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-[200%] h-[80%] fill-current text-cyan-200 animate-wave-fast" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,50 C150,90 300,10 450,50 C600,90 750,10 900,50 C1050,90 1200,10 1350,50 C1500,90 1650,10 1800,50 L1800,120 L0,120 Z" />
          </svg>
        </div>

        {/* Floating Water Bubbles Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="water-bubble left-[8%] w-6 h-6" style={{ animationDelay: '0s', animationDuration: '8s' }} />
          <div className="water-bubble left-[22%] w-3 h-3" style={{ animationDelay: '1.5s', animationDuration: '6s' }} />
          <div className="water-bubble left-[38%] w-8 h-8" style={{ animationDelay: '0.5s', animationDuration: '11s' }} />
          <div className="water-bubble left-[55%] w-4 h-4" style={{ animationDelay: '3s', animationDuration: '9s' }} />
          <div className="water-bubble left-[72%] w-7 h-7" style={{ animationDelay: '2s', animationDuration: '10s' }} />
          <div className="water-bubble left-[85%] w-5 h-5" style={{ animationDelay: '4s', animationDuration: '7s' }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Hero text */}
          <div className="max-w-lg space-y-5 text-left">
            <span className="inline-flex items-center gap-1.5 bg-sky-400/20 border border-sky-400/30 text-sky-200 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider animate-pulse">
              <Droplet className="w-3 h-3 fill-current text-sky-300" />
              PURE & TRUSTED IN NEPAL
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-cyan-200">
              Welcome to <span className="liquid-text font-black">KarnaliKrishna</span>
            </h1>
            <p className="text-sm md:text-base text-sky-100/90 font-medium leading-relaxed">
              Explore pure water purifiers, services, and local branch offerings in Kathmandu, Lalitpur, Pokhara, and beyond. Fast delivery with real-time GPS coordinates.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedBranch('');
                  setKeyword('');
                }}
                className="px-6 py-3 bg-white text-primary-800 hover:bg-sky-50 font-extrabold rounded-xl text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary-500 fill-current" />
                Explore Catalog
              </button>
            </div>
          </div>

          {/* Floating Logo Badge Container */}
          <div className="relative flex-shrink-0 animate-float-water z-10">
            {/* Pulsing Water Ripples */}
            <div className="absolute inset-0 rounded-full bg-sky-500/10 animate-water-ripple" />
            <div className="relative aqua-glass p-6 md:p-8 rounded-3xl flex flex-col items-center text-center max-w-[280px]">
              <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white/90 shadow-xl bg-white mb-4">
                <img
                  src={logo}
                  alt="KarnaliKrishna Purifier Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-extrabold text-white text-base">Karnali Krishna</h3>
              <p className="text-xs text-sky-200 font-semibold mt-1">Purifier Pvt. Ltd.</p>
              <span className="text-[10px] text-sky-300/80 font-bold uppercase tracking-wider mt-3 bg-white/10 px-2 py-0.5 rounded-full">
                Ghorahi-15 Dang
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Filter Column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Filters</h3>
          </div>

          {/* Categories select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none"
            >
              <option value="">{t('allCategories')}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Branches select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none"
            >
              <option value="">{t('allBranches')}</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Price Range (Rs.)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Catalog Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all text-sm font-medium"
            />
          </div>

          {/* Catalog products list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 text-sm">
              {t('noProducts')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isFeatured && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                    {product.stockQuantity === 0 && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 bg-slate-600/90 text-white text-[9px] font-bold rounded-md">
                        {t('outOfStock')}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-primary-500 tracking-wider">
                        {product.category?.name || 'Item'}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {product.averageRating.toFixed(1)}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                      {product.name}
                    </h4>

                    {/* Branch Badge */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{product.branch?.name}</span>
                    </div>

                    {/* Pricing details */}
                    <div className="flex items-end justify-between pt-3 mt-auto">
                      <div className="flex flex-col">
                        {product.salePrice < product.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through font-semibold">
                            Rs. {product.originalPrice}
                          </span>
                        )}
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Rs. {product.salePrice}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stockQuantity === 0}
                        className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-md disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400"
                        title={t('addToCart')}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
