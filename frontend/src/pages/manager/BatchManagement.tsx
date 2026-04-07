import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Boxes, X } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

interface Product { product_id: number; product_name: string; }
interface Batch {
  batch_id: number;
  batch_no: string;
  product_id: number;
  harvest_date: string;
  expiry_date: string;
  initial_quantity: number;
  current_quantity: number;
  status: string;
  product: { product_name: string; garden?: { name: string } };
}

interface BatchForm {
  product_id: string;
  batch_no: string;
  harvest_date: string;
  expiry_date: string;
  initial_quantity: string;
  current_quantity: string;
  status: string;
}

const defaultForm: BatchForm = {
  product_id: '', batch_no: '', harvest_date: '', expiry_date: '',
  initial_quantity: '', current_quantity: '', status: 'available',
};

const statusOptions = [
  { value: 'available', label: 'Có sẵn' },
  { value: 'sold_out', label: 'Hết hàng' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'recalled', label: 'Đã thu hồi' },
];

const statusBadge: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  sold_out: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-700',
  recalled: 'bg-orange-100 text-orange-700',
};

const statusLabel: Record<string, string> = {
  available: 'Có sẵn', sold_out: 'Hết hàng', expired: 'Hết hạn', recalled: 'Thu hồi',
};

const PAGE_SIZE = 10;

const BatchManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BatchForm>(defaultForm);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: batches = [], isLoading } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => (await api.get('/batches')).data,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        product_id: parseInt(form.product_id),
        initial_quantity: parseFloat(form.initial_quantity) || 0,
        current_quantity: parseFloat(form.current_quantity) || 0,
      };
      if (editingId) return api.patch(`/batches/${editingId}`, payload);
      return api.post('/batches', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setShowModal(false); setForm(defaultForm); setEditingId(null);
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Thao tác thất bại.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/batches/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batches'] }); setDeleteConfirm(null); },
    onError: (err: any) => alert(err?.response?.data?.message || 'Xóa thất bại.'),
  });

  const openAdd = () => { setForm(defaultForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (b: Batch) => {
    setForm({
      product_id: String(b.product_id),
      batch_no: b.batch_no,
      harvest_date: b.harvest_date ? b.harvest_date.split('T')[0] : '',
      expiry_date: b.expiry_date ? b.expiry_date.split('T')[0] : '',
      initial_quantity: String(b.initial_quantity),
      current_quantity: String(b.current_quantity),
      status: b.status,
    });
    setEditingId(b.batch_id); setError(''); setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const totalPages = Math.ceil(batches.length / PAGE_SIZE);
  const paged = batches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Boxes className="text-green-600" size={24} /> Quản lý lô hàng
        </h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Thêm lô hàng
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Mã lô', 'Sản phẩm', 'Thu hoạch', 'Hết hạn', 'SL ban đầu', 'SL còn lại', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Chưa có lô hàng nào</td></tr>
                ) : paged.map((b) => (
                  <tr key={b.batch_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-800 text-sm">{b.batch_no}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{b.product?.product_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{new Date(b.harvest_date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{new Date(b.expiry_date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{b.initial_quantity}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{b.current_quantity}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(b)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteConfirm(b.batch_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-800 text-lg">{editingId ? 'Chỉnh sửa lô hàng' : 'Thêm lô hàng'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setError(''); saveMutation.mutate(); }} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm <span className="text-red-500">*</span></label>
                <select name="product_id" value={form.product_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã lô <span className="text-red-500">*</span></label>
                <input type="text" name="batch_no" value={form.batch_no} onChange={handleChange} required placeholder="VD: BATCH-2024-001" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thu hoạch <span className="text-red-500">*</span></label>
                  <input type="date" name="harvest_date" value={form.harvest_date} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn <span className="text-red-500">*</span></label>
                  <input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SL ban đầu (kg) <span className="text-red-500">*</span></label>
                  <input type="number" name="initial_quantity" value={form.initial_quantity} onChange={handleChange} required min="0" placeholder="1000" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SL còn lại (kg)</label>
                  <input type="number" name="current_quantity" value={form.current_quantity} onChange={handleChange} min="0" placeholder="1000" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-lg font-medium flex items-center justify-center">
                  {saveMutation.isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : (editingId ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={40} className="text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 text-lg mb-2">Xác nhận xóa</h3>
            <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa lô hàng này?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm!)} disabled={deleteMutation.isPending} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium">
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
