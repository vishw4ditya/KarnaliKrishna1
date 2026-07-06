import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Calendar, CreditCard, Clipboard, CheckCircle2, Download, ArrowLeft, Loader2 } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const response = await api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${order.orderNumber}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Invoice download failed.');
    } finally {
      setDownloading(false);
    }
  };

  // Status mapping to identify timeline progress
  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const getStatusIndex = (currentStatus) => {
    if (currentStatus === 'Cancelled') return -1;
    return statuses.indexOf(currentStatus);
  };

  const statusIdx = order ? getStatusIndex(order.status) : -1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading tracking details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-slate-500">
        Order not found or unauthorized access.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order History</span>
      </button>

      {/* Header card info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tracking Reference</span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{order.orderNumber}</h2>
          <span className="text-xs text-slate-400 block font-semibold">
            Placed on: {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{t('orderInvoice')}</span>
        </button>
      </div>

      {/* Visual Timeline Tracker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mb-6 uppercase tracking-wider">
          Order Timeline
        </h3>

        {order.status === 'Cancelled' ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl text-center">
            This order has been Cancelled.
          </div>
        ) : (
          /* Responsive timeline flex */
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-6">
            
            {/* Draw connectors for desktop */}
            <div className="hidden md:block absolute left-0 right-0 top-4 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${(statusIdx / (statuses.length - 1)) * 100}%` }}
              ></div>
            </div>

            {statuses.map((step, idx) => {
              const completed = idx <= statusIdx;
              const active = idx === statusIdx;

              return (
                <div key={step} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 relative z-10 w-full md:w-auto">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all ${
                      completed
                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="text-left md:text-center text-xs">
                    <p className={`font-bold ${completed ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                      {t(step.toLowerCase()) || step}
                    </p>
                    {/* Display date for completed/logged events if matching timeline data exists */}
                    {completed && order.statusTimeline.find((t) => t.status === step) && (
                      <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">
                        {new Date(
                          order.statusTimeline.find((t) => t.status === step).updatedAt
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Delivery details & Billing overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left - Deliver Location and Map */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-4.5 h-4.5 text-primary-500" />
            <span>Delivery Destination</span>
          </h3>

          <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
            <div className="font-bold text-slate-850 dark:text-white">{order.shippingAddress.name}</div>
            <p className="text-slate-500 dark:text-slate-400">
              {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
            <span className="text-slate-400 font-semibold block pt-1.5">
              Contact: {order.shippingAddress.phone}
            </span>
          </div>

          {/* Inline static map picker rendering delivery point */}
          <div className="w-full h-44 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <iframe
              title="Delivery Coordinates Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://maps.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}&z=16&output=embed`}
              className="filter grayscale-[10%] dark:invert dark:hue-rotate-[180deg]"
            ></iframe>
          </div>
        </div>

        {/* Right - Items list & Totals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-1">
            <Clipboard className="w-4.5 h-4.5 text-primary-500" />
            <span>Order Summary</span>
          </h3>

          <div className="space-y-3.5 max-h-48 overflow-y-auto pr-2">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-xs font-semibold">
                <div className="min-w-0">
                  <p className="text-slate-800 dark:text-slate-200 truncate font-bold">{item.name}</p>
                  <span className="text-[10px] text-slate-450 block">
                    {item.variant ? `Variant: ${item.variant} | ` : ''}Qty: {item.quantity}
                  </span>
                </div>
                <span className="text-slate-800 dark:text-slate-105">Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs font-semibold text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-800 dark:text-slate-200">Rs. {order.subTotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-500">
                <span>Discount ({order.coupon?.code || 'Coupon'})</span>
                <span>- Rs. {order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-slate-800 dark:text-slate-200">Rs. {order.shippingCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (13%)</span>
              <span className="text-slate-800 dark:text-slate-200">Rs. {order.vatAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-black text-sm text-slate-850 dark:text-white">
            <span>Total Paid</span>
            <span className="text-primary-600 dark:text-primary-400">Rs. {order.totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800 pt-3">
            <CreditCard className="w-4 h-4" />
            <span>Paid via {order.paymentMethod.toUpperCase()} | Status: {order.paymentStatus.toUpperCase()}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrderTracking;
