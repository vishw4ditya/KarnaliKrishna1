import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Trash2, ShoppingBag, ArrowRight, Ticket, Check } from 'lucide-react';

const Cart = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const [shippingCharge, setShippingCharge] = useState(100); // Default Rs. 100
  const [vatRate, setVatRate] = useState(13); // Default 13%

  // Load website settings and cart
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);

    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          setShippingCharge(res.data.settings.shippingCharge);
          setVatRate(res.data.settings.vatRate);
        }
      } catch (err) {
        console.error('Settings fetch failed:', err);
      }
    };
    fetchSettings();
  }, []);

  const saveCart = (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleQtyChange = (itemId, change) => {
    const updated = cartItems.map((item) => {
      if (item.cartItemId === itemId || item.productId === itemId) {
        const newQty = item.quantity + change;
        if (newQty > item.stockQuantity) {
          alert(`Insufficient stock. Only ${item.stockQuantity} items available.`);
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });
    saveCart(updated);
    setAppliedCoupon(null); // Reset coupon to revalidate on new subtotal
    setCouponSuccess('');
  };

  const handleRemove = (itemId) => {
    const updated = cartItems.filter((item) => item.cartItemId !== itemId && item.productId !== itemId);
    saveCart(updated);
    setAppliedCoupon(null);
    setCouponSuccess('');
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    setCouponSuccess('');
    setLoadingCoupon(true);

    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        subTotal,
      });

      if (res.data.success) {
        setAppliedCoupon(res.data);
        setCouponSuccess(`Coupon '${res.data.code}' applied successfully!`);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setLoadingCoupon(false);
    }
  };

  // Math
  const subTotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableAmount = Math.max(0, subTotal - discountAmount);
  const vatAmount = Math.round((taxableAmount * (vatRate / 100)) * 100) / 100;
  const grandTotal = taxableAmount + vatAmount + (subTotal > 0 ? shippingCharge : 0);

  const handleCheckoutRedirect = () => {
    // Save checkout summary details in session storage
    sessionStorage.setItem(
      'checkout_summary',
      JSON.stringify({
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        discountAmount,
        subTotal,
        vatAmount,
        shippingCharge,
        totalAmount: grandTotal,
      })
    );
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your basket is empty</h2>
        <p className="text-sm text-slate-400 max-w-xs">Looks like you haven't added any products to your cart yet.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.cartItemId || item.productId}
              className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                  {item.name}
                </h4>
                {item.variant && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {item.variant}
                  </span>
                )}
                <span className="block text-xs font-semibold text-slate-400">
                  Rs. {item.price} each
                </span>
              </div>

              {/* Adjust Qty */}
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 text-xs">
                <button
                  onClick={() => handleQtyChange(item.cartItemId || item.productId, -1)}
                  className="px-2.5 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  -
                </button>
                <span className="px-3 font-extrabold">{item.quantity}</span>
                <button
                  onClick={() => handleQtyChange(item.cartItemId || item.productId, 1)}
                  className="px-2.5 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  +
                </button>
              </div>

              {/* Delete Icon */}
              <button
                onClick={() => handleRemove(item.cartItemId || item.productId)}
                className="p-2 hover:text-rose-500 text-slate-400 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Summary panel */}
        <div className="space-y-6">
          
          {/* Coupon Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-1">
              <Ticket className="w-4 h-4 text-primary-500" />
              <span>Apply Coupon</span>
            </h3>

            {couponSuccess && (
              <div className="mb-3.5 p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{couponSuccess}</span>
              </div>
            )}
            {couponError && (
              <div className="mb-3.5 p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-[10px] font-semibold rounded-lg">
                {couponError}
              </div>
            )}

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. EXTRA10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs uppercase font-semibold text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loadingCoupon}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 text-white rounded-xl text-xs font-bold transition-all"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Pricing calculations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Order Summary</h3>

            <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-800 dark:text-slate-200">Rs. {subTotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span>
                  <span>- Rs. {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Charge</span>
                <span className="text-slate-800 dark:text-slate-200">Rs. {shippingCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>VAT ({vatRate}%)</span>
                <span className="text-slate-800 dark:text-slate-200">Rs. {vatAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-black text-slate-850 dark:text-slate-100">
              <span>Grand Total</span>
              <span className="text-primary-600 dark:text-primary-400">Rs. {grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary-500/20"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
