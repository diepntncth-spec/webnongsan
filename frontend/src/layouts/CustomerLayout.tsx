import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Leaf, LogOut, User, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';

const CustomerLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-green-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Leaf className="text-green-200" size={28} />
              <span className="text-white font-bold text-xl">Nông Sản Sạch</span>
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-2">
              <NavLink to="/" end className={navLinkClass}>
                Trang chủ
              </NavLink>
              <NavLink to="/lookup" className={navLinkClass}>
                <span className="flex items-center gap-1">
                  <Search size={16} />
                  Tra cứu lô hàng
                </span>
              </NavLink>
              <NavLink to="/cart" className={navLinkClass}>
                <span className="flex items-center gap-1">
                  <ShoppingCart size={18} />
                  Giỏ hàng
                  {totalItems > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </span>
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/my-orders" className={navLinkClass}>
                    Đơn hàng
                  </NavLink>
                  <NavLink to="/my-reports" className={navLinkClass}>
                    Báo cáo của tôi
                  </NavLink>
                </>
              )}
            </div>

            {/* Auth section */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                        isActive ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`
                    }
                  >
                    <User size={16} />
                    {user.username}
                  </NavLink>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-green-100 hover:text-white font-medium transition-colors"
                  >
                    Đăng nhập
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-4 py-2 bg-white text-green-700 hover:bg-green-50 font-medium rounded-lg transition-colors"
                  >
                    Đăng ký
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-green-200 text-center py-6 mt-12">
        <p className="font-medium">© 2024 Nông Sản Sạch - Nền tảng nông sản sạch, chống hàng giả</p>
      </footer>
    </div>
  );
};

export default CustomerLayout;
