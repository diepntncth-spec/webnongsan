import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, ShoppingBag, CheckCircle, Phone } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({
    street: '',
    city: '',
    phone: user?.customer?.phone_number || '',
    notes: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const phoneNote = form.phone ? `SĐT: ${form.phone}` : '';
      const combinedNotes = [phoneNote, form.notes].filter(Boolean).join('\n');
      const payload = {
        street: form.street,
        city: form.city,
        notes: combinedNotes || undefined,
        items: items.map((item) => ({
          batch_id: item.batch_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };
      const res = await api.post('/transactions', payload);
      return res.data;
    },
    onSuccess: () => {
      clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/my-orders'), 2000);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    setError('');
    mutation.mutate();
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="bg-white rounded-2xl shadow-md p-10">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-500">Đang chuyển đến trang đơn hàng...</p>
          <div className="mt-4 animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="bg-white rounded-2xl shadow-md p-10">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-3">Giỏ hàng trống</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Mua sắm ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingBag className="text-green-600" size={26} />
        Xác nhận đơn hàng
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <MapPin size={18} className="text-green-600" />
            Địa chỉ giao hàng
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ cụ thể <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
                required
                placeholder="Số nhà, tên đường, phường/xã..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone size={14} className="text-green-600" /> Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                required
                placeholder="VD: 0912345678"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thành phố / Tỉnh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                required
                placeholder="VD: Hà Nội, TP. Hồ Chí Minh..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                placeholder="Ghi chú cho người giao hàng..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {mutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Xác nhận đặt hàng'
              )}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-gray-800 mb-5">Tóm tắt đơn hàng</h2>

          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.batch_id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  🌿
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                  <p className="text-xs text-gray-400">Lô: {item.batch_no} × {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                  {(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tạm tính</span>
              <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Phí vận chuyển</span>
              <span className="text-green-600 font-medium">Miễn phí</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-lg border-t border-gray-200 pt-3">
              <span>Tổng cộng</span>
              <span className="text-green-600">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
