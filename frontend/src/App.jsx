import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public & Customer Pages
import Home from './pages/Customer/Home';
import ProductDetails from './pages/Customer/ProductDetails';
import Cart from './pages/Customer/Cart';
import Checkout from './pages/Customer/Checkout';
import OrderHistory from './pages/Customer/OrderHistory';
import OrderTracking from './pages/Customer/OrderTracking';
import Profile from './pages/Customer/Profile';
import Support from './pages/Customer/Support';

// Auth Pages
import Login from './pages/Auth/Login';
import RegisterCustomer from './pages/Auth/RegisterCustomer';
import RegisterBranchHead from './pages/Auth/RegisterBranchHead';
import PendingApproval from './pages/Auth/PendingApproval';

// Branch Head Pages
import BranchDashboard from './pages/BranchHead/BranchDashboard';
import ProductManagement from './pages/BranchHead/ProductManagement';
import OrderManagement from './pages/BranchHead/OrderManagement';
import IssueReporting from './pages/BranchHead/IssueReporting';

// Super Admin Pages
import AdminDashboard from './pages/SuperAdmin/AdminDashboard';
import BranchManagement from './pages/SuperAdmin/BranchManagement';
import BranchHeadApproval from './pages/SuperAdmin/BranchHeadApproval';
import WebsiteSettings from './pages/SuperAdmin/WebsiteSettings';

// Route guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Routes>
          {/* Public / Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/support" element={<Support />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterCustomer />} />
          <Route path="/register-branch-head" element={<RegisterBranchHead />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Customer Protected Routes */}
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={['customer']}><OrderHistory /></ProtectedRoute>
          } />
          <Route path="/order/:id" element={
            <ProtectedRoute allowedRoles={['customer']}><OrderTracking /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['customer', 'branch_head', 'super_admin']}><Profile /></ProtectedRoute>
          } />

          {/* Branch Head Protected Routes */}
          <Route path="/branch/dashboard" element={
            <ProtectedRoute allowedRoles={['branch_head']}><BranchDashboard /></ProtectedRoute>
          } />
          <Route path="/branch/products" element={
            <ProtectedRoute allowedRoles={['branch_head']}><ProductManagement /></ProtectedRoute>
          } />
          <Route path="/branch/orders" element={
            <ProtectedRoute allowedRoles={['branch_head']}><OrderManagement /></ProtectedRoute>
          } />
          <Route path="/branch/issues" element={
            <ProtectedRoute allowedRoles={['branch_head']}><IssueReporting /></ProtectedRoute>
          } />

          {/* Super Admin Protected Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/branches" element={
            <ProtectedRoute allowedRoles={['super_admin']}><BranchManagement /></ProtectedRoute>
          } />
          <Route path="/admin/approvals" element={
            <ProtectedRoute allowedRoles={['super_admin']}><BranchHeadApproval /></ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['super_admin']}><OrderManagement /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['super_admin']}><WebsiteSettings /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
