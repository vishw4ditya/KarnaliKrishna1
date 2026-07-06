import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggler from './LanguageToggler';
import ThemeToggler from './ThemeToggler';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Store, HelpCircle, Shield, Briefcase } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Poll localStorage cart length
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    // Listen for custom cart events dispatched inside App
    window.addEventListener('cart-updated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400';
  };

  return (
    <nav className="sticky top-0 z-50 aqua-glass shadow-sm py-3.5 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 text-xl md:text-2xl font-extrabold tracking-tight text-primary-600 dark:text-primary-400" id="navbar-brand">
          <img src={logo} alt="KarnaliKrishna Logo" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-primary-500/30 shadow-sm animate-float-water" />
          <span className="font-sans font-extrabold">{t('brand')}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {/* Guest Links */}
          {!user && (
            <>
              <Link to="/" className={isActive('/')}>{t('home')}</Link>
              <Link to="/login" className="px-4 py-2 text-primary-600 dark:text-primary-400 border border-primary-500/20 hover:bg-primary-500/5 rounded-lg transition-all">{t('login')}</Link>
              <Link to="/register" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-md hover:shadow-primary-500/10">{t('register')}</Link>
            </>
          )}

          {/* Customer Links */}
          {user && user.role === 'customer' && (
            <>
              <Link to="/" className={isActive('/')}>{t('home')}</Link>
              <Link to="/support" className={isActive('/support')}>{t('support')}</Link>
              <Link to="/orders" className={isActive('/orders')}>{t('orderTimeline')}</Link>
              <Link to="/profile" className={isActive('/profile')}>{t('profile')}</Link>
              
              <Link to="/cart" className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400" id="cart-nav-link">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Branch Head Links */}
          {user && user.role === 'branch_head' && (
            <>
              <Link to="/branch/dashboard" className={`${isActive('/branch/dashboard')} flex items-center gap-1.5`}>
                <Briefcase className="w-4 h-4" />
                {t('dashboard')}
              </Link>
              <Link to="/branch/products" className={isActive('/branch/products')}>{t('totalProducts')}</Link>
              <Link to="/branch/orders" className={isActive('/branch/orders')}>{t('totalOrders')}</Link>
              <Link to="/branch/issues" className={isActive('/branch/issues')}>{t('issueReport')}</Link>
              <Link to="/profile" className={isActive('/profile')}>{t('profile')}</Link>
            </>
          )}

          {/* Super Admin Links */}
          {user && user.role === 'super_admin' && (
            <>
              <Link to="/admin/dashboard" className={`${isActive('/admin/dashboard')} flex items-center gap-1.5`}>
                <Shield className="w-4 h-4" />
                {t('dashboard')}
              </Link>
              <Link to="/admin/branches" className={isActive('/admin/branches')}>{t('totalBranches')}</Link>
              <Link to="/admin/orders" className={isActive('/admin/orders')}>{t('totalOrders')}</Link>
              <Link to="/admin/approvals" className={isActive('/admin/approvals')}>{t('pendingApproval')}</Link>
              <Link to="/admin/settings" className={isActive('/admin/settings')}>{t('settings')}</Link>
              <Link to="/profile" className={isActive('/profile')}>{t('profile')}</Link>
            </>
          )}

          {/* User Sign-Out */}
          {user && (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">{user.name} ({user.role})</span>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title={t('logout')}>
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Global Widgets */}
          <div className="flex items-center gap-2">
            <LanguageToggler />
            <ThemeToggler />
          </div>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          {user && user.role === 'customer' && (
            <Link to="/cart" className="relative p-2 text-slate-600 dark:text-slate-300">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <LanguageToggler />
          <ThemeToggler />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-4 shadow-xl flex flex-col gap-4 animate-fade-in">
          {/* Guest */}
          {!user && (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={isActive('/')}>{t('home')}</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-center text-primary-600 dark:text-primary-400 border border-primary-500/20 rounded-lg">{t('login')}</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-center bg-primary-600 text-white rounded-lg">{t('register')}</Link>
            </>
          )}

          {/* Customer */}
          {user && user.role === 'customer' && (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={isActive('/')}>{t('home')}</Link>
              <Link to="/support" onClick={() => setMobileMenuOpen(false)} className={isActive('/support')}>{t('support')}</Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className={isActive('/orders')}>{t('orderTimeline')}</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={isActive('/profile')}>{t('profile')}</Link>
            </>
          )}

          {/* Branch Head */}
          {user && user.role === 'branch_head' && (
            <>
              <Link to="/branch/dashboard" onClick={() => setMobileMenuOpen(false)} className={isActive('/branch/dashboard')}>{t('dashboard')}</Link>
              <Link to="/branch/products" onClick={() => setMobileMenuOpen(false)} className={isActive('/branch/products')}>{t('totalProducts')}</Link>
              <Link to="/branch/orders" onClick={() => setMobileMenuOpen(false)} className={isActive('/branch/orders')}>{t('totalOrders')}</Link>
              <Link to="/branch/issues" onClick={() => setMobileMenuOpen(false)} className={isActive('/branch/issues')}>{t('issueReport')}</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={isActive('/profile')}>{t('profile')}</Link>
            </>
          )}

          {/* Super Admin */}
          {user && user.role === 'super_admin' && (
            <>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className={isActive('/admin/dashboard')}>{t('dashboard')}</Link>
              <Link to="/admin/branches" onClick={() => setMobileMenuOpen(false)} className={isActive('/admin/branches')}>{t('totalBranches')}</Link>
              <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)} className={isActive('/admin/orders')}>{t('totalOrders')}</Link>
              <Link to="/admin/approvals" onClick={() => setMobileMenuOpen(false)} className={isActive('/admin/approvals')}>{t('pendingApproval')}</Link>
              <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)} className={isActive('/admin/settings')}>{t('settings')}</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={isActive('/profile')}>{t('profile')}</Link>
            </>
          )}

          {user && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{user.name} ({user.role})</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-rose-500 font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
