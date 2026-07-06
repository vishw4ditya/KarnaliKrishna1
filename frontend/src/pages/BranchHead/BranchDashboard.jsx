import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SalesTrendChart } from '../../components/ChartDashboard';
import { CreditCard, Package, ShoppingBag, FileQuestion, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BranchDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [trend, setTrend] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticRes, productRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/products', { params: { branch: user.branchId, status: 'active' } }),
        ]);

        if (analyticRes.data.success) {
          setMetrics(analyticRes.data.metrics);
          setTrend(analyticRes.data.analytics.salesTrend);
        }

        if (productRes.data.success) {
          // Find products where stock is <= 5
          const low = productRes.data.products.filter((p) => p.stockQuantity <= 5);
          setLowStockProducts(low);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.branchId) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading Branch Head Dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.branchName || 'Branch'} Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Merchant portal. Monitor branch-specific inventory, sales and log solved customer issues.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sales */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/20 text-primary-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Branch Sales</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">Rs. {metrics.totalSales.toLocaleString()}</span>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Orders</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.totalOrders}</span>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Products Active</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.totalProducts}</span>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/20 text-rose-600 rounded-xl flex items-center justify-center">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Support Issues</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.totalIssues}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-primary-500" />
              <span>Sales & Revenue Trend</span>
            </h3>
          </div>
          <SalesTrendChart data={trend} />
        </div>

        {/* Low Stock Inventory Warnings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
            <span>Low Stock Alerts</span>
          </h3>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              All inventory levels healthy.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-2 text-xs font-semibold">
              {lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate('/branch/products')}
                  className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer transition-all"
                >
                  <span className="truncate max-w-[120px] text-slate-800 dark:text-slate-200">{p.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stockQuantity === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                    Stock: {p.stockQuantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default BranchDashboard;
