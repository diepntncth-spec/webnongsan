import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Users, X, UserPlus } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

interface Garden { garden_id: number; name: string; city: string; }
interface Staff {
  staff_id: number;
  full_name: string;
  phone?: string;
  position?: string;
  garden_id: number;
  garden: { name: string; city: string };
  account?: { account_id: number; username: string } | null;
}

interface AccountForm {
  username: string;
  password: string;
  email: string;
}

interface StaffForm {
  full_name: string;
  phone: string;
  position: string;
  garden_id: string;
}

const defaultForm: StaffForm = { full_name: '', phone: '', position: '', garden_id: '' };

const PAGE_SIZE = 10;

const StaffManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<StaffForm>(defaultForm);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Account creation state
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountTargetStaff, setAccountTargetStaff] = useState<Staff | null>(null);
  const [accountForm, setAccountForm] = useState<AccountForm>({ username: '', password: '', email: '' });
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState(false);

  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => (await api.get('/staff')).data,
  });

  const { data: gardens = [] } = useQuery<Garden[]>({
    queryKey: ['gardens'],
    queryFn: async () => (await api.get('/gardens')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, garden_id: parseInt(form.garden_id) };
      if (editingId) return api.patch(`/staff/${editingId}`, payload);
      return api.post('/staff', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setShowModal(false); setForm(defaultForm); setEditingId(null);
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Thao tác thất bại.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/staff/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['staff'] }); setDeleteConfirm(null); },
    onError: (err: any) => alert(err?.response?.data?.message || 'Xóa thất bại.'),
  });

  const createAccountMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/register-staff', {
        staff_id: accountTargetStaff?.staff_id,
        username: accountForm.username,
        password: accountForm.password,
        email: accountForm.email,
      });
    },
    onSuccess: () => {
      setAccountSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setTimeout(() => {
        setShowAccountModal(false);
        setAccountSuccess(false);
        setAccountTargetStaff(null);
        setAccountForm({ username: '', password: '', email: '' });
      }, 1800);
    },
    onError: (err: any) => setAccountError(err?.response?.data?.message || 'Tạo tài khoản thất bại.'),
  });

  const openAccountModal = (s: Staff) => {
    setAccountTargetStaff(s);
    setAccountForm({ username: '', password: '', email: '' });
    setAccountError('');
    setAccountSuccess(false);
    setShowAccountModal(true);
  };

  const openAdd = () => { setForm(defaultForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (s: Staff) => {
    setForm({ full_name: s.full_name, phone: s.phone || '', position: s.position || '', garden_id: String(s.garden_id) });
    setEditingId(s.staff_id); setError(''); setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const totalPages = Math.ceil(staff.length / PAGE_SIZE);
  const paged = staff.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-green-600" size={24} /> Quản lý nhân viên
        </h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Thêm nhân viên
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
                  {['Họ tên', 'Số điện thoại', 'Chức vụ', 'Vườn', 'Tài khoản', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chưa có nhân viên nào</td></tr>
                ) : paged.map((s) => (
                  <tr key={s.staff_id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm flex-shrink-0">
                          {s.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{s.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{s.phone || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{s.position || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{s.garden?.name}<br /><span className="text-xs text-gray-400">{s.garden?.city}</span></td>
                    <td className="px-5 py-4">
                      {s.account ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          @{s.account.username}
                        </span>
                      ) : (
                        <button
                          onClick={() => openAccountModal(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors"
                        >
                          <UserPlus size={13} /> Tạo tài khoản
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteConfirm(s.staff_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 text-lg">{editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setError(''); saveMutation.mutate(); }} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="0901234567" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                <input type="text" name="position" value={form.position} onChange={handleChange} placeholder="Kỹ thuật viên, Bảo vệ..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vườn trồng <span className="text-red-500">*</span></label>
                <select name="garden_id" value={form.garden_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  <option value="">-- Chọn vườn --</option>
                  {gardens.map((g) => <option key={g.garden_id} value={g.garden_id}>{g.name} - {g.city}</option>)}
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
            <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa nhân viên này?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm!)} disabled={deleteMutation.isPending} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium">
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showAccountModal && accountTargetStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <UserPlus size={18} className="text-blue-500" />
                Tạo tài khoản cho <span className="text-blue-600 ml-1">{accountTargetStaff.full_name}</span>
              </h2>
              <button onClick={() => setShowAccountModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="p-6">
              {accountSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserPlus size={24} className="text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Tạo tài khoản thành công!</h3>
                  <p className="text-gray-500 text-sm mt-1">Nhân viên có thể đăng nhập ngay.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setAccountError(''); createAccountMutation.mutate(); }}
                  className="space-y-4"
                >
                  {accountError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{accountError}</div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={accountForm.username}
                      onChange={(e) => setAccountForm((p) => ({ ...p, username: e.target.value }))}
                      required
                      placeholder="username"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))}
                      required
                      placeholder="email@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      value={accountForm.password}
                      onChange={(e) => setAccountForm((p) => ({ ...p, password: e.target.value }))}
                      required
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAccountModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Hủy</button>
                    <button
                      type="submit"
                      disabled={createAccountMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium flex items-center justify-center"
                    >
                      {createAccountMutation.isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Tạo tài khoản'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
