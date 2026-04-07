import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TreePine, Boxes, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/staff/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/staff/my-garden', label: 'Vườn của tôi', icon: TreePine },
  { to: '/staff/batches', label: 'Lô hàng', icon: Boxes },
];

const StaffLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-teal-700 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-6 py-5 cursor-pointer border-b border-teal-600"
          onClick={() => navigate('/staff/dashboard')}
        >
          <Leaf className="text-teal-300" size={26} />
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
                    ? 'bg-teal-500 text-white font-semibold'
                    : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-4 border-t border-teal-600">
          <div className="text-teal-300 text-xs mb-1">Nhân viên</div>
          <div className="text-white font-medium text-sm truncate">
            {user?.username}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-gray-700 font-semibold text-lg">Cổng nhân viên</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">
              Xin chào, <span className="font-semibold text-teal-700">{user?.username}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
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

export default StaffLayout;
