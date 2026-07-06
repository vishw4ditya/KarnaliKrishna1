import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LocationPicker from '../../components/LocationPicker';
import { MapPin, CreditCard, ChevronRight, Plus, CheckCircle, Navigation } from 'lucide-react';

const Checkout = () => {
  const { user, addAddress } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [checkoutSummary, setCheckoutSummary] = useState(null);

  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

  // New Address Form
  const [addressName, setAddressName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState(27.7172);
  const [longitude, setLongitude] = useState(85.324);
  const [savingAddress, setSavingAddress] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);

  // Recipient details state
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');

  // Load website configurations (including Fonepay settings)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setRecipientName(prev => prev || user.name || '');
      setRecipientPhone(prev => prev || user.phone || '');
    }
  }, [user]);

  // Load Checkout details
  useEffect(() => {
    // Redirect if no items in cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    const summary = sessionStorage.getItem('checkout_summary');
    if (summary) {
      setCheckoutSummary(JSON.parse(summary));
    }

    // Set first address as default if user has addresses
    if (user && user.addresses && user.addresses.length > 0) {
      const def = user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
      setSelectedAddressId(def._id);
    }
  }, [user, navigate]);

  // Handle callback from Map picker
  const handleLocationPicked = (loc) => {
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    if (loc.addressLine) setAddressLine(loc.addressLine);
    if (loc.city) setCity(loc.city);
    if (loc.state) setState(loc.state);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressName.trim() || !addressLine.trim() || !city.trim() || !state.trim()) {
      alert('Please fill out all address details.');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await addAddress({
        name: addressName,
        addressLine,
        city,
        state,
        latitude,
        longitude,
      });

      if (res.success) {
        // Automatically select the new address
        const latest = res.addresses[res.addresses.length - 1];
        if (latest) {
          setSelectedAddressId(latest._id);
        }
        setShowAddAddress(false);
        setAddressName('');
        setAddressLine('');
        setCity('');
        setState('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrderSubmit = async () => {
    if (!recipientName.trim()) {
      setError("Please provide the recipient's name.");
      return;
    }

    if (!recipientPhone.trim()) {
      setError("Please provide the recipient's phone number.");
      return;
    }

    if (!selectedAddressId) {
      setError('Please select or add a shipping address.');
      return;
    }

    const chosenAddress = user.addresses.find((addr) => addr._id === selectedAddressId);
    if (!chosenAddress) {
      setError('Selected address invalid');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) return;

    setError('');
    setLoading(true);

    try {
      const payload = {
        items: cart,
        shippingAddress: {
          name: recipientName,
          addressLine: chosenAddress.addressLine,
          city: chosenAddress.city,
          state: chosenAddress.state,
          latitude: chosenAddress.latitude,
          longitude: chosenAddress.longitude,
          phone: recipientPhone,
        },
        couponCode: checkoutSummary ? checkoutSummary.couponCode : '',
        paymentMethod,
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        // Clear cart
        localStorage.removeItem('cart');
        sessionStorage.removeItem('checkout_summary');
        window.dispatchEvent(new Event('cart-updated'));

        alert('Order placed successfully! Routing to Tracking Timeline.');
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please review stock limits.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
      
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
        <span>Cart</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-white">Checkout</span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Review & Checkout</h1>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recipient Details Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-4 animate-fade-in">
            <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              1. Customer Info / Delivery Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Krishna Dev"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9841234567"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm">2. Shipping Address</h3>
              {!showAddAddress && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-1 text-xs text-primary-500 font-bold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* List addresses */}
            {!showAddAddress ? (
              user?.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex gap-3 items-start p-4 border rounded-xl cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-primary-500 bg-primary-500/5' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950'}`}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="mt-1"
                      />
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{addr.name}</span>
                          {addr.isDefault && (
                            <span className="bg-primary-100 text-primary-600 px-2 py-0.5 rounded text-[9px] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">{addr.addressLine}, {addr.city}, {addr.state}</p>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          GPS: {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  No saved addresses. Click "Add New Address" below to use GPS tagging.
                </div>
              )
            ) : (
              // Add address form containing GPS map picker
              <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Address Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home, Office, Parents"
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                {/* Map Coordinates GPS Picker */}
                <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                  <span className="text-xs font-bold text-slate-400 block mb-2">GPS Location Detection</span>
                  <LocationPicker
                    onLocationSelected={handleLocationPicked}
                    initialLocation={{ lat: latitude, lng: longitude, addressLine, city, state }}
                  />
                </div>

                <div className="flex gap-3 justify-end text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl"
                  >
                    {savingAddress ? 'Saving Address...' : 'Save & Select'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              3. Payment Method
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* COD */}
              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-500/5' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="sr-only"
                />
                <span className="text-xs font-extrabold text-slate-850 dark:text-white">COD</span>
                <span className="text-[9px] text-slate-400 mt-1 font-semibold text-center">Cash on Delivery</span>
              </label>

              {/* eSewa */}
              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'esewa' ? 'border-primary-500 bg-primary-500/5' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'esewa'}
                  onChange={() => setPaymentMethod('esewa')}
                  className="sr-only"
                />
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">eSewa</span>
                <span className="text-[9px] text-slate-400 mt-1 font-semibold text-center">Digital Wallet</span>
              </label>

              {/* Khalti */}
              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'khalti' ? 'border-primary-500 bg-primary-500/5' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'khalti'}
                  onChange={() => setPaymentMethod('khalti')}
                  className="sr-only"
                />
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">Khalti</span>
                <span className="text-[9px] text-slate-400 mt-1 font-semibold text-center">Digital Wallet</span>
              </label>

              {/* Fonepay */}
              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'fonepay' ? 'border-primary-500 bg-primary-500/5' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'fonepay'}
                  onChange={() => setPaymentMethod('fonepay')}
                  className="sr-only"
                />
                <span className="text-xs font-extrabold text-red-600 dark:text-red-400">Fonepay</span>
                <span className="text-[9px] text-slate-400 mt-1 font-semibold text-center">Mobile Banking / QR</span>
              </label>
            </div>

            {paymentMethod === 'fonepay' && checkoutSummary && (
              <div className="p-5 border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 rounded-2xl flex flex-col items-center gap-4 animate-fade-in">
                <div className="text-center space-y-1">
                  <h4 className="font-extrabold text-red-600 dark:text-red-400 text-sm">Fonepay Merchant QR Code</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    Scan with your Mobile Banking App or Fonepay to pay Rs. {checkoutSummary.totalAmount.toFixed(2)}
                  </p>
                  {settings?.fonepayMerchantCode && (
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                      Merchant: {settings.fonepayMerchantCode} {settings.fonepayStoreCode ? `| Store: ${settings.fonepayStoreCode}` : ''}
                    </p>
                  )}
                </div>
                <div className="bg-white p-3 rounded-xl shadow-inner border border-red-100">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=ef4444&data=${encodeURIComponent(`fonepay://pay?merchant=${settings?.fonepayMerchantCode || 'KarnaliKrishna'}&store=${settings?.fonepayStoreCode || 'Default'}&amount=${checkoutSummary.totalAmount.toFixed(2)}`)}`} 
                    alt="Fonepay Merchant QR" 
                    className="w-44 h-44"
                  />
                </div>
                <div className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Simulated Live payment gateway</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Summary Billing Panel */}
        {checkoutSummary && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl h-fit space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm">Order Summary</h3>

            <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-800 dark:text-slate-200">Rs. {checkoutSummary.subTotal.toFixed(2)}</span>
              </div>
              
              {checkoutSummary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount ({checkoutSummary.couponCode})</span>
                  <span>- Rs. {checkoutSummary.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Charge</span>
                <span className="text-slate-800 dark:text-slate-200">Rs. {checkoutSummary.shippingCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>VAT (13%)</span>
                <span className="text-slate-800 dark:text-slate-200">Rs. {checkoutSummary.vatAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between font-black text-slate-850 dark:text-slate-100 text-sm py-2">
              <span>Total Amount</span>
              <span className="text-primary-600 dark:text-primary-400">Rs. {checkoutSummary.totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrderSubmit}
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
