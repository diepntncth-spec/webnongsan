import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, totalAmount, addToCart } = useCart();
  const navigate = useNavigate();

  const updateQty = (batchId: number, newQty: number) => {
    if (newQty < 1) return;
    const item = items.find((i) => i.batch_id === batchId);
    if (!item) return;
    // Remove then re-add with new quantity (replace)
    removeFromCart(batchId);
    addToCart(
      {
        batch_id: item.batch_id,
        product_id: item.product_id,
        product_name: item.product_name,
        batch_no: item.batch_no,
        unit_price: item.unit_price,
      },
      newQty
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingCart className="text-green-600" size={26} />
        Giỏ hàng của bạn
      </h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Giỏ hàng đang trống</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.batch_id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    🌿
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{item.product_name}</h3>
                    <p className="text-sm text-gray-500">Lô: {item.batch_no}</p>
                    <p className="text-green-600 font-medium mt-1">
                      {item.unit_price.toLocaleString('vi-VN')}đ / kg
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.batch_id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.batch_id, item.quantity - 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-medium text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.batch_id, item.quantity + 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Thành tiền</p>
                    <p className="font-bold text-green-600 text-lg">
                      {(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Tóm tắt đơn hàng</h3>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.batch_id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate pr-2">{item.product_name} × {item.quantity}</span>
                    <span className="flex-shrink-0">{(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-800 text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-green-600">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Đặt hàng
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full mt-3 text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
