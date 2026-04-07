import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import CustomerLayout from './layouts/CustomerLayout';
import ManagerLayout from './layouts/ManagerLayout';
import StaffLayout from './layouts/StaffLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LookupPage from './pages/LookupPage';

import HomePage from './pages/customer/HomePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import MyReportsPage from './pages/customer/MyReportsPage';
import ProfilePage from './pages/customer/ProfilePage';

import ManagerDashboard from './pages/manager/ManagerDashboard';
import GardenManagement from './pages/manager/GardenManagement';
import ProductManagement from './pages/manager/ProductManagement';
import BatchManagement from './pages/manager/BatchManagement';
import TransactionManagement from './pages/manager/TransactionManagement';
import ReportManagement from './pages/manager/ReportManagement';
import StaffManagement from './pages/manager/StaffManagement';
import CertificationManagement from './pages/manager/CertificationManagement';

import StaffDashboard from './pages/staff/StaffDashboard';
import StaffMyGarden from './pages/staff/StaffMyGarden';
import StaffBatches from './pages/staff/StaffBatches';

const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  if (!user || user.type !== 'manager') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  if (!user || user.type !== 'staff') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="lookup" element={<LookupPage />} />
        <Route path="cart" element={<AuthRoute><CartPage /></AuthRoute>} />
        <Route path="checkout" element={<AuthRoute><CheckoutPage /></AuthRoute>} />
        <Route path="my-orders" element={<AuthRoute><MyOrdersPage /></AuthRoute>} />
        <Route path="my-reports" element={<AuthRoute><MyReportsPage /></AuthRoute>} />
        <Route path="profile" element={<AuthRoute><ProfilePage /></AuthRoute>} />
      </Route>

      {/* Manager routes */}
      <Route path="/manager" element={<ManagerRoute><ManagerLayout /></ManagerRoute>}>
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="gardens" element={<GardenManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="batches" element={<BatchManagement />} />
        <Route path="transactions" element={<TransactionManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="certifications" element={<CertificationManagement />} />
      </Route>

      {/* Staff routes */}
      <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="my-garden" element={<StaffMyGarden />} />
        <Route path="batches" element={<StaffBatches />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
