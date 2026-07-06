import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShoppingBag, Eye, Calendar, MapPin, Download, Edit3, X, Save, Check, Loader2 } from 'lucide-react';

const OrderManagement = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [statusNote, setStatusNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // View Details modal
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    fetchBranchOrders();
  }, [user]);

  const fetchBranchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'super_admin' ? '/orders' : '/orders/branch';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-500';
      case 'Confirmed': return 'text-blue-500';
      case 'Processing': return 'text-indigo-500';
      case 'Shipped': return 'text-purple-500';
      case 'Delivered': return 'text-emerald-500';
      case 'Cancelled': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSavingStatus(true);
    try {
      const res = await api.put(`/orders/${selectedOrder._id}/status`, {
        status,
        note: statusNote.trim() || `Status updated to ${status}`,
      });

      if (res.data.success) {
        setSelectedOrder(null);
        fetchBranchOrders();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDownloadInvoice = async (orderId, orderNum) => {
    try {
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {user?.role === 'super_admin' ? 'All Platform Orders' : 'Customer Orders'}
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-semibold">
          {user?.role === 'super_admin' 
            ? 'Track and update timelines for orders across all branches in Nepal.' 
            : 'Track, confirm, ship, and update timelines for orders incoming to your branch.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          Loading branch orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs animate-fade-in">
          {user?.role === 'super_admin' ? 'No orders placed on the platform yet.' : 'No orders received at your branch yet.'}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold uppercase">
                  <th className="p-4">Order Reference</th>
                  {user?.role === 'super_admin' && <th className="p-4">Branch</th>}
                  <th className="p-4">Customer</th>
                  <th className="p-4">Order Details</th>
                  <th className="p-4">Billing (Rs.)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-semibold">
                    <td className="p-4 space-y-1">
                      <p className="font-extrabold text-slate-900 dark:text-white">{o.orderNumber}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    {user?.role === 'super_admin' && (
                      <td className="p-4 text-primary-600 dark:text-primary-400 font-bold">
                        {o.branch?.name || 'Central'}
                      </td>
                    )}
                    <td className="p-4 space-y-0.5">
                      <p className="text-slate-850 dark:text-slate-100 font-extrabold">{o.shippingAddress?.name || o.customer?.name || 'Guest'}</p>
                      <p className="text-[10px] text-slate-900 dark:text-white font-bold">Phone: {o.shippingAddress?.phone || o.customer?.phone || 'N/A'}</p>
                      <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold truncate block max-w-[180px]">
                        Account: {o.customer?.name} ({o.customer?.email})
                      </p>
                    </td>
                    <td className="p-4 space-y-1 max-w-[200px]">
                      <p className="truncate text-slate-600 dark:text-slate-350">
                        {o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        <span className="truncate">{o.shippingAddress.addressLine}, {o.shippingAddress.city}</span>
                      </div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="text-slate-850 dark:text-white font-bold">Rs. {o.totalAmount}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">{o.paymentMethod} - {o.paymentStatus}</p>
                    </td>
                    <td className="p-4">
                      <span className={`capitalize font-bold ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewOrder(o)}
                          className="p-1.5 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Customer & Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(o)}
                          className="p-1.5 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Update Status Timeline"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(o._id, o.orderNumber)}
                          className="p-1.5 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-4 h-4" />
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

      {/* Timeline Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-fade-in">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-950 dark:text-white">
                Update Order Timeline ({selectedOrder.orderNumber})
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Status Update Note</label>
                <textarea
                  rows="3"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Order confirmed, preparing for packing..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  {savingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Status</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Order & Customer Details Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-fade-in text-xs font-semibold text-slate-600 dark:text-slate-350">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-950 dark:text-white text-sm">
                Order & Customer Details ({viewOrder.orderNumber})
              </h3>
              <button onClick={() => setViewOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Customer and Recipient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Registered Account Info */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary-600 tracking-wider">
                    Customer Account details
                  </h4>
                  <div className="space-y-1.5">
                    <p className="text-slate-400">Account Name:</p>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">{viewOrder.customer?.name || 'Guest'}</p>
                    
                    <p className="text-slate-400 mt-2">Registered Email:</p>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">{viewOrder.customer?.email || 'N/A'}</p>
                    
                    <p className="text-slate-400 mt-2">Registered Phone:</p>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">{viewOrder.customer?.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Shipping & Delivery Info */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary-600 tracking-wider">
                    Recipient & Delivery details
                  </h4>
                  <div className="space-y-1.5">
                    <p className="text-slate-400">Recipient Name:</p>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">{viewOrder.shippingAddress?.name || 'N/A'}</p>
                    
                    <p className="text-slate-400 mt-2">Delivery Phone:</p>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">{viewOrder.shippingAddress?.phone || 'N/A'}</p>
                    
                    <p className="text-slate-400 mt-2">Shipping Address:</p>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-xs leading-normal">
                      {viewOrder.shippingAddress?.addressLine}, {viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.state}
                    </p>
                    
                    <p className="text-slate-400 mt-2">GPS Coordinates:</p>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-[10px]">
                      Latitude: {viewOrder.shippingAddress?.latitude?.toFixed(6)}, Longitude: {viewOrder.shippingAddress?.longitude?.toFixed(6)}
                    </p>
                  </div>
                </div>

              </div>

              {/* Items Summary */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Ordered Items
                </h4>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {viewOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800" 
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-850 dark:text-slate-200 font-bold truncate">{item.name}</p>
                        {item.variant && <p className="text-[10px] text-slate-400">Variant: {item.variant}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-slate-850 dark:text-slate-200 font-bold">Rs. {item.price}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Billing Details */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <p>Order Branch: <span className="text-primary-600 font-bold">{viewOrder.branch?.name || 'Central'}</span></p>
                  <p>Order Date: <span className="text-slate-800 dark:text-slate-200">{new Date(viewOrder.createdAt).toLocaleString()}</span></p>
                  <p>Payment: <span className="text-slate-800 dark:text-slate-200 uppercase">{viewOrder.paymentMethod} ({viewOrder.paymentStatus})</span></p>
                  <p>Timeline Status: <span className="text-primary-500 font-bold">{viewOrder.status}</span></p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl space-y-2 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Rs. {viewOrder.subTotal?.toFixed(2)}</span>
                  </div>
                  {viewOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Discount ({viewOrder.coupon?.code}):</span>
                      <span className="font-bold">- Rs. {viewOrder.discountAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping Charge:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Rs. {viewOrder.shippingCharge?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>VAT (13%):</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Rs. {viewOrder.vatAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-900 dark:text-white">
                    <span>Total Amount:</span>
                    <span className="text-primary-600 dark:text-primary-400">Rs. {viewOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

              </div>

            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setViewOrder(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-750 font-bold rounded-xl"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;
