import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import api from '../../services/api';

interface TransactionDetail {
  detail_id: number;
  quantity: number;
  unit_price: number;
  batch: {
    batch_no: string;
    product: {
      product_name: string;
    };
  };
}

interface Transaction {
  transaction_id: number;
  transaction_date: string;
  status: string;
  total_amount: number;
  street?: string;
  city?: string;
  notes?: string;
  transaction_details: TransactionDetail[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', className: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
  rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
};

const MyOrdersPage: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['my-transactions'],
    queryFn: async () => {
      const res = await api.get('/transactions/my');
      return res.data;
    },
  });

  const toggleExpand = (id: number) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingBag className="text-green-600" size={26} />
        Đơn hàng của tôi
      </h1>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-500">Đang tải đơn hàng...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          Không thể tải đơn hàng. Vui lòng thử lại.
        </div>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
        </div>
      )}

      <div className="space-y-4">
        {transactions.map((tx) => {
          const status = statusConfig[tx.status] || { label: tx.status, className: 'bg-gray-100 text-gray-600' };
          const isOpen = expanded === tx.transaction_id;

          return (
            <div key={tx.transaction_id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Header */}
              <div
                className="p-5 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(tx.transaction_id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Đơn hàng #{tx.transaction_id}</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(tx.transaction_date).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                  <span className="font-bold text-green-600 text-lg">
                    {tx.total_amount?.toLocaleString('vi-VN')}đ
                  </span>
                  {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {/* Detail */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  {/* Address */}
                  {(tx.street || tx.city) && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                      <p className="font-medium text-gray-700 mb-1">Địa chỉ giao hàng</p>
                      <p>{[tx.street, tx.city].filter(Boolean).join(', ')}</p>
                      {tx.notes && <p className="text-gray-400 mt-1">Ghi chú: {tx.notes}</p>}
                    </div>
                  )}

                  {/* Products */}
                  <div className="mt-4 space-y-3">
                    <p className="font-medium text-gray-700 text-sm">Sản phẩm</p>
                    {tx.transaction_details?.map((detail) => (
                      <div key={detail.detail_id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                          🌿
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {detail.batch?.product?.product_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Lô: {detail.batch?.batch_no} × {detail.quantity} = {' '}
                            <span className="text-gray-600 font-medium">
                              {(detail.unit_price * detail.quantity).toLocaleString('vi-VN')}đ
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Tổng cộng</p>
                      <p className="font-bold text-green-600 text-xl">{tx.total_amount?.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrdersPage;
