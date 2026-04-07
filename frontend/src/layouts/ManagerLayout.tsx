import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TreePine,
  Package,
  Boxes,
  ShoppingCart,
  AlertTriangle,
  Users,
  Award,
  Leaf,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manager/gardens', label: 'Vườn trồng', icon: TreePine },
  { to: '/manager/products', label: 'Sản phẩm', icon: Package },
  { to: '/manager/batches', label: 'Lô hàng', icon: Boxes },
  { to: '/manager/transactions', label: 'Đơn hàng', icon: ShoppingCart },
  { to: '/manager/reports', label: 'Báo cáo hàng giả', icon: AlertTriangle },
  { to: '/manager/staff', label: 'Nhân viên', icon: Users },
  { to: '/manager/certifications', label: 'Chứng nhận', icon: Award },
];

const ManagerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-6 py-5 cursor-pointer border-b border-green-700"
          onClick={() => navigate('/manager/dashboard')}
        >
          <Leaf className="text-green-300" size={26} />
          <span className="text-white font-bold text-lg">Nông Sản Sạch</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-green-600 text-white font-semibold'
                    : 'text-green-200 hover:bg-green-700 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-4 border-t border-green-700">
          <div className="text-green-300 text-xs mb-2">Quản lý</div>
          <div className="text-white font-medium text-sm truncate">
            {user?.manager?.full_name || user?.username}
          </div>
          {user?.manager?.organization_name && (
            <div className="text-green-400 text-xs truncate">{user.manager.organization_name}</div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-gray-700 font-semibold text-lg">Hệ thống quản lý nông sản</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">
              Xin chào, <span className="font-semibold text-green-700">{user?.manager?.full_name || user?.username}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
