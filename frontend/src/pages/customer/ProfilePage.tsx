import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Phone, Mail, Lock, Pencil, Check, X, KeyRound } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Profile {
  account_id: number;
  username: string;
  email: string;
  type: string;
  customer?: {
    customer_id: number;
    full_name: string;
    phone_number?: string;
  };
  manager?: {
    manager_id: number;
    full_name: string;
    phone_number?: string;
  };
}

const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { loadUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone_number: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/auth/profile/me')).data,
  });

  const getDisplayName = (p: Profile) => p.customer?.full_name || p.manager?.full_name || p.username;
  const getPhone = (p: Profile) => p.customer?.phone_number || p.manager?.phone_number || '';

  const startEdit = () => {
    if (!profile) return;
    setEditForm({ full_name: getDisplayName(profile), phone_number: getPhone(profile) });
    setEditError('');
    setEditSuccess('');
    setEditMode(true);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.put('/auth/profile', { full_name: editForm.full_name, phone_number: editForm.phone_number });
    },
    onSuccess: async () => {
      setEditSuccess('Cập nhật thông tin thành công!');
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      await loadUser();
      setTimeout(() => setEditSuccess(''), 3000);
    },
    onError: (err: any) => {
      setEditError(err?.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    },
  });

  const pwMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/change-password', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
    },
    onSuccess: () => {
      setPwSuccess('Đổi mật khẩu thành công!');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    },
    onError: (err: any) => {
      setPwError(err?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    },
  });

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!pwForm.old_password || !pwForm.new_password) {
      setPwError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (pwForm.new_password.length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError('Xác nhận mật khẩu không khớp.');
      return;
    }
    pwMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <User className="text-green-600" size={26} />
        Tài khoản của tôi
      </h1>

      {/* Profile Info Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {getDisplayName(profile).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">{getDisplayName(profile)}</h2>
              <span className="text-green-100 text-sm capitalize">{profile.type === 'customer' ? 'Khách hàng' : 'Quản lý'}</span>
            </div>
          </div>
          {!editMode && (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Pencil size={15} />
              Chỉnh sửa
            </button>
          )}
        </div>

        <div className="p-6">
          {editSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
              <Check size={16} /> {editSuccess}
            </div>
          )}

          {editMode ? (
            <form
              onSubmit={(e) => { e.preventDefault(); setEditError(''); updateMutation.mutate(); }}
              className="space-y-4"
            >
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {editError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone_number: e.target.value }))}
                  placeholder="0901234567"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              {/* Read-only fields */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tên đăng nhập (không thể đổi)</label>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email (không thể đổi)</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditMode(false); setEditError(''); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <X size={16} /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <><Check size={16} /> Lưu thay đổi</>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <User size={18} className="text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Họ và tên</p>
                  <p className="font-medium text-gray-800">{getDisplayName(profile)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Phone size={18} className="text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-800">{getPhone(profile) || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-600">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Tên đăng nhập</p>
                  <p className="font-medium text-gray-600">{profile.username}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <KeyRound size={20} className="text-green-600" />
          <h3 className="font-bold text-gray-800 text-lg">Đổi mật khẩu</h3>
        </div>
        <form onSubmit={handlePwSubmit} className="p-6 space-y-4">
          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
              <Check size={16} /> {pwSuccess}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={pwForm.old_password}
                onChange={(e) => setPwForm((p) => ({ ...p, old_password: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={pwForm.new_password}
                onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                placeholder="Ít nhất 6 ký tự"
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={pwMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {pwMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Đổi mật khẩu'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
