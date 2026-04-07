import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, X, Eye } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

interface TransactionDetail {
  detail_id: number;
  quantity: number;
  unit_price: number;
  batch: { batch_no: string; product: { product_name: string } };
}

interface Transaction {
  transaction_id: number;
  transaction_date: string;
  status: string;
  total_amount: number;
  street?: string;
  city?: string;
  notes?: string;
  customer: { full_name: string; phone_number?: string; account: { username: string } };
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

const statusOptions = Object.entries(statusConfig).map(([value, { label }]) => ({ value, label }));

const PAGE_SIZE = 10;

const TransactionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusError, setStatusError] = useState('');
  const [page, setPage] = useState(1);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => (await api.get('/transactions')).data,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return api.patch(`/transactions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (selectedTx) {
        setSelectedTx((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      setStatusError('');
    },
    onError: (err: any) => setStatusError(err?.response?.data?.message || 'Cập nhật thất bại.'),
  });

  const openDetail = (tx: Transaction) => {
    setSelectedTx(tx);
    setNewStatus(tx.status);
    setStatusError('');
  };

  const handleStatusUpdate = () => {
    if (!selectedTx) return;
    statusMutation.mutate({ id: selectedTx.transaction_id, status: newStatus });
  };

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paged = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingCart className="text-green-600" size={24} /> Quản lý đơn hàng
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Mã đơn', 'Khách hàng', 'Ngày đặt', 'Trạng thái', 'Tổng tiền', 'Chi tiết'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chưa có đơn hàng nào</td></tr>
                ) : paged.map((tx) => {
                  const st = statusConfig[tx.status] || { label: tx.status, className: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={tx.transaction_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(tx)}>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">#{tx.transaction_id}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-800">{tx.customer?.full_name}</p>
                        <p className="text-xs text-gray-400">@{tx.customer?.account?.username}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {new Date(tx.transaction_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${st.className}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-4 font-medium text-green-600 text-sm">
                        {tx.total_amount?.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); openDetail(tx); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-800 text-lg">Đơn hàng #{selectedTx.transaction_id}</h2>
              <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Thông tin khách hàng</p>
                <p className="font-medium text-gray-800">{selectedTx.customer?.full_name}</p>
                <p className="text-sm text-gray-500">@{selectedTx.customer?.account?.username}</p>
                {selectedTx.customer?.phone_number && (
                  <p className="text-sm text-gray-600 mt-1">📞 {selectedTx.customer.phone_number}</p>
                )}
                {/* Phone from notes if stored there */}
                {!selectedTx.customer?.phone_number && selectedTx.notes?.startsWith('SĐT:') && (
                  <p className="text-sm text-gray-600 mt-1">📞 {selectedTx.notes.split('\n')[0].replace('SĐT: ', '')}</p>
                )}
              </div>

              {/* Address */}
              {(selectedTx.street || selectedTx.city) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Địa chỉ giao hàng</p>
                  <p className="text-sm text-gray-700">{[selectedTx.street, selectedTx.city].filter(Boolean).join(', ')}</p>
                  {selectedTx.notes && (() => {
                    const lines = selectedTx.notes!.split('\n');
                    const noteLines = lines.filter(l => !l.startsWith('SĐT:'));
                    return noteLines.length > 0
                      ? <p className="text-sm text-gray-400 mt-1">Ghi chú: {noteLines.join('\n')}</p>
                      : null;
                  })()}
                </div>
              )}

              {/* Products */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedTx.transaction_details?.map((d) => (
                    <div key={d.detail_id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.batch?.product?.product_name}</p>
                        <p className="text-xs text-gray-400">Lô: {d.batch?.batch_no} × {d.quantity} kg</p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{(d.unit_price * d.quantity).toLocaleString('vi-VN')}đ</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3">
                  <p className="font-bold text-green-600 text-lg">Tổng: {selectedTx.total_amount?.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>

              {/* Status update */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Cập nhật trạng thái</p>
                {statusError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm mb-3">{statusError}</div>
                )}
                <div className="flex gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={statusMutation.isPending || newStatus === selectedTx.status}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {statusMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
