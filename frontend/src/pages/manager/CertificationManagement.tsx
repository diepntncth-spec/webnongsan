import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Award, X } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

interface Garden { garden_id: number; name: string; city: string; }
interface Certification {
  certification_id: number;
  name: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  garden_id: number;
  garden: { name: string; city: string };
}

interface CertForm {
  garden_id: string;
  name: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
}

const defaultForm: CertForm = { garden_id: '', name: '', issue_date: '', expiry_date: '', issuing_authority: '' };

const PAGE_SIZE = 10;

const CertificationManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CertForm>(defaultForm);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: certifications = [], isLoading } = useQuery<Certification[]>({
    queryKey: ['certifications'],
    queryFn: async () => (await api.get('/certifications')).data,
  });

  const { data: gardens = [] } = useQuery<Garden[]>({
    queryKey: ['gardens'],
    queryFn: async () => (await api.get('/gardens')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, garden_id: parseInt(form.garden_id) };
      if (editingId) return api.patch(`/certifications/${editingId}`, payload);
      return api.post('/certifications', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      setShowModal(false); setForm(defaultForm); setEditingId(null);
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Thao tác thất bại.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/certifications/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['certifications'] }); setDeleteConfirm(null); },
    onError: (err: any) => alert(err?.response?.data?.message || 'Xóa thất bại.'),
  });

  const openAdd = () => { setForm(defaultForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (c: Certification) => {
    setForm({
      garden_id: String(c.garden_id),
      name: c.name,
      issue_date: c.issue_date ? c.issue_date.split('T')[0] : '',
      expiry_date: c.expiry_date ? c.expiry_date.split('T')[0] : '',
      issuing_authority: c.issuing_authority,
    });
    setEditingId(c.certification_id); setError(''); setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

  const totalPages = Math.ceil(certifications.length / PAGE_SIZE);
  const paged = certifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="text-green-600" size={24} /> Quản lý chứng nhận
        </h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Thêm chứng nhận
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
                  {['Tên chứng nhận', 'Vườn', 'Ngày cấp', 'Hết hạn', 'Cơ quan cấp', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {certifications.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chưa có chứng nhận nào</td></tr>
                ) : paged.map((c) => {
                  const expired = isExpired(c.expiry_date);
                  return (
                    <tr key={c.certification_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Award size={16} className={expired ? 'text-red-400' : 'text-green-500'} />
                          <span className="font-medium text-gray-800 text-sm">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{c.garden?.name}<br /><span className="text-xs text-gray-400">{c.garden?.city}</span></td>
                      <td className="px-4 py-4 text-sm text-gray-600">{new Date(c.issue_date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{new Date(c.expiry_date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{c.issuing_authority}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {expired ? 'Hết hạn' : 'Còn hiệu lực'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteConfirm(c.certification_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                        </div>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 text-lg">{editingId ? 'Chỉnh sửa chứng nhận' : 'Thêm chứng nhận'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setError(''); saveMutation.mutate(); }} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vườn trồng <span className="text-red-500">*</span></label>
                <select name="garden_id" value={form.garden_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  <option value="">-- Chọn vườn --</option>
                  {gardens.map((g) => <option key={g.garden_id} value={g.garden_id}>{g.name} - {g.city}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên chứng nhận <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="VD: VietGAP, GlobalGAP..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cơ quan cấp <span className="text-red-500">*</span></label>
                <input type="text" name="issuing_authority" value={form.issuing_authority} onChange={handleChange} required placeholder="Bộ Nông nghiệp và Phát triển nông thôn" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp <span className="text-red-500">*</span></label>
                  <input type="date" name="issue_date" value={form.issue_date} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn <span className="text-red-500">*</span></label>
                  <input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
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
            <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa chứng nhận này?</p>
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

export default CertificationManagement;
