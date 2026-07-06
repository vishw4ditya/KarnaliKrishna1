import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SalesTrendChart, BranchPerformanceChart } from '../../components/ChartDashboard';
import { CreditCard, Package, ShoppingBag, FileQuestion, Users, MapPin, Ticket, Download, TrendingUp, BarChart2 } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [trend, setTrend] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Export States
  const [reportType, setReportType] = useState('sales');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setMetrics(res.data.metrics);
        setTrend(res.data.analytics.salesTrend);
        setPerformance(res.data.analytics.branchPerformance);
      }
    } catch (err) {
      console.error('Error fetching admin analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (e) => {
    e.preventDefault();
    setDownloading(true);
    try {
      const response = await api.get('/admin/reports/export', {
        params: { type: reportType, format: reportFormat },
        responseType: 'blob',
      });

      const mime = reportFormat === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      const ext = reportFormat === 'excel' ? 'xlsx' : 'pdf';

      const blob = new Blob([response.data], { type: mime });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${reportType}_report_${Date.now()}.${ext}`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Report download failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading Owner Dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-fade-in text-xs font-semibold">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Owner Admin Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1 font-semibold">
          Platform-wide metrics. Monitor sales trends, download excel reports, audit branch performance.
        </p>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          
          {/* Sales */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Total Sales</span>
            <span className="text-sm font-black text-slate-900 dark:text-white block truncate">Rs.{metrics.totalSales.toLocaleString()}</span>
          </div>

          {/* Orders */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Orders</span>
            <span className="text-sm font-black text-slate-900 dark:text-white block">{metrics.totalOrders}</span>
          </div>

          {/* Customers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Customers</span>
            <span className="text-sm font-black text-slate-900 dark:text-white block">{metrics.totalCustomers}</span>
          </div>

          {/* Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Products</span>
            <span className="text-sm font-black text-slate-900 dark:text-white block">{metrics.totalProducts}</span>
          </div>

          {/* Branches */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Branches</span>
            <span className="text-sm font-black text-slate-900 dark:text-white block">{metrics.totalBranches}</span>
          </div>

          {/* Coupons */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Coupons</span>
            <span className="text-sm font-black text-slate-900 dark:text-white block">{metrics.totalCoupons}</span>
          </div>

          {/* Issues */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Support Issues</span>
            <span className="text-sm font-black text-slate-900 dark:text-white block">{metrics.totalIssues}</span>
          </div>

        </div>
      )}

      {/* Grid: Charts & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-primary-500" />
            <span>Revenue Growth (Daily)</span>
          </h3>
          <SalesTrendChart data={trend} />
        </div>

        {/* Export Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4.5 h-4.5 text-primary-500" />
              <span>Export Reports Hub</span>
            </h3>

            <div className="space-y-4 pt-2">
              {/* Type Select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-450 uppercase block">Report Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="sales">Sales & Earnings Report</option>
                  <option value="orders">Purchase Orders Report</option>
                  <option value="customers">Registered Shoppers List</option>
                  <option value="branches">Branch Performance Audit</option>
                  <option value="issues">Customer Issues Log</option>
                </select>
              </div>

              {/* Format Select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-450 uppercase block">File Format</label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="pdf">Adobe PDF Format (.pdf)</option>
                  <option value="excel">Microsoft Excel Spreadsheet (.xlsx)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="w-full py-3 mt-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            {downloading ? 'Downloading...' : 'Export Document'}
          </button>
        </div>

      </div>

      {/* Row 2: Branch comparisons chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider mb-6 flex items-center gap-1.5">
          <BarChart2 className="w-4.5 h-4.5 text-primary-500" />
          <span>Branch Earnings Audit (Nepal Performance)</span>
        </h3>
        <BranchPerformanceChart data={performance} />
      </div>

    </div>
  );
};

export default AdminDashboard;
