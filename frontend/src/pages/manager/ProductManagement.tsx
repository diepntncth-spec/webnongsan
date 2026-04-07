import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, X } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

interface Garden { garden_id: number; name: string; city: string; }
interface Product {
  product_id: number;
  product_name: string;
  type: string;
  quality: string;
  unit_price: number;
  species?: string;
  description?: string;
  garden_id: number;
  garden: { name: string; city: string };
  _count?: { batches: number };
}

interface ProductForm {
  product_name: string;
  garden_id: string;
  type: string;
  quality: string;
  species: string;
  description: string;
  unit_price: string;
}

const defaultForm: ProductForm = {
  product_name: '', garden_id: '', type: '', quality: '',
  species: '', description: '', unit_price: '',
};

const qualityOptions = ['Loại 1', 'Hữu cơ', 'VietGAP', 'Loại 2'];
const typeOptions = ['Rau', 'Quả', 'Củ', 'Hạt', 'Khác'];

const qualityBadge: Record<string, string> = {
  'Loại 1': 'bg-blue-100 text-blue-700',
  'Hữu cơ': 'bg-green-100 text-green-700',
  'VietGAP': 'bg-emerald-100 text-emerald-700',
  'Loại 2': 'bg-gray-100 text-gray-600',
};

const PAGE_SIZE = 10;

const ProductManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
  });

  const { data: gardens = [] } = useQuery<Garden[]>({
    queryKey: ['gardens'],
    queryFn: async () => (await api.get('/gardens')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        garden_id: parseInt(form.garden_id),
        unit_price: parseFloat(form.unit_price) || 0,
      };
      if (editingId) return api.patch(`/products/${editingId}`, payload);
      return api.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowModal(false); setForm(defaultForm); setEditingId(null);
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Thao tác thất bại.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setDeleteConfirm(null); },
    onError: (err: any) => alert(err?.response?.data?.message || 'Xóa thất bại.'),
  });

  const openAdd = () => { setForm(defaultForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (p: Product) => {
    setForm({
      product_name: p.product_name, garden_id: String(p.garden_id), type: p.type,
      quality: p.quality, species: p.species || '', description: p.description || '',
      unit_price: String(p.unit_price),
    });
    setEditingId(p.product_id); setError(''); setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paged = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-green-600" size={24} /> Quản lý sản phẩm
        </h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Tên sản phẩm', 'Loại', 'Chất lượng', 'Giá (đ/kg)', 'Vườn', 'Số lô', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chưa có sản phẩm nào</td></tr>
                ) : paged.map((p) => (
                  <tr key={p.product_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{p.product_name}</p>
                      {p.species && <p className="text-xs text-gray-400">Giống: {p.species}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.type}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${qualityBadge[p.quality] || 'bg-gray-100 text-gray-600'}`}>
                        {p.quality}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-green-600">{p.unit_price?.toLocaleString('vi-VN')}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.garden?.name}<br /><span className="text-xs text-gray-400">{p.garden?.city}</span></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p._count?.batches || 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteConfirm(p.product_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-800 text-lg">{editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setError(''); saveMutation.mutate(); }} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input type="text" name="product_name" value={form.product_name} onChange={handleChange} required placeholder="Cà chua bi" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vườn trồng <span className="text-red-500">*</span></label>
                <select name="garden_id" value={form.garden_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  <option value="">-- Chọn vườn --</option>
                  {gardens.map((g) => <option key={g.garden_id} value={g.garden_id}>{g.name} - {g.city}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại <span className="text-red-500">*</span></label>
                  <select name="type" value={form.type} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">-- Chọn loại --</option>
                    {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chất lượng <span className="text-red-500">*</span></label>
                  <select name="quality" value={form.quality} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">-- Chọn chất lượng --</option>
                    {qualityOptions.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giống</label>
                  <input type="text" name="species" value={form.species} onChange={handleChange} placeholder="Giống Cherry" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (đ/kg) <span className="text-red-500">*</span></label>
                  <input type="number" name="unit_price" value={form.unit_price} onChange={handleChange} required min="0" placeholder="50000" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Mô tả sản phẩm..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
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
            <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa sản phẩm này?</p>
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

export default ProductManagement;
