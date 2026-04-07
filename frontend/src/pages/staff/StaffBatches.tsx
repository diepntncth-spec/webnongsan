import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Boxes, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

interface MyGarden {
  garden: {
    garden_id: number;
    products: { product_id: number }[];
  };
}

interface Batch {
  batch_id: number;
  batch_no: string;
  harvest_date: string;
  expiry_date: string;
  initial_quantity: number;
  current_quantity: number;
  unit: string;
  status: string;
  product: {
    product_id: number;
    product_name: string;
  };
}

const statusOptions = [
  { value: 'available', label: 'Còn hàng' },
  { value: 'sold_out', label: 'Hết hàng' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'recalled', label: 'Thu hồi' },
];

const statusStyles: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  sold_out:  'bg-gray-100 text-gray-600',
  expired:   'bg-red-100 text-red-700',
  recalled:  'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  available: 'Còn hàng',
  sold_out:  'Hết hàng',
  expired:   'Hết hạn',
  recalled:  'Thu hồi',
};

const PAGE_SIZE = 10;

const StaffBatches: React.FC = () => {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Load staff garden to get product IDs for filtering
  const { data: gardenData } = useQuery<MyGarden>({
    queryKey: ['staff-my-garden'],
    queryFn: async () => (await api.get('/staff/my-garden')).data,
  });

  const { data: batches = [], isLoading } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => (await api.get('/batches')).data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.patch(`/batches/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setUpdatingId(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Cập nhật thất bại.');
      setUpdatingId(null);
    },
  });

  // Filter batches to only show those belonging to garden's products
  const gardenProductIds = new Set(gardenData?.garden?.products?.map((p) => p.product_id) ?? []);
  const myBatches = gardenProductIds.size > 0
    ? batches.filter((b) => gardenProductIds.has(b.product.product_id))
    : batches;

  const totalPages = Math.ceil(myBatches.length / PAGE_SIZE);
  const paged = myBatches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (batch: Batch, newStatus: string) => {
    if (newStatus === batch.status) return;
    setUpdatingId(batch.batch_id);
    updateStatusMutation.mutate({ id: batch.batch_id, status: newStatus });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Boxes className="text-teal-600" size={26} />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lô hàng</h1>
          <p className="text-gray-500 text-sm">Quản lý trạng thái lô hàng trong vườn của bạn</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">{myBatches.length} lô hàng</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Mã lô hàng', 'Sản phẩm', 'Thu hoạch', 'Hết hạn', 'Số lượng', 'Trạng thái'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myBatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Không có lô hàng nào trong vườn của bạn
                    </td>
                  </tr>
                ) : (
                  paged.map((batch) => {
                    const isUpdating = updatingId === batch.batch_id;
                    return (
                      <tr key={batch.batch_id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <span className="font-mono font-semibold text-gray-800 text-sm">{batch.batch_no}</span>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700 text-sm">{batch.product.product_name}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {new Date(batch.harvest_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {new Date(batch.expiry_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          <span className="font-medium">{batch.current_quantity}</span>
                          <span className="text-gray-400">/{batch.initial_quantity} {batch.unit}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative inline-block">
                            <select
                              value={batch.status}
                              onChange={(e) => handleStatusChange(batch, e.target.value)}
                              disabled={isUpdating}
                              className={`appearance-none pr-7 pl-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 ${statusStyles[batch.status] || 'bg-gray-100 text-gray-600'} disabled:opacity-60`}
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                            {isUpdating && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600"></div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBatches;
