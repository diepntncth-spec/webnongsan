import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, TreePine, X } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

interface Garden {
  garden_id: number;
  name: string;
  area: number;
  city: string;
  street?: string;
  soil_type?: string;
  manager?: { full_name: string };
  _count?: { staff: number; products: number };
}

interface GardenForm {
  name: string;
  area: string;
  street: string;
  city: string;
  soil_type: string;
}

const defaultForm: GardenForm = { name: '', area: '', street: '', city: '', soil_type: '' };

const PAGE_SIZE = 10;

const GardenManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GardenForm>(defaultForm);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: gardens = [], isLoading } = useQuery<Garden[]>({
    queryKey: ['gardens'],
    queryFn: async () => (await api.get('/gardens')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, area: parseFloat(form.area) || 0 };
      if (editingId) {
        return api.patch(`/gardens/${editingId}`, payload);
      }
      return api.post('/gardens', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardens'] });
      setShowModal(false);
      setForm(defaultForm);
      setEditingId(null);
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Thao tác thất bại.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/gardens/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardens'] });
      setDeleteConfirm(null);
    },
    onError: (err: any) => alert(err?.response?.data?.message || 'Xóa thất bại.'),
  });

  const openAdd = () => { setForm(defaultForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (g: Garden) => {
    setForm({ name: g.name, area: String(g.area), street: g.street || '', city: g.city, soil_type: g.soil_type || '' });
    setEditingId(g.garden_id); setError(''); setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    saveMutation.mutate();
  };

  const totalPages = Math.ceil(gardens.length / PAGE_SIZE);
  const paged = gardens.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TreePine className="text-green-600" size={24} /> Quản lý vườn trồng
        </h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Thêm vườn
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
                  {['Tên vườn', 'Thành phố', 'Diện tích (ha)', 'Loại đất', 'Nhân viên', 'Sản phẩm', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gardens.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chưa có vườn trồng nào</td></tr>
                ) : paged.map((g) => (
                  <tr key={g.garden_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{g.name}</p>
                      {g.street && <p className="text-xs text-gray-400">{g.street}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{g.city}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{g.area}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{g.soil_type || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{g._count?.staff || 0}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{g._count?.products || 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(g)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(g.garden_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 text-lg">{editingId ? 'Chỉnh sửa vườn' : 'Thêm vườn trồng'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
              {[
                { name: 'name', label: 'Tên vườn', required: true, placeholder: 'Vườn Đà Lạt' },
                { name: 'city', label: 'Thành phố', required: true, placeholder: 'Đà Lạt' },
                { name: 'street', label: 'Địa chỉ', required: false, placeholder: '123 Đường Hoa' },
                { name: 'area', label: 'Diện tích (ha)', required: false, placeholder: '5.5', type: 'number' },
                { name: 'soil_type', label: 'Loại đất', required: false, placeholder: 'Đất đỏ bazan' },
              ].map(({ name, label, required, placeholder, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
                  <input
                    type={type || 'text'}
                    name={name}
                    value={form[name as keyof GardenForm]}
                    onChange={handleChange}
                    required={required}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
                  {saveMutation.isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : (editingId ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <Trash2 size={40} className="text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 text-lg mb-2">Xác nhận xóa</h3>
            <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa vườn trồng này?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Hủy</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenManagement;
