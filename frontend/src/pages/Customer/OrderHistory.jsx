import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Package, Clock, Eye, Download, Calendar } from 'lucide-react';

const OrderHistory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/myorders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400';
      case 'Processing': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400';
      case 'Shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleDownloadInvoice = async (e, orderId, orderNum) => {
    e.stopPropagation();
    try {
      // Trigger native download by fetching URL and piping arrayBuffer
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${orderNum}.pdf`;
      link.click();
    } catch (err) {
      alert('Invoice download failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading order history...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-slate-400 text-sm font-semibold">You have not placed any orders yet.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-all shadow-md"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/order/${order._id}`)}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              {/* Header: Order Number, Date, Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Reference</span>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                    {order.orderNumber}
                  </h4>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items Summary, Branch Name, Price */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs font-semibold text-slate-500">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary-500" />
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-450" />
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-450 block">Amount Paid</span>
                    <span className="text-sm font-black text-slate-850 dark:text-white">Rs. {order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleDownloadInvoice(e, order._id, order.orderNumber)}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                      title={t('orderInvoice')}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="flex items-center gap-1 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Track</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
